import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { AppSessionBar } from "@/features/common/components/app-session-bar";
import { PageLoading } from "@/features/common/components/page-loading";
import { paths } from "@/routes/paths";

/**
 * Requires an authenticated session. Guests are sent to /login with return path.
 * Waits for `/auth/me` bootstrap so a refresh with a valid cookie is not bounced to login.
 */
export function ProtectedOutlet() {
  const { isAuthenticated, isPending } = useAuth();
  const location = useLocation();
  const loginRedirectState = useMemo(
    () => ({ from: `${location.pathname}${location.search}` }),
    [location.pathname, location.search],
  );

  if (isPending) {
    return <PageLoading label="Checking session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={loginRedirectState} />;
  }

  return (
    <>
      <AppSessionBar />
      <Outlet />
    </>
  );
}
