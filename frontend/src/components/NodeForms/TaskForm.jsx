import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function TaskForm({ node }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const customFields = node.data?.customFields || [];
  const setFields = (next) => updateNodeData(node.id, { customFields: next });

  return (
    <div className="space-y-4" data-testid="form-task">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
        <Input
          value={node.data?.title || ""}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="Onboard new hire"
          data-testid="form-task-title"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Description
        </Label>
        <Textarea
          value={node.data?.description || ""}
          onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
          rows={3}
          placeholder="Describe what needs to happen in this task..."
        />
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Assignee
          </Label>
          <Input
            value={node.data?.assignee || ""}
            onChange={(e) => updateNodeData(node.id, { assignee: e.target.value })}
            placeholder="e.g., John Doe"
            data-testid="form-task-assignee"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Due date
          </Label>
          <Input
            type="date"
            value={node.data?.dueDate || ""}
            onChange={(e) => updateNodeData(node.id, { dueDate: e.target.value })}
            data-testid="form-task-due-date"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Custom Fields
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setFields([...customFields, { _id: uid(), key: "", value: "" }])}
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {customFields.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No custom fields.</p>
        )}
        {customFields.map((f, i) => (
          <div key={f._id || `field-${i}`} className="flex items-center gap-1.5">
            <Input
              value={f.key}
              onChange={(e) => {
                const n = [...customFields];
                n[i] = { ...n[i], key: e.target.value };
                setFields(n);
              }}
              className="h-8 text-xs"
              placeholder="key"
            />
            <Input
              value={f.value}
              onChange={(e) => {
                const n = [...customFields];
                n[i] = { ...n[i], value: e.target.value };
                setFields(n);
              }}
              className="h-8 text-xs"
              placeholder="value"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setFields(customFields.filter((_, j) => j !== i))}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
