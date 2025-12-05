import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import api, { refreshAccessToken, setAccessToken } from "@/react-app/services/api";

type User = {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  google_user_data?: {
    picture?: string;
    name?: string;
    given_name?: string;
    email?: string;
  };
};

type AuthContextValue = {
  user: User | null;
  isPending: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function ApiAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);

  const bootstrap = async () => {
    try {
      setIsPending(true);
      await refreshAccessToken();
      const res = await api.get("/auth/me");
      setUser(res.data?.user || null);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    void bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    setAccessToken(res.data?.accessToken || null);
    setUser(res.data?.user || null);
  };

  const register = async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const res = await api.post("/auth/register", data);
    setAccessToken(res.data?.accessToken || null);
    setUser(res.data?.user || null);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isPending, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within ApiAuthProvider");
  return ctx;
}
