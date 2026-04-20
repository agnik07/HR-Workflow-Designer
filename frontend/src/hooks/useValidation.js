/**
 * Client-side validation for workflow graph.
 * Returns array of human-readable error strings.
 */
export function validateWorkflowGraph(nodes, edges) {
  const errors = [];
  if (!nodes.length) return ["Workflow is empty"];

  const starts = nodes.filter((n) => n.type === "start");
  const ends = nodes.filter((n) => n.type === "end");
  if (starts.length === 0) errors.push("Workflow must have a Start node");
  if (starts.length > 1) errors.push("Only one Start node is allowed");
  if (ends.length === 0) errors.push("Workflow must have at least one End node");

  const nodeIds = new Set(nodes.map((n) => n.id));
  const connected = new Set();
  edges.forEach((e) => {
    if (nodeIds.has(e.source)) connected.add(e.source);
    if (nodeIds.has(e.target)) connected.add(e.target);
  });
  const orphans = nodes.filter((n) => !connected.has(n.id) && nodes.length > 1);
  if (orphans.length > 0) errors.push(`${orphans.length} orphan node(s) not connected`);

  // cycle detection
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};
  nodes.forEach((n) => (color[n.id] = WHITE));
  let hasCycle = false;
  const dfs = (u) => {
    color[u] = GRAY;
    for (const v of adj[u] || []) {
      if (color[v] === GRAY) { hasCycle = true; return; }
      if (color[v] === WHITE) dfs(v);
      if (hasCycle) return;
    }
    color[u] = BLACK;
  };
  nodes.forEach((n) => { if (color[n.id] === WHITE) dfs(n.id); });
  if (hasCycle) errors.push("Workflow contains a cycle");

  // Approval/task titles should not be empty
  nodes.forEach((n) => {
    if (!n.data?.title || !String(n.data.title).trim()) {
      errors.push(`Node "${n.id}" has empty title`);
    }
  });

  return errors;
}
