import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/app/App";
import "@/styles/globals.css";
import { useAuthStore } from "@/features/auth/authStore";
import { me } from "@/api/auth";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}

const token = useAuthStore.getState().token;
if (token) {
  me()
    .then((response) => {
      useAuthStore.getState().setUser(response.user);
    })
    .catch(() => {
      useAuthStore.getState().logout();
    });
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
