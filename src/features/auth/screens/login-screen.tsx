import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserFacingErrorMessage } from "@/api/types";
import { LoginForm } from "@/features/auth/components/login-form";
import { useAuth } from "@/features/auth/context/use-auth";
import type { LoginFormValues } from "@/features/auth/schemas/login";
import { paths } from "@/routes/paths";

const containerSx = { py: 8 } as const;
const paperSx = { p: 4 } as const;

function redirectFromLocationState(state: unknown): string {
  if (
    typeof state === "object" &&
    state !== null &&
    "from" in state &&
    typeof state.from === "string" &&
    state.from.startsWith("/")
  ) {
    return state.from;
  }
  return paths.home;
}

export function LoginScreen() {
  const { login, isPending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setErrorMessage(null);
      try {
        await login(values);
        navigate(redirectFromLocationState(location.state), { replace: true });
      } catch (error) {
        setErrorMessage(
          getUserFacingErrorMessage(error, "Invalid credentials"),
        );
      }
    },
    [login, location.state, navigate],
  );

  return (
    <Container component="main" maxWidth="xs" sx={containerSx}>
      <Paper elevation={1} sx={paperSx}>
        <LoginForm
          onSubmit={onSubmit}
          errorMessage={errorMessage}
          isSubmitting={isPending}
        />
      </Paper>
    </Container>
  );
}
