import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const links = [
  { to: "/home", label: "Головна" },
  { to: "/explore", label: "Каталог" },
  { to: "/books", label: "Книги" },
  { to: "/library", label: "Бібліотека" },
  { to: "/friends", label: "Друзі" },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isOverlay = location.pathname === "/home" || location.pathname.startsWith("/movies/") || location.pathname.startsWith("/books/");

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header
      className={cn(
        "fixed left-0 top-0 z-50 w-full transition-all duration-500",
        isOverlay ? "bg-transparent" : "glass-strong",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-5 md:gap-8">
          <NavLink to="/home" className="font-display shrink-0 text-xl font-bold tracking-wide text-[#eef4ed] transition-opacity hover:opacity-80">
            PageStream
          </NavLink>
          <div className="scrollbar-hide flex min-w-0 items-center gap-5 overflow-x-auto text-sm font-medium text-[#8da9c4] md:gap-8">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "relative shrink-0 py-2 transition-all duration-300 hover:text-[#eef4ed]",
                    isActive &&
                      "text-[#eef4ed] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#8da9c4]",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:bg-[#134074]/80",
                isActive ? "bg-[#134074]/80 text-[#eef4ed]" : "text-[#8da9c4]",
              )
            }
            aria-label="Пошук"
          >
            <Search className="h-4 w-4" />
          </NavLink>
          <span className="hidden text-sm font-medium text-[#8da9c4] sm:inline">
            {user?.username ?? "User"}
          </span>
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-full bg-[#eef4ed] px-4 text-sm font-semibold text-[#0b2545] shadow-[0_12px_30px_rgba(0,0,0,0.24)] transition hover:scale-105 hover:bg-[#eef4ed]/90"
            onClick={onLogout}
          >
            Вийти
          </Button>
        </div>
      </nav>
    </header>
  );
}
