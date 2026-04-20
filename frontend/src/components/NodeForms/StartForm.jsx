import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function StartForm({ node }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const metadata = node.data?.metadata || [];

  const setMeta = (next) => updateNodeData(node.id, { metadata: next });

  return (
    <div className="space-y-4" data-testid="form-start">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
        <Input
          value={node.data?.title || ""}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="Start"
          data-testid="form-start-title"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Metadata
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setMeta([...metadata, { _id: uid(), key: "", value: "" }])}
            data-testid="form-start-add-meta"
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {metadata.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No metadata yet.</p>
        )}
        {metadata.map((m, i) => (
          <div key={m._id || `meta-${i}`} className="flex items-center gap-1.5">
            <Input
              value={m.key}
              onChange={(e) => {
                const next = [...metadata];
                next[i] = { ...next[i], key: e.target.value };
                setMeta(next);
              }}
              className="h-8 text-xs"
              placeholder="key"
            />
            <Input
              value={m.value}
              onChange={(e) => {
                const next = [...metadata];
                next[i] = { ...next[i], value: e.target.value };
                setMeta(next);
              }}
              className="h-8 text-xs"
              placeholder="value"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setMeta(metadata.filter((_, j) => j !== i))}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
