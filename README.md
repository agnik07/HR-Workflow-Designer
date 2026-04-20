# HR Workflow Designer

A production-quality MERN application for HR admins to **visually design and simulate** internal workflows — onboarding, leave approvals, document verification, and more.

check it out here 👇🏻
https://hr-workflow-designer-beige.vercel.app

## Tech Stack

- **Frontend**: React (CRA) + Tailwind CSS + shadcn/ui + React Flow + Zustand + Axios + React Hook Form
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Extras**: Dagre (auto-layout), Sonner (toasts), Lucide icons

## Features

- Three-pane IDE layout: **Node palette · React Flow canvas · Inspector panel**
- Five custom node types: **Start, Task, Approval, Automated, End**
- Drag-and-drop from palette onto canvas
- Connect handles to define workflow edges
- Live validation (one Start, required End, orphan detection, cycle detection)
- Dynamic Automated-node parameters pulled from `/api/automations`
- **Simulation console** with color-coded timestamped logs driven by `/api/simulate`
- **MongoDB persistence**: save / load / update / delete workflows via `/api/workflows`
- Bonus features:
  - Export / Import workflow as JSON
  - Undo / Redo (Ctrl+Z / Ctrl+Shift+Z)
  - Auto-arrange with dagre
  - Toast notifications
  - Light / Dark theme toggle (persisted)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/automations` | List available automation actions |
| POST | `/api/validate` | Client-independent validation of a graph |
| POST | `/api/simulate` | Run a workflow simulation, returns logs |
| GET  | `/api/workflows` | List saved workflows |
| GET  | `/api/workflows/:id` | Fetch a single workflow |
| POST | `/api/workflows` | Save new workflow |
| PUT  | `/api/workflows/:id` | Update a workflow |
| DELETE | `/api/workflows/:id` | Delete a workflow |

## Running Locally

```bash
# Backend
cd backend
yarn install
# .env must define MONGO_URL and DB_NAME
node server.js    # runs on :8001

# Frontend
cd frontend
yarn install
# .env must define REACT_APP_BACKEND_URL
yarn start        # runs on :3000
```

## Folder Structure

```
backend/
  server.js              Express API + Mongoose models
  package.json
  .env                   MONGO_URL, DB_NAME, CORS_ORIGINS

frontend/src/
  pages/Designer.jsx     Main page
  components/
    Navbar.jsx
    Sidebar.jsx
    Canvas.jsx
    RightPanel.jsx
    SimulationPanel.jsx
    WorkflowsDialog.jsx
    nodes/*.jsx          Custom React Flow nodes
    NodeForms/*.jsx      Config forms per node type
  store/workflowStore.js Zustand store (with history)
  services/api.js        Axios service
  hooks/
    useTheme.js
    useValidation.js
  lib/autoLayout.js      Dagre auto-arrange
```

## Keyboard Shortcuts

- `Ctrl/Cmd + Z` — Undo
- `Ctrl/Cmd + Shift + Z` / `Ctrl+Y` — Redo
- Click handle on a node and drag to another to create an edge
- Click a node to edit in the right panel
