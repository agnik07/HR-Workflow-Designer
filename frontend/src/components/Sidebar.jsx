import { Play, ClipboardList, CheckCircle2, Bot, StopCircle, Info } from "lucide-react";

const NODE_ITEMS = [
  {
    type: "start",
    label: "Start",
    description: "Workflow entry point",
    Icon: Play,
    accentVar: "--node-start",
  },
  {
    type: "task",
    label: "Task",
    description: "Human task step",
    Icon: ClipboardList,
    accentVar: "--node-task",
  },
  {
    type: "approval",
    label: "Approval",
    description: "Requires decision",
    Icon: CheckCircle2,
    accentVar: "--node-approval",
  },
  {
    type: "automated",
    label: "Automated",
    description: "System action",
    Icon: Bot,
    accentVar: "--node-automated",
  },
  {
    type: "end",
    label: "End",
    description: "Workflow terminator",
    Icon: StopCircle,
    accentVar: "--node-end",
  },
];

export default function Sidebar() {
  const onDragStart = (event, type) => {
    event.dataTransfer.setData("application/hr-node-type", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className="w-64 border-r border-border bg-card flex flex-col shrink-0"
      data-testid="sidebar"
    >
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
          Node Palette
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Drag blocks onto the canvas
        </p>
      </div>

      <div className="flex-1 overflow-y-auto hr-scroll p-3 space-y-2">
        {NODE_ITEMS.map(({ type, label, description, Icon, accentVar }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="group cursor-grab active:cursor-grabbing rounded-lg border border-border bg-card hover:bg-accent hover:border-foreground/20 transition-all p-3 flex items-start gap-3"
            data-testid={`sidebar-node-${type}`}
          >
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center border shrink-0"
              style={{
                color: `hsl(var(${accentVar}))`,
                borderColor: `hsl(var(${accentVar}) / 0.3)`,
                backgroundColor: `hsl(var(${accentVar}) / 0.08)`,
              }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground heading-font leading-tight">
                {label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <div className="rounded-md bg-muted/60 p-3 flex gap-2">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Connect handles to link nodes. Select a node to configure it.
          </p>
        </div>
      </div>
    </aside>
  );
}
