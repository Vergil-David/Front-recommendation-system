import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="border-b">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 text-sm">
          <Link to="/home">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/friends">Friends</Link>
          <Link to="/settings">Settings</Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.username ?? "User"}</span>
          <Button type="button" variant="outline" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
}
