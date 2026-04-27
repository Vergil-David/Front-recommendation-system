import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export function AppShell() {
  return (
    <div className="app-surface min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
