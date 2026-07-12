import { createBrowserRouter, Navigate } from "react-router-dom";
import { GuestOutlet } from "@/routes/guest-outlet";
import { LoginRoute } from "@/routes/login-route";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";
import { QuotesListRoute } from "@/routes/quotes-list-route";
import { WizardPersonalRoute } from "@/routes/wizard-personal-route";

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
        element: <QuotesListRoute />,
      },
      {
        path: paths.wizardPersonal,
        element: <WizardPersonalRoute />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={paths.home} replace />,
  },
]);
