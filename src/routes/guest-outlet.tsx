import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { paths } from "@/routes/paths";

/**
 * Public-only routes (e.g. login). Authenticated users go home.
 */
export function GuestOutlet() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />;
  }

  return <Outlet />;
}
