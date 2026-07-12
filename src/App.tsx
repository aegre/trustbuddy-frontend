import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/features/common/providers/app-providers";
import { router } from "@/routes/router";

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
