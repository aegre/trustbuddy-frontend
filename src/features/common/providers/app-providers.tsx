import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { AuthProvider, type AuthProviderProps } from "@/features/auth";
import { appTheme } from "@/features/common/theme/app-theme";

export type AppProvidersProps = {
  children: ReactNode;
} & Pick<AuthProviderProps, "initialAuthenticated">;

export function AppProviders({
  children,
  initialAuthenticated,
}: AppProvidersProps) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider initialAuthenticated={initialAuthenticated}>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
