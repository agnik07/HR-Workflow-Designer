import { useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowStore } from "@/store/workflowStore";
import StartNode from "@/components/nodes/StartNode";
import TaskNode from "@/components/nodes/TaskNode";
import ApprovalNode from "@/components/nodes/ApprovalNode";
import AutomatedNode from "@/components/nodes/AutomatedNode";
import EndNode from "@/components/nodes/EndNode";
import { toast } from "sonner";

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

function CanvasInner() {
  const wrapperRef = useRef(null);
  const { project } = useReactFlow();

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/hr-node-type");
    if (!type) return;
    const bounds = wrapperRef.current.getBoundingClientRect();
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    const result = addNode(type, position);
    if (result?.error) {
      toast.error(result.error);
    }
  };

  const onNodeClick = (_e, node) => setSelectedNodeId(node.id);
  const onPaneClick = () => setSelectedNodeId(null);

  // keyboard delete
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const tag = document.activeElement?.tagName;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
      data-testid="canvas-react-flow"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: false }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.4}
          color="hsl(var(--canvas-dots))"
        />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          zoomable
          pannable
          nodeColor={(n) => {
            const map = {
              start: "hsl(var(--node-start))",
              task: "hsl(var(--node-task))",
              approval: "hsl(var(--node-approval))",
              automated: "hsl(var(--node-automated))",
              end: "hsl(var(--node-end))",
            };
            return map[n.type] || "hsl(var(--muted-foreground))";
          }}
          maskColor="hsl(var(--muted) / 0.5)"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}

export default function Canvas() {
  return (
    <div className="flex-1 relative bg-background" data-testid="canvas-container">
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
