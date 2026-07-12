import * as yup from "yup";

export const COVERAGE_TYPES = ["BASIC", "STANDARD", "PREMIUM"] as const;
export type CoverageTypeValue = (typeof COVERAGE_TYPES)[number];

export const CONDITION_OPTIONS = [
  "DIABETES",
  "HEART_DISEASE",
  "HYPERTENSION",
  "CANCER_HISTORY",
  "OTHER",
] as const;
export type ConditionValue = (typeof CONDITION_OPTIONS)[number];

export function isSeniorApplicant(age: number | undefined): boolean {
  return typeof age === "number" && age > 65;
}

export function createCoverageSchema(age?: number) {
  const senior = isSeniorApplicant(age);

  return yup.object({
    coverageType: yup
      .string()
      .oneOf([...COVERAGE_TYPES], "Select a coverage type")
      .required("Coverage type is required"),
    takesPrescriptionMedication: yup
      .boolean()
      .required("Select whether you take prescription medication"),
    usesTobacco: yup.boolean().required("Select whether you use tobacco"),
    needsSpouseCoverage: yup
      .boolean()
      .required("Select whether you need spouse coverage"),
    hasPreexistingConditions: senior
      ? yup
          .boolean()
          .required("Indicate whether you have pre-existing conditions")
      : yup.boolean().optional(),
    conditions: yup
      .array()
      .of(
        yup
          .string()
          .oneOf([...CONDITION_OPTIONS])
          .required(),
      )
      .default([])
      .when("hasPreexistingConditions", ([hasConditions], schema) =>
        hasConditions === true
          ? schema
              .min(1, "Select at least one condition")
              .required("Select at least one condition")
          : schema,
      ),
  });
}

export type CoverageFormValues = yup.InferType<
  ReturnType<typeof createCoverageSchema>
>;

export const emptyCoverageDefaults: CoverageFormValues = {
  coverageType: "" as CoverageTypeValue,
  takesPrescriptionMedication: false,
  usesTobacco: false,
  needsSpouseCoverage: false,
  hasPreexistingConditions: undefined,
  conditions: [],
};

export const CONDITION_LABELS: Record<ConditionValue, string> = {
  DIABETES: "Diabetes",
  HEART_DISEASE: "Heart disease",
  HYPERTENSION: "Hypertension",
  CANCER_HISTORY: "Cancer history",
  OTHER: "Other",
};

export const COVERAGE_TYPE_LABELS: Record<CoverageTypeValue, string> = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};
