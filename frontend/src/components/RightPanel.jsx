import { useWorkflowStore } from "@/store/workflowStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, X } from "lucide-react";
import StartForm from "@/components/NodeForms/StartForm";
import TaskForm from "@/components/NodeForms/TaskForm";
import ApprovalForm from "@/components/NodeForms/ApprovalForm";
import AutomatedForm from "@/components/NodeForms/AutomatedForm";
import EndForm from "@/components/NodeForms/EndForm";

const FORM_MAP = {
  start: StartForm,
  task: TaskForm,
  approval: ApprovalForm,
  automated: AutomatedForm,
  end: EndForm,
};

const TYPE_LABEL = {
  start: "Start Node",
  task: "Task Node",
  approval: "Approval Node",
  automated: "Automated Node",
  end: "End Node",
};

const TYPE_COLOR = {
  start: "--node-start",
  task: "--node-task",
  approval: "--node-approval",
  automated: "--node-automated",
  end: "--node-end",
};

export default function RightPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const validationErrors = useWorkflowStore((s) => s.validationErrors);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <aside
        className="w-80 border-l border-border bg-card flex flex-col shrink-0"
        data-testid="right-panel-config"
      >
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
            Inspector
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Select a node to configure
          </p>
        </div>
        <div className="flex-1 overflow-y-auto hr-scroll px-4 py-6">
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm font-semibold heading-font">No node selected</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Click any node on the canvas to edit its properties, or drag a new node from the palette.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-2">
              Workflow Health
            </p>
            {validationErrors.length === 0 ? (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400" data-testid="validation-ok">
                Workflow is valid and ready to simulate.
              </div>
            ) : (
              <ul className="space-y-1.5" data-testid="validation-errors">
                {validationErrors.map((e) => (
                  <li
                    key={e}
                    className="text-xs rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-amber-700 dark:text-amber-400"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    );
  }

  const Form = FORM_MAP[node.type];

  return (
    <aside
      className="w-80 border-l border-border bg-card flex flex-col shrink-0 hr-fade-in"
      data-testid="right-panel-config"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: `hsl(var(${TYPE_COLOR[node.type]}))` }}
            />
            <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
              {TYPE_LABEL[node.type] || node.type}
            </p>
          </div>
          <p className="text-sm font-semibold heading-font truncate mt-0.5">
            {node.data?.title || "Untitled"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => deleteNode(node.id)}
            title="Delete node"
            data-testid="right-panel-delete-btn"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedNodeId(null)}
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">{Form ? <Form node={node} /> : null}</div>
      </ScrollArea>
    </aside>
  );
}
