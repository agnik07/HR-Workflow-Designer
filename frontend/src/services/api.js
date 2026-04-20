import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

export const fetchAutomations = () => api.get("/automations").then((r) => r.data);

export const simulateWorkflow = (payload) =>
  api.post("/simulate", payload).then((r) => r.data);

export const validateWorkflow = (payload) =>
  api.post("/validate", payload).then((r) => r.data);

export const listWorkflows = () => api.get("/workflows").then((r) => r.data);
export const getWorkflow = (id) => api.get(`/workflows/${id}`).then((r) => r.data);
export const createWorkflow = (payload) =>
  api.post("/workflows", payload).then((r) => r.data);
export const updateWorkflow = (id, payload) =>
  api.put(`/workflows/${id}`, payload).then((r) => r.data);
export const deleteWorkflow = (id) =>
  api.delete(`/workflows/${id}`).then((r) => r.data);
