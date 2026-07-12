import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { PageLoading } from "@/features/common/components/page-loading";
import { redirectPathFromLocationState } from "@/routes/login-redirect";

/**
 * Public-only routes (e.g. login). Authenticated users go to return path or home.
 * Waits for `/auth/me` bootstrap so a refresh with a valid cookie does not flash login.
 */
export function GuestOutlet() {
  const { isAuthenticated, isPending } = useAuth();
  const location = useLocation();

  if (isPending) {
    return <PageLoading label="Checking session" />;
  }

  if (isAuthenticated) {
    return (
      <Navigate to={redirectPathFromLocationState(location.state)} replace />
    );
  }

  return <Outlet />;
}
