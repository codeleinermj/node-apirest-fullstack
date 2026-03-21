"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, LoginInput, RegisterInput } from "@/lib/types";
import * as api from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginInput) => Promise<string | null>;
  register: (data: RegisterInput) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const tokens = api.getTokens();
    if (tokens?.accessToken) {
      try {
        const payload = JSON.parse(atob(tokens.accessToken.split(".")[1]));
        setState({
          user: {
            id: payload.sub,
            email: payload.email || "",
            name: payload.name || "",
            role: payload.role || "USER",
            createdAt: "",
            updatedAt: "",
          },
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        api.clearTokens();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(async (data: LoginInput): Promise<string | null> => {
    const res = await api.login(data);
    if (!res.success) return res.error.message;
    setState({
      user: res.data.user,
      isLoading: false,
      isAuthenticated: true,
    });
    return null;
  }, []);

  const register = useCallback(async (data: RegisterInput): Promise<string | null> => {
    const res = await api.register(data);
    if (!res.success) return res.error.message;
    setState({
      user: res.data.user,
      isLoading: false,
      isAuthenticated: true,
    });
    return null;
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
