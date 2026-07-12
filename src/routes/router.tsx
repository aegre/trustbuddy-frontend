import { createBrowserRouter, Navigate } from "react-router-dom";
import { GuestOutlet } from "@/routes/guest-outlet";
import { LoginRoute } from "@/routes/login-route";
import { paths } from "@/routes/paths";
import { ProtectedOutlet } from "@/routes/protected-outlet";
import { QuotesListRoute } from "@/routes/quotes-list-route";
import { SuccessRoute } from "@/routes/success-route";
import { WizardRoute } from "@/routes/wizard-route";

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
        path: paths.wizardBase,
        element: <Navigate to={paths.wizardPersonal} replace />,
      },
      {
        path: paths.wizardStep,
        element: <WizardRoute />,
      },
      {
        path: paths.success,
        element: <SuccessRoute />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={paths.home} replace />,
  },
]);
