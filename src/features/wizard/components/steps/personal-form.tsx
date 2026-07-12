import { yupResolver } from "@hookform/resolvers/yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import {
  emptyPersonalDefaults,
  personalSchema,
  type PersonalFormValues,
} from "@/features/wizard/schemas/personal";

export type PersonalFormProps = {
  onSubmit: (values: PersonalFormValues) => void | Promise<void>;
  defaultValues?: Partial<PersonalFormValues>;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  readOnly?: boolean;
};

const formSx = { width: "100%" } as const;

export function PersonalForm({
  onSubmit,
  defaultValues,
  errorMessage,
  isSubmitting = false,
  readOnly = false,
}: PersonalFormProps) {
  const disabled = isSubmitting || readOnly;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalFormValues>({
    resolver: yupResolver(personalSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { ...emptyPersonalDefaults, ...defaultValues },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={formSx}
    >
      <Stack spacing={3}>
        <Typography component="h2" variant="h6">
          Personal information
        </Typography>

        {errorMessage ? (
          <Alert severity="error" role="alert">
            {errorMessage}
          </Alert>
        ) : null}

        <TextField
          {...register("name")}
          id="personal-name"
          label="Full name"
          type="text"
          autoComplete="name"
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          disabled={disabled}
          fullWidth
          slotProps={{ input: { readOnly } }}
        />

        <TextField
          {...register("email")}
          id="personal-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          disabled={disabled}
          fullWidth
          slotProps={{ input: { readOnly } }}
        />

        <TextField
          {...register("age", { valueAsNumber: true })}
          id="personal-age"
          label="Age"
          type="number"
          inputMode="numeric"
          error={Boolean(errors.age)}
          helperText={errors.age?.message}
          disabled={disabled}
          fullWidth
          slotProps={{
            htmlInput: { min: 1, max: 120 },
            input: { readOnly },
          }}
        />

        <TextField
          {...register("zipCode")}
          id="personal-zip"
          label="ZIP code"
          type="text"
          autoComplete="postal-code"
          error={Boolean(errors.zipCode)}
          helperText={errors.zipCode?.message}
          disabled={disabled}
          fullWidth
          slotProps={{
            htmlInput: { inputMode: "numeric", maxLength: 5 },
            input: { readOnly },
          }}
        />

        {readOnly ? null : (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Continue"}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
