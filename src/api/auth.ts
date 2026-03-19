import { apiClient } from "@/api/client";
import type { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from "@/types/api";

export const login = async (payload: LoginRequest) => {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
};

export const register = async (payload: RegisterRequest) => {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  return response.data;
};

export const me = async () => {
  const response = await apiClient.get<MeResponse>("/users/me");
  return response.data;
};
