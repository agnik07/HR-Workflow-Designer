/**
 * HR Workflow Designer - Express Backend
 * Provides REST API for automations list, workflow simulation and CRUD.
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = 8001;

// ---------- Middlewares ----------
app.use(cors({ origin: (process.env.CORS_ORIGINS || '*').split(','), credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

// ---------- MongoDB ----------
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

mongoose
  .connect(MONGO_URL, { dbName: DB_NAME })
  .then(() => console.log(`[mongo] connected to ${DB_NAME}`))
  .catch((err) => console.error('[mongo] connection error', err));

// ---------- Schemas ----------
const workflowSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    viewport: { type: Object, default: { x: 0, y: 0, zoom: 1 } },
  },
  { timestamps: true }
);
workflowSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
const Workflow = mongoose.model('Workflow', workflowSchema);

// ---------- Static Data: Automations ----------
const AUTOMATIONS = [
  {
    id: 'send_email',
    label: 'Send Email',
    description: 'Send a templated email to a recipient.',
    params: [
      { key: 'to', label: 'Recipient', type: 'text', placeholder: 'user@company.com' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Welcome to the team' },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Email body content...' },
    ],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    description: 'Generate a PDF/document from a template.',
    params: [
      { key: 'template', label: 'Template', type: 'select', options: ['Offer Letter', 'NDA', 'Payslip', 'Certificate'] },
      { key: 'recipient', label: 'Recipient', type: 'text', placeholder: 'Employee name' },
    ],
  },
  {
    id: 'notify_hr',
    label: 'Notify HR',
    description: 'Send an internal notification to an HR team.',
    params: [
      { key: 'department', label: 'Department', type: 'select', options: ['HR Ops', 'Recruitment', 'Payroll', 'HRBP'] },
      { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Notification text' },
    ],
  },
  {
    id: 'create_ticket',
    label: 'Create Ticket',
    description: 'Raise a ticket in the HR ticketing system.',
    params: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Ticket title' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
    ],
  },
  {
    id: 'provision_access',
    label: 'Provision Access',
    description: 'Auto-provision system access for a new hire.',
    params: [
      { key: 'system', label: 'System', type: 'select', options: ['Email', 'Slack', 'GitHub', 'Jira', 'AWS'] },
      { key: 'role', label: 'Role', type: 'text', placeholder: 'Role name' },
    ],
  },
];

// ---------- Helpers ----------
function validateGraph(nodes = [], edges = []) {
  const errors = [];
  if (!Array.isArray(nodes) || nodes.length === 0) {
    errors.push('Workflow has no nodes');
    return errors;
  }

  const starts = nodes.filter((n) => n.type === 'start');
  const ends = nodes.filter((n) => n.type === 'end');
  if (starts.length === 0) errors.push('Workflow must have a Start node');
  if (starts.length > 1) errors.push('Only one Start node is allowed');
  if (ends.length === 0) errors.push('Workflow must have at least one End node');

  // orphan nodes check
  const nodeIds = new Set(nodes.map((n) => n.id));
  const connected = new Set();
  edges.forEach((e) => {
    if (nodeIds.has(e.source)) connected.add(e.source);
    if (nodeIds.has(e.target)) connected.add(e.target);
  });
  const orphans = nodes.filter((n) => !connected.has(n.id) && nodes.length > 1);
  if (orphans.length > 0) {
    errors.push(`${orphans.length} orphan node(s) not connected to the flow`);
  }

  // cycle detection (DFS)
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};
  nodes.forEach((n) => (color[n.id] = WHITE));
  let hasCycle = false;
  function dfs(u) {
    color[u] = GRAY;
    for (const v of adj[u] || []) {
      if (color[v] === GRAY) {
        hasCycle = true;
        return;
      }
      if (color[v] === WHITE) dfs(v);
    }
    color[u] = BLACK;
  }
  for (const n of nodes) {
    if (color[n.id] === WHITE) dfs(n.id);
    if (hasCycle) break;
  }
  if (hasCycle) errors.push('Workflow contains a cycle');

  return errors;
}

function simulateWorkflow(nodes = [], edges = []) {
  const logs = [];
  const push = (level, message) =>
    logs.push({ level, message, timestamp: new Date().toISOString() });

  const start = nodes.find((n) => n.type === 'start');
  if (!start) {
    push('error', 'No Start node found. Cannot simulate workflow.');
    return { success: false, logs };
  }

  // adjacency
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  push('info', `Workflow started: "${start.data?.title || 'Start'}"`);

  // BFS/DFS from start
  const visited = new Set();
  const queue = [start.id];
  let steps = 0;
  const MAX_STEPS = 200;

  while (queue.length && steps < MAX_STEPS) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    const node = byId[currentId];
    if (!node) continue;
    steps += 1;

    switch (node.type) {
      case 'start':
        // already logged
        break;
      case 'task': {
        const assignee = node.data?.assignee || 'Unassigned';
        const title = node.data?.title || 'Task';
        push('info', `Task "${title}" assigned to ${assignee}`);
        if (node.data?.dueDate) push('info', `  Due by ${node.data.dueDate}`);
        break;
      }
      case 'approval': {
        const role = node.data?.approverRole || 'Manager';
        const title = node.data?.title || 'Approval';
        push('info', `Approval requested: "${title}" from ${role}`);
        const threshold = Number(node.data?.autoApproveThreshold || 0);
        if (threshold > 0) {
          push('success', `  Auto-approved (threshold ${threshold} met)`);
        } else {
          push('success', `  ${role} approved`);
        }
        break;
      }
      case 'automated': {
        const action = node.data?.action || 'unknown';
        const title = node.data?.title || 'Automation';
        const auto = AUTOMATIONS.find((a) => a.id === action);
        push('info', `Automation executing: "${title}" (${auto?.label || action})`);
        const params = node.data?.params || {};
        Object.entries(params).forEach(([k, v]) => {
          if (v) push('info', `  • ${k}: ${v}`);
        });
        push('success', `  Automation "${auto?.label || action}" completed`);
        break;
      }
      case 'end': {
        const msg = node.data?.endMessage || 'Workflow completed';
        push('success', msg);
        if (node.data?.showSummary) {
          push('info', `  Summary: executed ${steps} step(s) across ${visited.size} node(s)`);
        }
        break;
      }
      default:
        push('info', `Visited node ${node.id}`);
    }

    for (const next of adj[currentId] || []) {
      if (!visited.has(next)) queue.push(next);
    }
  }

  const endVisited = [...visited].some((id) => byId[id]?.type === 'end');
  if (!endVisited) push('error', 'Workflow did not reach any End node');

  return { success: endVisited, logs };
}

// ---------- Routes ----------
app.get('/api/', (_req, res) => res.json({ message: 'HR Workflow Designer API', ok: true }));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
);

app.get('/api/automations', (_req, res) => {
  res.json(AUTOMATIONS);
});

app.post('/api/validate', (req, res) => {
  const { nodes = [], edges = [] } = req.body || {};
  const errors = validateGraph(nodes, edges);
  res.json({ valid: errors.length === 0, errors });
});

app.post('/api/simulate', (req, res) => {
  const { nodes = [], edges = [] } = req.body || {};
  const errors = validateGraph(nodes, edges);
  if (errors.length) {
    return res.status(400).json({ success: false, errors, logs: [] });
  }
  const result = simulateWorkflow(nodes, edges);
  res.json(result);
});

// ---- Workflow CRUD ----
app.get('/api/workflows', async (_req, res) => {
  try {
    const docs = await Workflow.find({}, { _id: 0, __v: 0 })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workflows/:id', async (req, res) => {
  try {
    const doc = await Workflow.findOne({ id: req.params.id }, { _id: 0, __v: 0 }).lean();
    if (!doc) return res.status(404).json({ error: 'Workflow not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workflows', async (req, res) => {
  try {
    const { name, description = '', nodes = [], edges = [], viewport } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Workflow name is required' });
    const id = uuidv4();
    const doc = await Workflow.create({ id, name: name.trim(), description, nodes, edges, viewport });
    res.status(201).json(doc.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workflows/:id', async (req, res) => {
  try {
    const { name, description, nodes, edges, viewport } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (nodes !== undefined) update.nodes = nodes;
    if (edges !== undefined) update.edges = edges;
    if (viewport !== undefined) update.viewport = viewport;
    const doc = await Workflow.findOneAndUpdate(
      { id: req.params.id },
      { $set: update },
      { new: true, projection: { _id: 0, __v: 0 } }
    ).lean();
    if (!doc) return res.status(404).json({ error: 'Workflow not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/workflows/:id', async (req, res) => {
  try {
    const result = await Workflow.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Workflow not found' });
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic error handler
app.use((err, _req, res, _next) => {
  console.error('[err]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[hr-workflow-backend] listening on 0.0.0.0:${PORT}`);
});
