import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Play, X, Terminal, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/store/workflowStore";
import { simulateWorkflow } from "@/services/api";
import { toast } from "sonner";
import { validateWorkflowGraph } from "@/hooks/useValidation";
import { cn } from "@/lib/utils";

const ICON = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const COLOR = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-sky-600 dark:text-sky-400",
};

export default function SimulationPanel({ open, onOpenChange }) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const logs = useWorkflowStore((s) => s.simulationLogs);
  const setLogs = useWorkflowStore((s) => s.setSimulationLogs);
  const simulating = useWorkflowStore((s) => s.simulating);
  const setSimulating = useWorkflowStore((s) => s.setSimulating);
  const setActiveSimNode = useWorkflowStore((s) => s.setActiveSimNode);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (open) setCollapsed(false);
  }, [open]);

  const runSimulation = async () => {
    const clientErrors = validateWorkflowGraph(nodes, edges);
    if (clientErrors.length) {
      toast.error("Cannot simulate: " + clientErrors[0]);
      setLogs(clientErrors.map((m) => ({ level: "error", message: m, timestamp: new Date().toISOString() })));
      return;
    }
    setSimulating(true);
    setLogs([]);
    try {
      const res = await simulateWorkflow({ nodes, edges });
      // animate logs one by one for effect
      for (let i = 0; i < res.logs.length; i++) {
        await new Promise((r) => setTimeout(r, 120));
        setLogs(res.logs.slice(0, i + 1));
      }
      if (res.success) toast.success("Simulation complete");
      else toast.error("Simulation ended with errors");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        setLogs(data.errors.map((m) => ({ level: "error", message: m, timestamp: new Date().toISOString() })));
        toast.error("Validation failed");
      } else {
        toast.error(err.message || "Simulation failed");
      }
    } finally {
      setSimulating(false);
      setActiveSimNode(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 bottom-0 bg-card border-t border-border shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.2)] z-30 hr-fade-in",
        collapsed ? "h-10" : "h-64"
      )}
      data-testid="simulation-drawer"
    >
      <div className="h-10 px-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs uppercase tracking-[0.12em] font-semibold">Simulation Console</p>
          {logs.length > 0 && (
            <span className="text-[11px] text-muted-foreground mono">
              {logs.length} line{logs.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={runSimulation}
            disabled={simulating}
            className="h-7 text-xs"
            data-testid="simulation-run-btn"
          >
            <Play className="w-3 h-3 mr-1" />
            {simulating ? "Running..." : "Run Simulation"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onOpenChange(false)}
            title="Close"
            data-testid="simulation-close-btn"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto hr-scroll font-mono text-xs">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>No simulation output yet. Press <span className="mono font-semibold">Run Simulation</span> to begin.</p>
            </div>
          ) : (
            logs.map((log, i) => {
              const Icon = ICON[log.level] || Info;
              return (
                <div
                  key={`${log.timestamp}-${i}`}
                  className="px-4 py-1.5 border-b border-border/40 hover:bg-accent/40 flex items-start gap-3"
                  data-testid={`simulation-log-${i}`}
                >
                  <span className="text-[10px] text-muted-foreground mt-0.5 min-w-[60px] mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", COLOR[log.level] || "")} />
                  <span className={cn("whitespace-pre-wrap", COLOR[log.level] || "text-foreground")}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
