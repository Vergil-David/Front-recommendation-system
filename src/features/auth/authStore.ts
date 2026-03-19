import { create } from "zustand";
import type { User } from "@/types/api";
import { clearToken, getToken, setToken as setTokenStorage } from "@/utils/storage";

type AuthState = {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  user: null,
  setToken: (token) => {
    setTokenStorage(token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    clearToken();
    set({ token: null, user: null });
  },
}));
