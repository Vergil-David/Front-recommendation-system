import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";

export function RootRedirect() {
  const token = useAuthStore((state) => state.token);
  return <Navigate to={token ? "/home" : "/login"} replace />;
}
