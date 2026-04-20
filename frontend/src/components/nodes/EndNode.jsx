import { memo } from "react";
import { Handle, Position } from "reactflow";
import { StopCircle } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";
import { cn } from "@/lib/utils";

function EndNode({ id, data, selected }) {
  const activeSimNodeId = useWorkflowStore((s) => s.activeSimNodeId);
  const isActive = activeSimNodeId === id;

  return (
    <div
      className={cn(
        "min-w-[240px] rounded-xl border bg-card text-card-foreground shadow-sm transition-all",
        selected ? "ring-2 ring-foreground border-transparent shadow-md" : "border-border",
        isActive && "hr-pulse"
      )}
      data-testid={`node-end-${id}`}
    >
      <div
        className="px-3 py-2 rounded-t-xl border-b border-border flex items-center gap-2"
        style={{ backgroundColor: "hsl(var(--node-end) / 0.08)" }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{
            color: "hsl(var(--node-end))",
            backgroundColor: "hsl(var(--node-end) / 0.15)",
          }}
        >
          <StopCircle className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold leading-none">
            End
          </p>
          <p className="text-sm font-semibold heading-font truncate leading-tight mt-0.5">
            {data?.title || "End"}
          </p>
        </div>
      </div>
      <div className="px-3 py-2 text-xs text-muted-foreground truncate">
        {data?.endMessage || "Workflow completed"}
      </div>
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export default memo(EndNode);
