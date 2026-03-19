import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/authStore";
import type { ApiErrorResponse } from "@/types/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const backendError = (loginMutation.error as AxiosError<ApiErrorResponse> | null)?.response?.data
    ?.error;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError("Email and password are required.");
      return;
    }

    try {
      const data = await loginMutation.mutateAsync({ email, password });
      setToken(data.token);
      setUser(data.user);
      navigate("/home", { replace: true });
    } catch {
      // Mutation error is surfaced via loginMutation.error.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {(validationError || backendError) && (
              <p className="text-sm text-red-600">{validationError ?? backendError}</p>
            )}
            <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm">
            No account?{" "}
            <Link className="underline" to="/register">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
