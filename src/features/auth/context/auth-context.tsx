import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  logout as logoutRequest,
  token,
} from "@/api/generated/authentication/authentication";
import type { AuthTokenRequest } from "@/api/types";

export type AuthContextValue = {
  isAuthenticated: boolean;
  isPending: boolean;
  login: (credentials: AuthTokenRequest) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
  /** Override initial session flag (tests). Cookie presence is not readable from JS. */
  initialAuthenticated?: boolean;
};

/**
 * UI session flags only — JWT stays in the HttpOnly cookie via Orval `token` / `logout`.
 */
export function AuthProvider({
  children,
  initialAuthenticated = false,
}: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [isPending, setIsPending] = useState(false);

  const login = useCallback(async (credentials: AuthTokenRequest) => {
    setIsPending(true);
    try {
      await token(credentials);
      setIsAuthenticated(true);
    } finally {
      setIsPending(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsPending(true);
    try {
      await logoutRequest();
    } finally {
      setIsAuthenticated(false);
      setIsPending(false);
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isPending, login, logout }),
    [isAuthenticated, isPending, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
