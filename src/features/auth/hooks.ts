import { useMutation, useQuery } from "@tanstack/react-query";
import { login, me, register } from "@/api/auth";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: login,
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: register,
  });

export const useMeQuery = (enabled: boolean) =>
  useQuery({
    queryKey: ["me"],
    queryFn: me,
    enabled,
    retry: false,
  });
