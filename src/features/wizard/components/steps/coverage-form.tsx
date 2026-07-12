import { yupResolver } from "@hookform/resolvers/yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { formatQuotePremium } from "@/features/quotes/utils/format-quote";
import { YesNoToggle } from "@/features/wizard/components/yes-no-toggle";
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

const coverageTypeGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
  gap: 1.5,
} as const;

const coverageCardLabelSx = {
  m: 0,
  width: "100%",
  px: 2,
  py: 2.5,
  justifyContent: "center",
  "& .MuiFormControlLabel-label": {
    flex: 1,
    textAlign: "center",
  },
} as const;

const coverageTypeTitleSx = { fontWeight: 600 } as const;

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
            <FormControl
              component="fieldset"
              fullWidth
              error={Boolean(errors.coverageType)}
            >
              <FormLabel id="coverage-type-label" component="legend">
                Coverage type
              </FormLabel>
              <RadioGroup
                aria-labelledby="coverage-type-label"
                name={field.name}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                sx={coverageTypeGridSx}
              >
                {COVERAGE_TYPES.map((type) => {
                  const selected = field.value === type;
                  return (
                    <Card
                      key={type}
                      variant="outlined"
                      sx={{
                        borderColor: selected ? "primary.main" : "divider",
                        borderWidth: selected ? 2 : 1,
                        bgcolor: selected
                          ? "action.selected"
                          : "background.paper",
                      }}
                    >
                      <FormControlLabel
                        value={type}
                        disabled={disabled}
                        control={<Radio />}
                        label={
                          <Typography
                            variant="subtitle1"
                            sx={coverageTypeTitleSx}
                          >
                            {COVERAGE_TYPE_LABELS[type]}
                          </Typography>
                        }
                        sx={coverageCardLabelSx}
                      />
                    </Card>
                  );
                })}
              </RadioGroup>
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
