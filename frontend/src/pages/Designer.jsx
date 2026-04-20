import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import RightPanel from "@/components/RightPanel";
import SimulationPanel from "@/components/SimulationPanel";
import WorkflowsDialog from "@/components/WorkflowsDialog";

export default function Designer() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground" data-testid="designer-page">
      <Navbar
        onOpenLibrary={() => setLibraryOpen(true)}
        onOpenSimulate={() => setSimOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <Canvas />
        <RightPanel />
        <SimulationPanel open={simOpen} onOpenChange={setSimOpen} />
      </div>
      <WorkflowsDialog open={libraryOpen} onOpenChange={setLibraryOpen} />
    </div>
  );
}
