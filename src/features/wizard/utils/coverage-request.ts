import type { UpdateCoverageRequest } from "@/api/types";
import {
  isSeniorApplicant,
  type ConditionValue,
  type CoverageFormValues,
  type CoverageTypeValue,
} from "@/features/wizard/schemas/coverage";

/** Full payload for Continue — unanswered booleans coerce to false. */
export function toUpdateCoverageRequest(
  values: CoverageFormValues,
  age: number | undefined,
): UpdateCoverageRequest {
  const senior = isSeniorApplicant(age);
  const request: UpdateCoverageRequest = {
    coverageType: values.coverageType as CoverageTypeValue,
    takesPrescriptionMedication: values.takesPrescriptionMedication === true,
    usesTobacco: values.usesTobacco === true,
    needsSpouseCoverage: values.needsSpouseCoverage === true,
  };

  if (senior) {
    request.hasPreexistingConditions = values.hasPreexistingConditions;
    request.conditions =
      values.hasPreexistingConditions === true
        ? ((values.conditions ?? []) as ConditionValue[])
        : [];
  }

  return request;
}

/**
 * Partial payload for live premium refresh.
 * Only includes fields the user has answered so incomplete forms can PATCH.
 */
export function toPartialUpdateCoverageRequest(
  values: CoverageFormValues,
  age: number | undefined,
): UpdateCoverageRequest | null {
  const request: UpdateCoverageRequest = {};

  if (values.coverageType) {
    request.coverageType = values.coverageType;
  }
  if (typeof values.takesPrescriptionMedication === "boolean") {
    request.takesPrescriptionMedication = values.takesPrescriptionMedication;
  }
  if (typeof values.usesTobacco === "boolean") {
    request.usesTobacco = values.usesTobacco;
  }
  if (typeof values.needsSpouseCoverage === "boolean") {
    request.needsSpouseCoverage = values.needsSpouseCoverage;
  }

  if (isSeniorApplicant(age)) {
    if (typeof values.hasPreexistingConditions === "boolean") {
      request.hasPreexistingConditions = values.hasPreexistingConditions;
      request.conditions =
        values.hasPreexistingConditions === true
          ? ((values.conditions ?? []) as ConditionValue[])
          : [];
    }
  }

  return Object.keys(request).length > 0 ? request : null;
}
