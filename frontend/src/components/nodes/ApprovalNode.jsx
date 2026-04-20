import { memo } from "react";
import { Handle, Position } from "reactflow";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";
import { cn } from "@/lib/utils";

function ApprovalNode({ id, data, selected }) {
  const activeSimNodeId = useWorkflowStore((s) => s.activeSimNodeId);
  const isActive = activeSimNodeId === id;

  return (
    <div
      className={cn(
        "min-w-[240px] rounded-xl border bg-card text-card-foreground shadow-sm transition-all",
        selected ? "ring-2 ring-foreground border-transparent shadow-md" : "border-border",
        isActive && "hr-pulse"
      )}
      data-testid={`node-approval-${id}`}
    >
      <div
        className="px-3 py-2 rounded-t-xl border-b border-border flex items-center gap-2"
        style={{ backgroundColor: "hsl(var(--node-approval) / 0.08)" }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{
            color: "hsl(var(--node-approval))",
            backgroundColor: "hsl(var(--node-approval) / 0.15)",
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold leading-none">
            Approval
          </p>
          <p className="text-sm font-semibold heading-font truncate leading-tight mt-0.5">
            {data?.title || "Approval Step"}
          </p>
        </div>
      </div>
      <div className="px-3 py-2 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 truncate">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>Approver: {data?.approverRole || "Manager"}</span>
        </div>
        {Number(data?.autoApproveThreshold) > 0 && (
          <div className="text-[11px] italic">
            Auto-approve ≥ {data.autoApproveThreshold}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ApprovalNode);
