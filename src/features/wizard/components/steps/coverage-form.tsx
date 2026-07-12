import { yupResolver } from "@hookform/resolvers/yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { formatQuotePremium } from "@/features/quotes/utils/format-quote";
import { ConditionCards } from "@/features/wizard/components/condition-cards";
import { CoverageTypeCards } from "@/features/wizard/components/coverage-type-cards";
import { YesNoToggle } from "@/features/wizard/components/yes-no-toggle";
import {
  createCoverageSchema,
  emptyCoverageDefaults,
  isSeniorApplicant,
  type ConditionValue,
  type CoverageFormValues,
  type CoverageTypeValue,
} from "@/features/wizard/schemas/coverage";

export type CoverageFormProps = {
  onSubmit: (values: CoverageFormValues) => void | Promise<void>;
  onValuesChange?: (values: CoverageFormValues) => void;
  onRetryPremium?: (values: CoverageFormValues) => void;
  defaultValues?: Partial<CoverageFormValues>;
  age?: number;
  estimatedMonthlyPremium?: number;
  isPremiumLoading?: boolean;
  premiumErrorMessage?: string | null;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  readOnly?: boolean;
};

const formSx = { width: "100%" } as const;

const premiumRowSx = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1,
  minHeight: 24,
} as const;

export function CoverageForm({
  onSubmit,
  onValuesChange,
  onRetryPremium,
  defaultValues,
  age,
  estimatedMonthlyPremium,
  isPremiumLoading = false,
  premiumErrorMessage,
  errorMessage,
  isSubmitting = false,
  readOnly = false,
}: CoverageFormProps) {
  const disabled = isSubmitting || readOnly;
  const senior = isSeniorApplicant(age);
  const schema = createCoverageSchema(age);
  const skipValuesChange = useRef(true);
  const onValuesChangeRef = useRef(onValuesChange);
  onValuesChangeRef.current = onValuesChange;

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CoverageFormValues>({
    resolver: yupResolver(schema) as Resolver<CoverageFormValues>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { ...emptyCoverageDefaults, ...defaultValues },
  });

  const watchedValues = useWatch({ control });
  const hasPreexistingConditions = useWatch({
    control,
    name: "hasPreexistingConditions",
  });

  useEffect(() => {
    if (skipValuesChange.current) {
      skipValuesChange.current = false;
      return;
    }
    onValuesChangeRef.current?.(watchedValues as CoverageFormValues);
  }, [watchedValues]);

  const showPremiumRow =
    typeof estimatedMonthlyPremium === "number" ||
    isPremiumLoading ||
    Boolean(premiumErrorMessage);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={formSx}
    >
      <Stack spacing={3}>
        <Typography component="h2" variant="h6">
          Coverage
        </Typography>

        {showPremiumRow ? (
          <Stack spacing={1}>
            <Typography component="div" variant="body1" sx={premiumRowSx}>
              <span>Estimated monthly premium:</span>
              {isPremiumLoading ? (
                <CircularProgress
                  size={16}
                  aria-label="Updating estimated monthly premium"
                />
              ) : typeof estimatedMonthlyPremium === "number" ? (
                <strong>{formatQuotePremium(estimatedMonthlyPremium)}</strong>
              ) : null}
            </Typography>
            {premiumErrorMessage && !isPremiumLoading ? (
              <Alert
                severity="error"
                role="alert"
                action={
                  onRetryPremium ? (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => onRetryPremium(getValues())}
                    >
                      Retry
                    </Button>
                  ) : null
                }
              >
                {premiumErrorMessage}
              </Alert>
            ) : null}
          </Stack>
        ) : null}

        {errorMessage ? (
          <Alert severity="error" role="alert">
            {errorMessage}
          </Alert>
        ) : null}

        <Controller
          name="coverageType"
          control={control}
          render={({ field }) => (
            <CoverageTypeCards
              name={field.name}
              value={(field.value ?? "") as CoverageTypeValue | ""}
              onChange={field.onChange}
              disabled={disabled}
              error={Boolean(errors.coverageType)}
              helperText={errors.coverageType?.message}
            />
          )}
        />

        <Controller
          name="takesPrescriptionMedication"
          control={control}
          render={({ field }) => (
            <YesNoToggle
              label="Takes prescription medication"
              labelId="takes-prescription-label"
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              error={Boolean(errors.takesPrescriptionMedication)}
              helperText={errors.takesPrescriptionMedication?.message}
            />
          )}
        />

        <Controller
          name="usesTobacco"
          control={control}
          render={({ field }) => (
            <YesNoToggle
              label="Uses tobacco"
              labelId="uses-tobacco-label"
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              error={Boolean(errors.usesTobacco)}
              helperText={errors.usesTobacco?.message}
            />
          )}
        />

        <Controller
          name="needsSpouseCoverage"
          control={control}
          render={({ field }) => (
            <YesNoToggle
              label="Needs spouse coverage"
              labelId="needs-spouse-label"
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              error={Boolean(errors.needsSpouseCoverage)}
              helperText={errors.needsSpouseCoverage?.message}
            />
          )}
        />

        {senior ? (
          <Controller
            name="hasPreexistingConditions"
            control={control}
            render={({ field }) => (
              <YesNoToggle
                label="Pre-existing conditions"
                labelId="preexisting-label"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                error={Boolean(errors.hasPreexistingConditions)}
                helperText={errors.hasPreexistingConditions?.message}
              />
            )}
          />
        ) : null}

        {senior && hasPreexistingConditions ? (
          <Controller
            name="conditions"
            control={control}
            render={({ field }) => (
              <ConditionCards
                value={(field.value ?? []) as ConditionValue[]}
                onChange={field.onChange}
                disabled={disabled}
                error={Boolean(errors.conditions)}
                helperText={errors.conditions?.message}
              />
            )}
          />
        ) : null}

        {readOnly ? null : (
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Saving…" : "Continue"}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export type { CoverageFormValues, CoverageTypeValue };
