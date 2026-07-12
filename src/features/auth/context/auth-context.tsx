import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setUnauthorizedHandler } from "@/api/auth-session";
import {
  logout as logoutRequest,
  me,
  token,
} from "@/api/generated/authentication/authentication";
import type { AuthTokenRequest } from "@/api/types";

export type AuthContextValue = {
  isAuthenticated: boolean;
  isPending: boolean;
  username: string | null;
  login: (credentials: AuthTokenRequest) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
  /**
   * When set, skip `GET /auth/me` bootstrap (tests).
   * Omit in the app so refresh restores the cookie session.
   */
  initialAuthenticated?: boolean;
};

/**
 * UI session flags only — JWT stays in the HttpOnly cookie.
 * On mount (unless overridden for tests), calls `/api/v1/auth/me` to detect an existing session.
 * Clears the session when customFetch reports 401 on authenticated endpoints.
 */
export function AuthProvider({
  children,
  initialAuthenticated,
}: AuthProviderProps) {
  const skipSessionCheck = initialAuthenticated !== undefined;
  const [isAuthenticated, setIsAuthenticated] = useState(
    initialAuthenticated ?? false,
  );
  const [username, setUsername] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(!skipSessionCheck);

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setUsername(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  useEffect(() => {
    if (skipSessionCheck) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await me();
        if (!cancelled) {
          setIsAuthenticated(true);
          setUsername(response.data.username ?? null);
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsPending(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearSession, skipSessionCheck]);

  const login = useCallback(async (credentials: AuthTokenRequest) => {
    setIsPending(true);
    try {
      await token(credentials);
      setIsAuthenticated(true);
      setUsername(credentials.username);
    } finally {
      setIsPending(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsPending(true);
    try {
      await logoutRequest();
    } finally {
      clearSession();
      setIsPending(false);
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ isAuthenticated, isPending, username, login, logout }),
    [isAuthenticated, isPending, username, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
