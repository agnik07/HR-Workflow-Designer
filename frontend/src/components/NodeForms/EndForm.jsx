import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useWorkflowStore } from "@/store/workflowStore";

export default function EndForm({ node }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <div className="space-y-4" data-testid="form-end">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
        <Input
          value={node.data?.title || ""}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="End"
          data-testid="form-end-title"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          End message
        </Label>
        <Textarea
          rows={2}
          value={node.data?.endMessage || ""}
          onChange={(e) => updateNodeData(node.id, { endMessage: e.target.value })}
          placeholder="Workflow completed successfully"
          data-testid="form-end-message"
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <p className="text-sm font-medium">Show summary</p>
          <p className="text-[11px] text-muted-foreground">
            Include a summary line in simulation logs
          </p>
        </div>
        <Switch
          checked={!!node.data?.showSummary}
          onCheckedChange={(v) => updateNodeData(node.id, { showSummary: v })}
          data-testid="form-end-summary-toggle"
        />
      </div>
    </div>
  );
}
