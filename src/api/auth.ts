import type { AuthResponse, MeResponse } from "@/types/api";

const API_URL = "http://localhost:8080";

type ApiErrorBody = {
  message?: string;
  error?: string;
};

const parseJSON = async <T>(res: Response): Promise<T> => {
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("Email and password are required");
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
  });

  const data = await parseJSON<AuthResponse & ApiErrorBody>(res);

  if (res.status === 401) {
    throw new Error("Невірний email або пароль");
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || "Login failed");
  }

  return data;
};

export const register = async (
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedUsername || !normalizedEmail || !normalizedPassword) {
    throw new Error("Username, email and password are required");
  }

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: normalizedUsername,
      email: normalizedEmail,
      password: normalizedPassword,
    }),
  });

  const data = await parseJSON<AuthResponse & ApiErrorBody>(res);

  if (!res.ok) {
    throw new Error(data.message || data.error || "Registration failed");
  }

  return data;
};

export const me = async (): Promise<MeResponse> => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await parseJSON<MeResponse & ApiErrorBody>(res);

  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to load user profile");
  }

  return data;
};
