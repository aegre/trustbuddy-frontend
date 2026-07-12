import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
          setIsAuthenticated(false);
          setUsername(null);
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
  }, [skipSessionCheck]);

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
      setIsAuthenticated(false);
      setUsername(null);
      setIsPending(false);
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isPending, username, login, logout }),
    [isAuthenticated, isPending, username, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
