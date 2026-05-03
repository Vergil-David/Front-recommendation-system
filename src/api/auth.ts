import { apiClient } from "@/api/client";
import type { AuthResponse, MeResponse } from "@/types/api";
import axios from "axios";

type ApiErrorBody = {
  message?: string;
  error?: string;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("Email and password are required");
  }

  try {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email: normalizedEmail,
      password: normalizedPassword,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      if (error.response?.status === 401) {
        throw new Error("Невірний email або пароль");
      }

      throw new Error(error.response?.data?.message || error.response?.data?.error || "Login failed");
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
    throw new Error("Username, email and password are required");
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
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Registration failed");
    }

    throw error;
  }
};

export const me = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>("/users/me");
  return response.data;
};
