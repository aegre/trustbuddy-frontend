import { createBrowserRouter, Navigate } from "react-router-dom";
import { QuotesHomePlaceholder } from "@/features/quotes/screens/quotes-home-placeholder";
import { GuestOutlet } from "@/routes/guest-outlet";
import { LoginRoute } from "@/routes/login-route";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";

export const router = createBrowserRouter([
  {
    element: <GuestOutlet />,
    children: [
      {
        path: paths.login,
        element: <LoginRoute />,
      },
    ],
  },
  {
    element: <ProtectedOutlet />,
    children: [
      {
        path: paths.home,
        element: <QuotesHomePlaceholder />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={paths.home} replace />,
  },
]);
