import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkflowStore } from "@/store/workflowStore";

const ROLES = ["Manager", "HRBP", "Director", "CEO", "CFO"];

export default function ApprovalForm({ node }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <div className="space-y-4" data-testid="form-approval">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
        <Input
          value={node.data?.title || ""}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="Manager approval"
          data-testid="form-approval-title"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Approver role
        </Label>
        <Select
          value={node.data?.approverRole || "Manager"}
          onValueChange={(v) => updateNodeData(node.id, { approverRole: v })}
        >
          <SelectTrigger data-testid="form-approval-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r} data-testid={`form-approval-role-option-${r}`}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Auto-approve threshold
        </Label>
        <Input
          type="number"
          min={0}
          value={node.data?.autoApproveThreshold ?? 0}
          onChange={(e) =>
            updateNodeData(node.id, {
              autoApproveThreshold: Number(e.target.value),
            })
          }
          placeholder="0"
          data-testid="form-approval-threshold"
        />
        <p className="text-[11px] text-muted-foreground">
          If the request score is ≥ threshold, approval is auto-granted during simulation.
        </p>
      </div>
    </div>
  );
}
