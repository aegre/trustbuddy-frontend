import { yupResolver } from "@hookform/resolvers/yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { formatQuotePremium } from "@/features/quotes/utils/format-quote";
import {
  CONDITION_LABELS,
  CONDITION_OPTIONS,
  COVERAGE_TYPE_LABELS,
  COVERAGE_TYPES,
  createCoverageSchema,
  emptyCoverageDefaults,
  isSeniorApplicant,
  type ConditionValue,
  type CoverageFormValues,
  type CoverageTypeValue,
} from "@/features/wizard/schemas/coverage";

export type CoverageFormProps = {
  onSubmit: (values: CoverageFormValues) => void | Promise<void>;
  defaultValues?: Partial<CoverageFormValues>;
  age?: number;
  estimatedMonthlyPremium?: number;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  readOnly?: boolean;
};

const formSx = { width: "100%" } as const;

export function CoverageForm({
  onSubmit,
  defaultValues,
  age,
  estimatedMonthlyPremium,
  errorMessage,
  isSubmitting = false,
  readOnly = false,
}: CoverageFormProps) {
  const disabled = isSubmitting || readOnly;
  const senior = isSeniorApplicant(age);
  const schema = createCoverageSchema(age);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CoverageFormValues>({
    resolver: yupResolver(schema) as Resolver<CoverageFormValues>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { ...emptyCoverageDefaults, ...defaultValues },
  });

  const hasPreexistingConditions = useWatch({
    control,
    name: "hasPreexistingConditions",
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
          Coverage
        </Typography>

        {typeof estimatedMonthlyPremium === "number" ? (
          <Typography variant="body1">
            Estimated monthly premium:{" "}
            <strong>{formatQuotePremium(estimatedMonthlyPremium)}</strong>
          </Typography>
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
            <FormControl fullWidth error={Boolean(errors.coverageType)}>
              <InputLabel id="coverage-type-label">Coverage type</InputLabel>
              <Select
                {...field}
                labelId="coverage-type-label"
                id="coverage-type"
                label="Coverage type"
                disabled={disabled}
                value={field.value ?? ""}
              >
                {COVERAGE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {COVERAGE_TYPE_LABELS[type]}
                  </MenuItem>
                ))}
              </Select>
              {errors.coverageType?.message ? (
                <FormHelperText>{errors.coverageType.message}</FormHelperText>
              ) : null}
            </FormControl>
          )}
        />

        <Controller
          name="takesPrescriptionMedication"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(_, checked) => field.onChange(checked)}
                  disabled={disabled}
                />
              }
              label="Takes prescription medication"
            />
          )}
        />

        <Controller
          name="usesTobacco"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(_, checked) => field.onChange(checked)}
                  disabled={disabled}
                />
              }
              label="Uses tobacco"
            />
          )}
        />

        <Controller
          name="needsSpouseCoverage"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(_, checked) => field.onChange(checked)}
                  disabled={disabled}
                />
              }
              label="Needs spouse coverage"
            />
          )}
        />

        {senior ? (
          <Controller
            name="hasPreexistingConditions"
            control={control}
            render={({ field }) => (
              <FormControl error={Boolean(errors.hasPreexistingConditions)}>
                <FormLabel id="preexisting-label">
                  Pre-existing conditions
                </FormLabel>
                <RadioGroup
                  aria-labelledby="preexisting-label"
                  row
                  value={
                    field.value === undefined ? "" : field.value ? "yes" : "no"
                  }
                  onChange={(event) =>
                    field.onChange(event.target.value === "yes")
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio disabled={disabled} />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio disabled={disabled} />}
                    label="No"
                  />
                </RadioGroup>
                {errors.hasPreexistingConditions?.message ? (
                  <FormHelperText>
                    {errors.hasPreexistingConditions.message}
                  </FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
        ) : null}

        {senior && hasPreexistingConditions ? (
          <Controller
            name="conditions"
            control={control}
            render={({ field }) => (
              <FormControl
                component="fieldset"
                error={Boolean(errors.conditions)}
              >
                <FormLabel component="legend">Conditions</FormLabel>
                <FormGroup>
                  {CONDITION_OPTIONS.map((condition) => {
                    const selected = (field.value ?? []) as ConditionValue[];
                    return (
                      <FormControlLabel
                        key={condition}
                        control={
                          <Checkbox
                            checked={selected.includes(condition)}
                            disabled={disabled}
                            onChange={(_, checked) => {
                              field.onChange(
                                checked
                                  ? [...selected, condition]
                                  : selected.filter(
                                      (item) => item !== condition,
                                    ),
                              );
                            }}
                          />
                        }
                        label={CONDITION_LABELS[condition]}
                      />
                    );
                  })}
                </FormGroup>
                {errors.conditions?.message ? (
                  <FormHelperText>{errors.conditions.message}</FormHelperText>
                ) : null}
              </FormControl>
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
