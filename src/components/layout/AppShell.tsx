import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#0b2545]">
      <Navbar />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
