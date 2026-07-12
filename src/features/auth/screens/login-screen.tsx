import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import {
  LoginForm,
  type LoginFormProps,
} from "@/features/auth/components/login-form";

export type LoginScreenProps = LoginFormProps;

const containerSx = { py: 8 } as const;
const paperSx = { p: 4 } as const;

export function LoginScreen(props: LoginScreenProps) {
  return (
    <Container component="main" maxWidth="xs" sx={containerSx}>
      <Paper elevation={1} sx={paperSx}>
        <LoginForm {...props} />
      </Paper>
    </Container>
  );
}
