import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress benign ResizeObserver loop warnings from React Flow (dev overlay)
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    if (e.message && /ResizeObserver loop/.test(e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
