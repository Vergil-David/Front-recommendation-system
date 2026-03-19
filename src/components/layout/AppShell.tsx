import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export function AppShell() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
