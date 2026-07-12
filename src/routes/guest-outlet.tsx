import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { paths } from "@/routes/paths";

/**
 * Public-only routes (e.g. login). Authenticated users go home.
 * Waits for `/auth/me` bootstrap so a refresh with a valid cookie does not flash login.
 */
export function GuestOutlet() {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />;
  }

  return <Outlet />;
}
