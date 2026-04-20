import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sun,
  Moon,
  Undo2,
  Redo2,
  Save,
  FolderOpen,
  Download,
  Upload,
  Play,
  LayoutGrid,
  Trash2,
  Workflow as WorkflowIcon,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useWorkflowStore } from "@/store/workflowStore";
import { toast } from "sonner";
import { createWorkflow, updateWorkflow } from "@/services/api";
import { autoLayout } from "@/lib/autoLayout";
import { validateWorkflowGraph } from "@/hooks/useValidation";

export default function Navbar({ onOpenLibrary, onOpenSimulate }) {
  const { theme, toggleTheme } = useTheme();
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const setWorkflowId = useWorkflowStore((s) => s.setWorkflowId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const history = useWorkflowStore((s) => s.history);
  const setNodesAndEdges = useWorkflowStore((s) => s.setNodesAndEdges);
  const clearAll = useWorkflowStore((s) => s.clearAll);
  const setValidationErrors = useWorkflowStore((s) => s.setValidationErrors);
  const validationErrors = useWorkflowStore((s) => s.validationErrors);

  const [saving, setSaving] = useState(false);

  // keyboard shortcuts for undo/redo
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
                 ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo, redo]);

  // live validation
  useEffect(() => {
    const errs = validateWorkflowGraph(nodes, edges);
    setValidationErrors(errs);
  }, [nodes, edges, setValidationErrors]);

  const handleSave = async () => {
    if (!nodes.length) {
      toast.error("Add at least one node before saving");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: workflowName || "Untitled Workflow",
        description: useWorkflowStore.getState().workflowDescription,
        nodes,
        edges,
      };
      if (workflowId) {
        await updateWorkflow(workflowId, payload);
        toast.success("Workflow updated");
      } else {
        const saved = await createWorkflow(payload);
        setWorkflowId(saved.id);
        toast.success("Workflow saved");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const payload = {
      name: workflowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(workflowName || "workflow").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Workflow exported");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error("Invalid workflow file");
        }
        setNodesAndEdges(parsed.nodes, parsed.edges);
        if (parsed.name) setWorkflowName(parsed.name);
        toast.success("Workflow imported");
      } catch (err) {
        toast.error(err.message || "Failed to import");
      }
    };
    input.click();
  };

  const handleAutoLayout = () => {
    if (!nodes.length) {
      toast.error("Nothing to arrange");
      return;
    }
    const laidOut = autoLayout(nodes, edges, "LR");
    setNodesAndEdges(laidOut, edges);
    toast.success("Layout arranged");
  };

  const handleClear = () => {
    if (!nodes.length && !edges.length) return;
    if (window.confirm("Clear the canvas? This cannot be undone easily.")) {
      clearAll();
      toast.success("Canvas cleared");
    }
  };

  const errorCount = validationErrors.length;

  return (
    <header
      className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-40 relative"
      data-testid="navbar"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-md bg-foreground text-background flex items-center justify-center">
            <WorkflowIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold heading-font leading-none">HR Workflow Designer</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1">
              Enterprise Canvas
            </p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-8 mx-1 hidden md:block" />
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="h-8 w-48 md:w-72 text-sm font-medium"
          placeholder="Workflow name"
          data-testid="navbar-workflow-name"
        />
        {errorCount > 0 && (
          <div
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs"
            title={validationErrors.join("\n")}
            data-testid="navbar-validation-warning"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{errorCount} issue{errorCount > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!history.past.length}
          title="Undo (Ctrl+Z)"
          data-testid="navbar-undo-btn"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!history.future.length}
          title="Redo (Ctrl+Shift+Z)"
          data-testid="navbar-redo-btn"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="ghost" size="sm" onClick={handleAutoLayout} title="Auto-arrange" data-testid="navbar-autolayout-btn">
          <LayoutGrid className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleImport} title="Import JSON" data-testid="navbar-import-btn">
          <Upload className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExport} title="Export JSON" data-testid="navbar-export-btn">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenLibrary} title="Open workflow library" data-testid="navbar-library-btn">
          <FolderOpen className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleClear} title="Clear canvas" data-testid="navbar-clear-btn">
          <Trash2 className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="ghost" size="sm" onClick={toggleTheme} title="Toggle theme" data-testid="navbar-theme-toggle-btn">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="ml-1"
          data-testid="navbar-save-btn"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Saving..." : workflowId ? "Update" : "Save"}
        </Button>
        <Button
          size="sm"
          onClick={onOpenSimulate}
          className="ml-1"
          data-testid="navbar-simulate-btn"
        >
          <Play className="w-4 h-4 mr-1.5" />
          Simulate
        </Button>
      </div>
    </header>
  );
}
