import { QueryClientProvider } from "@tanstack/react-query";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { useState, type ReactNode } from "react";
import { AuthProvider, type AuthProviderProps } from "@/features/auth";
import { createAppQueryClient } from "@/features/common/query/query-client";
import { appTheme } from "@/features/common/theme/app-theme";

export type AppProvidersProps = {
  children: ReactNode;
  queryClient?: ReturnType<typeof createAppQueryClient>;
} & Pick<AuthProviderProps, "initialAuthenticated">;

export function AppProviders({
  children,
  initialAuthenticated,
  queryClient: queryClientProp,
}: AppProvidersProps) {
  const [defaultQueryClient] = useState(createAppQueryClient);
  const queryClient = queryClientProp ?? defaultQueryClient;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <AuthProvider initialAuthenticated={initialAuthenticated}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
