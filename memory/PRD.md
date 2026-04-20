# HR Workflow Designer — PRD

## Original Problem Statement
Build a production-quality MERN stack web application "HR Workflow Designer" where HR admins can visually create and simulate workflows such as onboarding, leave approval, document verification.

## User Choices
- Backend: Node.js + Express + MongoDB (supervisor reconfigured)
- Frontend: CRA (existing)
- Theme: Light + Dark with toggle
- Bonus features: All (Export/Import JSON, Undo/Redo, Auto-arrange, Toasts)
- Persistence: Full MongoDB save/load

## Architecture
- Express server on :8001, Mongoose `Workflow` model
- React CRA with React Flow canvas, Zustand store, shadcn/ui
- 3-pane layout: Sidebar (palette) · Canvas · Inspector. Bottom drawer = Simulation.

## Core Features (Done)
- Drag/drop 5 node types to canvas
- Dynamic per-node config forms
- Live validation (single start, end required, orphan + cycle detection)
- Simulation console with animated log streaming
- Save/Update/Load/Delete workflows (MongoDB)
- Export/Import JSON, Undo/Redo, Auto-arrange (dagre), Toast, Theme toggle
- Keyboard shortcuts (undo/redo)

## User Personas
- HR Admin / Ops — designs onboarding, leave, document verification workflows
- HRBP / Manager — reviews & approves steps
- Engineering (internal) — configures automations

## Implemented (2026-02-20)
- Express API: automations, validate, simulate, workflows CRUD
- Full React UI with 5 nodes, 5 forms, simulation, library dialog
- Theme toggle, autolayout, export/import, undo/redo

## Backlog (P1/P2)
- P1: Workflow simulation step-by-step animation on canvas (highlight active node)
- P1: Duplicate node / copy-paste
- P2: Role-based access control / auth
- P2: Workflow templates gallery (e.g. prebuilt onboarding)
- P2: Collaboration / comments on nodes
- P2: Export to BPMN/PDF

## Next Tasks
- Run testing_agent_v3 for backend and frontend E2E
- Address any critical failures
