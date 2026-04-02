import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const links = [
  { to: "/home", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/library", label: "My Library" },
  { to: "/friends", label: "Friends" },
  { to: "/settings", label: "Settings" },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isOverlay = location.pathname === "/home" || location.pathname.startsWith("/movies/");

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header
      className={cn(
        "w-full",
        isOverlay ? "absolute left-0 top-0 z-30 bg-transparent" : "border-b border-[#134074] bg-[#0b2545]",
      )}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <div className="flex items-center gap-5 text-sm text-[#8da9c4]">
          <p className="text-lg font-semibold text-[#eef4ed]">PageStream</p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn("transition-colors hover:text-[#eef4ed]", isActive && "text-[#eef4ed]")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#8da9c4]">{user?.username ?? "User"}</span>
          <Button
            type="button"
            size="sm"
            className="rounded-xl bg-[#134074] text-[#eef4ed] hover:bg-[#134074]/90"
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
}
