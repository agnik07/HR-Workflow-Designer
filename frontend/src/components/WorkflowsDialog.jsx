import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, FolderOpen, Clock } from "lucide-react";
import { listWorkflows, getWorkflow, deleteWorkflow } from "@/services/api";
import { useWorkflowStore } from "@/store/workflowStore";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WorkflowsDialog({ open, onOpenChange }) {
  const [workflows, setWorkflows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const setNodesAndEdges = useWorkflowStore((s) => s.setNodesAndEdges);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const setWorkflowId = useWorkflowStore((s) => s.setWorkflowId);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (err) {
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleOpen = async (id) => {
    try {
      const wf = await getWorkflow(id);
      setNodesAndEdges(wf.nodes || [], wf.edges || []);
      setWorkflowName(wf.name || "Untitled Workflow");
      setWorkflowId(wf.id);
      toast.success(`Loaded "${wf.name}"`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to open workflow");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete workflow "${name}"?`)) return;
    try {
      await deleteWorkflow(id);
      toast.success("Workflow deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = workflows.filter((w) =>
    w.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="workflows-dialog">
        <DialogHeader>
          <DialogTitle className="heading-font">Workflow Library</DialogTitle>
          <DialogDescription>
            Open a previously saved workflow from the MongoDB library.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workflows..."
            data-testid="workflows-dialog-search"
          />
          <ScrollArea className="h-[360px] rounded-md border border-border">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium heading-font">No saved workflows</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create one and hit Save to see it here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((wf) => (
                  <div
                    key={wf.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors"
                    data-testid={`workflow-row-${wf.id}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold heading-font truncate">{wf.name}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(wf.updatedAt || wf.createdAt).toLocaleString()}
                        </span>
                        <span>{wf.nodes?.length || 0} nodes</span>
                        <span>{wf.edges?.length || 0} edges</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpen(wf.id)}
                        data-testid={`workflow-open-${wf.id}`}
                      >
                        <FolderOpen className="w-3.5 h-3.5 mr-1" />
                        Open
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(wf.id, wf.name)}
                        className="h-8 w-8"
                        data-testid={`workflow-delete-${wf.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
