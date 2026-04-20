import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow";

const MAX_HISTORY = 50;

const defaultNodeData = (type) => {
  switch (type) {
    case "start":
      return { title: "Start", metadata: [] };
    case "task":
      return {
        title: "New Task",
        description: "",
        assignee: "",
        dueDate: "",
        customFields: [],
      };
    case "approval":
      return {
        title: "Approval Step",
        approverRole: "Manager",
        autoApproveThreshold: 0,
      };
    case "automated":
      return { title: "Automation", action: "", params: {} };
    case "end":
      return { title: "End", endMessage: "Workflow completed", showSummary: true };
    default:
      return { title: "Node" };
  }
};

export const useWorkflowStore = create((set, get) => ({
  // ---- state ----
  workflowId: null,
  workflowName: "Untitled Workflow",
  workflowDescription: "",
  nodes: [],
  edges: [],
  selectedNodeId: null,
  simulationLogs: [],
  simulating: false,
  validationErrors: [],
  history: { past: [], future: [] },
  activeSimNodeId: null,

  // ---- workflow meta ----
  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowDescription: (description) => set({ workflowDescription: description }),
  setWorkflowId: (id) => set({ workflowId: id }),

  // ---- history ----
  pushHistory: () => {
    const { nodes, edges, history } = get();
    const past = [...history.past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
    if (past.length > MAX_HISTORY) past.shift();
    set({ history: { past, future: [] } });
  },

  undo: () => {
    const { history, nodes, edges } = get();
    if (!history.past.length) return;
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    const future = [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...history.future].slice(0, MAX_HISTORY);
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      history: { past: newPast, future },
      selectedNodeId: null,
    });
  },

  redo: () => {
    const { history, nodes, edges } = get();
    if (!history.future.length) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    const past = [...history.past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }].slice(-MAX_HISTORY);
    set({
      nodes: next.nodes,
      edges: next.edges,
      history: { past, future: newFuture },
      selectedNodeId: null,
    });
  },

  // ---- node/edge changes ----
  onNodesChange: (changes) => {
    // only record to history for position / removal / adds (not selection)
    const important = changes.some((c) => ["remove", "add", "position"].includes(c.type) && (c.type !== "position" || c.dragging === false));
    if (important) get().pushHistory();
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
  },

  onEdgesChange: (changes) => {
    const important = changes.some((c) => ["remove", "add"].includes(c.type));
    if (important) get().pushHistory();
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
  },

  onConnect: (connection) => {
    get().pushHistory();
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: false,
          style: { strokeWidth: 1.6 },
        },
        state.edges
      ),
    }));
  },

  addNode: (type, position) => {
    const { nodes, pushHistory } = get();
    // Enforce only one Start node
    if (type === "start" && nodes.some((n) => n.type === "start")) {
      return { error: "Only one Start node is allowed" };
    }
    pushHistory();
    const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNode = {
      id,
      type,
      position,
      data: defaultNodeData(type),
    };
    set((state) => ({ nodes: [...state.nodes, newNode], selectedNodeId: id }));
    return { id };
  },

  updateNodeData: (id, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
      ),
    }));
  },

  deleteNode: (id) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setNodesAndEdges: (nodes, edges) => {
    get().pushHistory();
    set({ nodes, edges, selectedNodeId: null });
  },

  clearAll: () => {
    get().pushHistory();
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      simulationLogs: [],
      validationErrors: [],
      workflowId: null,
      workflowName: "Untitled Workflow",
      workflowDescription: "",
    });
  },

  // ---- simulation ----
  setSimulationLogs: (logs) => set({ simulationLogs: logs }),
  setSimulating: (val) => set({ simulating: val }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  setActiveSimNode: (id) => set({ activeSimNodeId: id }),
}));
