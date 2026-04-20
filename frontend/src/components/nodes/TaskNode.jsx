import { memo } from "react";
import { Handle, Position } from "reactflow";
import { ClipboardList, User, Calendar } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";
import { cn } from "@/lib/utils";

function TaskNode({ id, data, selected }) {
  const activeSimNodeId = useWorkflowStore((s) => s.activeSimNodeId);
  const isActive = activeSimNodeId === id;

  return (
    <div
      className={cn(
        "min-w-[240px] rounded-xl border bg-card text-card-foreground shadow-sm transition-all",
        selected ? "ring-2 ring-foreground border-transparent shadow-md" : "border-border",
        isActive && "hr-pulse"
      )}
      data-testid={`node-task-${id}`}
    >
      <div
        className="px-3 py-2 rounded-t-xl border-b border-border flex items-center gap-2"
        style={{ backgroundColor: "hsl(var(--node-task) / 0.08)" }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{
            color: "hsl(var(--node-task))",
            backgroundColor: "hsl(var(--node-task) / 0.15)",
          }}
        >
          <ClipboardList className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold leading-none">
            Task
          </p>
          <p className="text-sm font-semibold heading-font truncate leading-tight mt-0.5">
            {data?.title || "New Task"}
          </p>
        </div>
      </div>
      <div className="px-3 py-2 space-y-1 text-xs text-muted-foreground">
        {data?.assignee && (
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate">{data.assignee}</span>
          </div>
        )}
        {data?.dueDate && (
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{data.dueDate}</span>
          </div>
        )}
        {!data?.assignee && !data?.dueDate && (
          <span className="italic">Click to configure</span>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(TaskNode);
