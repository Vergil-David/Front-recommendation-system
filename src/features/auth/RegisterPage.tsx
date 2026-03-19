import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/api/auth";
import { useAuthStore } from "@/features/auth/authStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (!email || !username || !password) {
      setValidationError("Email, username, and password are required.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const data = await register(username, email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      navigate("/home", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b2545] p-6 md:p-8">
      <Card className="w-full max-w-md rounded-2xl border-0 bg-transparent text-[#eef4ed] shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl font-bold text-[#eef4ed]">Register</CardTitle>
          <CardDescription className="text-[#8da9c4]">Create a new account.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label className="text-sm text-[#8da9c4]" htmlFor="email">
                Email
              </Label>
              <Input
                className="h-12 rounded-xl border-0 bg-[#13315c] px-4 text-[#eef4ed] placeholder:text-[#8da9c4] focus-visible:ring-1 focus-visible:ring-[#134074]"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[#8da9c4]" htmlFor="username">
                Username
              </Label>
              <Input
                className="h-12 rounded-xl border-0 bg-[#13315c] px-4 text-[#eef4ed] placeholder:text-[#8da9c4] focus-visible:ring-1 focus-visible:ring-[#134074]"
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[#8da9c4]" htmlFor="password">
                Password
              </Label>
              <Input
                className="h-12 rounded-xl border-0 bg-[#13315c] px-4 text-[#eef4ed] placeholder:text-[#8da9c4] focus-visible:ring-1 focus-visible:ring-[#134074]"
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {validationError && <p className="text-sm text-[#8da9c4]">{validationError}</p>}
            <Button
              className="h-12 w-full rounded-xl bg-[#134074] font-semibold text-[#eef4ed] hover:bg-[#134074]/90 active:bg-[#134074]/80"
              type="submit"
              disabled={loading}
            >
              {loading ? "Завантаження..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="px-0 pb-0 pt-2">
          <p className="text-sm text-[#8da9c4]">
            Already have an account?{" "}
            <Link className="text-[#8da9c4] underline transition-colors hover:text-[#eef4ed]" to="/login">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
