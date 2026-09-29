import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

// Handle SPA redirect from 404.html
const params = new URLSearchParams(window.location.search);
const redirect = params.get("redirect");
if (redirect) {
  window.history.replaceState(null, "", redirect);
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
createRoot(root).render(<StrictMode><App /></StrictMode>);
