import { useMutation, useQuery } from "@tanstack/react-query";
import { login, me, register } from "@/api/auth";
import type { LoginRequest, RegisterRequest } from "@/types/api";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (payload: LoginRequest) => login(payload.email, payload.password),
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload.username, payload.email, payload.password),
  });

export const useMeQuery = (enabled: boolean) =>
  useQuery({
    queryKey: ["me"],
    queryFn: me,
    enabled,
    retry: false,
  });
