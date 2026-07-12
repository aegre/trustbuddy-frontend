import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { paths } from "@/routes/paths";

/**
 * Requires an authenticated session. Guests are sent to /login with return path.
 */
export function ProtectedOutlet() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const loginRedirectState = useMemo(
    () => ({ from: location.pathname }),
    [location.pathname],
  );

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={loginRedirectState} />;
  }

  return <Outlet />;
}
