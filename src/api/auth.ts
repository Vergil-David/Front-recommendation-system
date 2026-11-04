import { apiClient } from "@/api/client";
import type { AuthResponse, MeResponse } from "@/types/api";
import axios from "axios";

type ApiErrorBody = {
  message?: string;
  error?: string;
};

/** Map raw backend error strings to user-friendly Ukrainian messages. */
const ERROR_MAP: Record<string, string> = {
  "invalid credentials": "Невірний email або пароль",
  "user is inactive": "Ваш акаунт деактивовано. Зверніться до підтримки",
  "email already registered": "Цей email вже зареєстровано",
  "username already taken": "Це ім'я користувача вже зайняте",
  "password too short": "Пароль повинен містити щонайменше 8 символів",
  "invalid request": "Невірний формат запиту. Перевірте введені дані",
  "jwt service not configured": "Серверна помилка. Спробуйте пізніше",
};

/** Translate a backend error body into a Ukrainian message, with fallback per HTTP status. */
function translateError(status: number | undefined, body: ApiErrorBody | undefined, fallback: string): string {
  const raw = body?.error || body?.message || "";
  if (raw && ERROR_MAP[raw]) return ERROR_MAP[raw];

  switch (status) {
    case 400:
      return "Невірні дані запиту. Перевірте правильність заповнення полів";
    case 401:
      return "Невірний email або пароль";
    case 403:
      return "Ваш акаунт деактивовано. Зверніться до підтримки";
    case 409:
      return "Цей email або ім'я користувача вже зайняті";
    case 500:
      return "Серверна помилка. Спробуйте пізніше";
    default:
      return fallback;
  }
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("Введіть email та пароль");
  }

  try {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email: normalizedEmail,
      password: normalizedPassword,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      throw new Error(translateError(error.response?.status, error.response?.data, "Не вдалося увійти. Спробуйте пізніше"));
    }
    if (error instanceof Error && error.message === "Network Error") {
      throw new Error("Немає з'єднання з сервером. Перевірте інтернет");
    }
    throw error;
  }
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
    throw new Error("Заповніть усі поля");
  }

  try {
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      username: normalizedUsername,
      email: normalizedEmail,
      password: normalizedPassword,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      throw new Error(translateError(error.response?.status, error.response?.data, "Не вдалося зареєструватися. Спробуйте пізніше"));
    }
    if (error instanceof Error && error.message === "Network Error") {
      throw new Error("Немає з'єднання з сервером. Перевірте інтернет");
    }
    throw error;
  }
};

export const me = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>("/users/me");
  return response.data;
};
