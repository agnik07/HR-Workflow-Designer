import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkflowStore } from "@/store/workflowStore";
import { fetchAutomations } from "@/services/api";

export default function AutomatedForm({ node }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchAutomations()
      .then((list) => {
        if (mounted) setAutomations(list);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const selected = automations.find((a) => a.id === node.data?.action);
  const params = node.data?.params || {};

  const setParam = (key, value) => {
    updateNodeData(node.id, { params: { ...params, [key]: value } });
  };

  return (
    <div className="space-y-4" data-testid="form-automated">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
        <Input
          value={node.data?.title || ""}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="Send welcome email"
          data-testid="form-automated-title"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Automation action
        </Label>
        <Select
          value={node.data?.action || ""}
          onValueChange={(v) => updateNodeData(node.id, { action: v, params: {} })}
        >
          <SelectTrigger data-testid="form-automated-action">
            <SelectValue placeholder={loading ? "Loading..." : "Select an action"} />
          </SelectTrigger>
          <SelectContent>
            {automations.map((a) => (
              <SelectItem key={a.id} value={a.id} data-testid={`form-automated-action-${a.id}`}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected?.description && (
          <p className="text-[11px] text-muted-foreground">{selected.description}</p>
        )}
      </div>

      {selected && (
        <div className="rounded-md border border-border bg-muted/40 p-3 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
            Parameters
          </p>
          {selected.params.map((p) => {
            const val = params[p.key] || "";
            if (p.type === "textarea") {
              return (
                <div key={p.key} className="space-y-1">
                  <Label className="text-xs">{p.label}</Label>
                  <Textarea
                    rows={2}
                    value={val}
                    onChange={(e) => setParam(p.key, e.target.value)}
                    placeholder={p.placeholder || ""}
                  />
                </div>
              );
            }
            if (p.type === "select") {
              return (
                <div key={p.key} className="space-y-1">
                  <Label className="text-xs">{p.label}</Label>
                  <Select value={val} onValueChange={(v) => setParam(p.key, v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Choose..." />
                    </SelectTrigger>
                    <SelectContent>
                      {p.options.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            return (
              <div key={p.key} className="space-y-1">
                <Label className="text-xs">{p.label}</Label>
                <Input
                  value={val}
                  onChange={(e) => setParam(p.key, e.target.value)}
                  placeholder={p.placeholder || ""}
                  className="h-8 text-xs"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
