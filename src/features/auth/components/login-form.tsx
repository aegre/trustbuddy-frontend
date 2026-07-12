import { yupResolver } from "@hookform/resolvers/yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login";

export type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  errorMessage?: string | null;
  isSubmitting?: boolean;
};

const formSx = { width: "100%" } as const;

export function LoginForm({
  onSubmit,
  errorMessage,
  isSubmitting = false,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((visible) => !visible);
  }, []);

  const preventMouseDown = useCallback((event: MouseEvent) => {
    event.preventDefault();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { username: "", password: "" },
  });

  const passwordInputSlotProps = useMemo(
    () => ({
      input: {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={toggleShowPassword}
              onMouseDown={preventMouseDown}
              edge="end"
              disabled={isSubmitting}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      },
    }),
    [isSubmitting, preventMouseDown, showPassword, toggleShowPassword],
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={formSx}
    >
      <Stack spacing={3}>
        <Typography component="h1" variant="h5">
          Sign in to Trustbuddy
        </Typography>

        {errorMessage ? (
          <Alert severity="error" role="alert">
            {errorMessage}
          </Alert>
        ) : null}

        <TextField
          {...register("username")}
          id="login-username"
          label="Username"
          type="text"
          autoComplete="username"
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          disabled={isSubmitting}
          fullWidth
        />

        <TextField
          {...register("password")}
          id="login-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          disabled={isSubmitting}
          fullWidth
          slotProps={passwordInputSlotProps}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </Stack>
    </Box>
  );
}
