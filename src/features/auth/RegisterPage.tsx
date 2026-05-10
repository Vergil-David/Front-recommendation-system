import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/api/auth";
import { useAuthStore } from "@/features/auth/authStore";

type FieldErrors = {
  email?: string;
  username?: string;
  password?: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = "Введіть email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Невірний формат email";
    }

    if (!username.trim()) {
      errors.username = "Введіть ім'я користувача";
    } else if (username.trim().length < 2) {
      errors.username = "Ім'я користувача повинно містити щонайменше 2 символи";
    }

    if (!password.trim()) {
      errors.password = "Введіть пароль";
    } else if (password.trim().length < 8) {
      errors.password = "Пароль повинен містити щонайменше 8 символів";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    if (serverError) setServerError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const data = await register(username, email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      navigate("/onboarding", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося зареєструватися";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b2545] p-6 md:p-8">
      <Card className="w-full max-w-md rounded-2xl border-0 bg-transparent text-[#eef4ed] shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl font-bold text-[#eef4ed]">Реєстрація</CardTitle>
          <CardDescription className="text-[#8da9c4]">Створіть новий акаунт.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {serverError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {serverError}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm text-[#8da9c4]" htmlFor="email">
                Email
              </Label>
              <Input
                className={`h-12 rounded-xl border-0 bg-[#13315c] px-4 text-[#eef4ed] placeholder:text-[#8da9c4] focus-visible:ring-1 focus-visible:ring-[#134074] ${fieldErrors.email ? "ring-1 ring-red-500" : ""}`}
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
              />
              {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[#8da9c4]" htmlFor="username">
                Ім'я користувача
              </Label>
              <Input
                className={`h-12 rounded-xl border-0 bg-[#13315c] px-4 text-[#eef4ed] placeholder:text-[#8da9c4] focus-visible:ring-1 focus-visible:ring-[#134074] ${fieldErrors.username ? "ring-1 ring-red-500" : ""}`}
                id="username"
                placeholder="johndoe"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  clearFieldError("username");
                }}
              />
              {fieldErrors.username && <p className="text-xs text-red-400">{fieldErrors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[#8da9c4]" htmlFor="password">
                Пароль
              </Label>
              <Input
                className={`h-12 rounded-xl border-0 bg-[#13315c] px-4 text-[#eef4ed] placeholder:text-[#8da9c4] focus-visible:ring-1 focus-visible:ring-[#134074] ${fieldErrors.password ? "ring-1 ring-red-500" : ""}`}
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
              />
              {fieldErrors.password && <p className="text-xs text-red-400">{fieldErrors.password}</p>}
            </div>
            <Button
              className="h-12 w-full rounded-xl bg-[#134074] font-semibold text-[#eef4ed] hover:bg-[#134074]/90 active:bg-[#134074]/80"
              type="submit"
              disabled={loading}
            >
              {loading ? "Завантаження..." : "Зареєструватися"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="px-0 pb-0 pt-2">
          <p className="text-sm text-[#8da9c4]">
            Вже є акаунт?{" "}
            <Link className="text-[#8da9c4] underline transition-colors hover:text-[#eef4ed]" to="/login">
              Увійти
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
