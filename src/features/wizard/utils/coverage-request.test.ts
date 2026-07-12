import { describe, expect, it } from "vitest";
import type { UpdateCoverageRequest } from "@/api/types";
import {
  isSeniorApplicant,
  type CoverageFormValues,
} from "@/features/wizard/schemas/coverage";
import {
  toPartialUpdateCoverageRequest,
  toUpdateCoverageRequest,
} from "@/features/wizard/utils/coverage-request";

describe("coverage-request", () => {
  it("given_incompleteValues_when_toPartial_then_omitsUnsetFields", () => {
    const values: CoverageFormValues = {
      coverageType: "STANDARD",
      takesPrescriptionMedication: undefined,
      usesTobacco: true,
      needsSpouseCoverage: undefined,
      conditions: [],
    };

    expect(toPartialUpdateCoverageRequest(values, 40)).toEqual({
      coverageType: "STANDARD",
      usesTobacco: true,
    } satisfies UpdateCoverageRequest);
  });

  it("given_emptyForm_when_toPartial_then_returnsNull", () => {
    expect(
      toPartialUpdateCoverageRequest(
        {
          coverageType: "",
          conditions: [],
        },
        40,
      ),
    ).toBeNull();
  });

  it("given_completeValues_when_toUpdate_then_coercesBooleans", () => {
    expect(
      toUpdateCoverageRequest(
        {
          coverageType: "BASIC",
          takesPrescriptionMedication: undefined,
          usesTobacco: true,
          needsSpouseCoverage: false,
          conditions: [],
        },
        40,
      ),
    ).toEqual({
      coverageType: "BASIC",
      takesPrescriptionMedication: false,
      usesTobacco: true,
      needsSpouseCoverage: false,
    });
  });

  it("given_seniorWithoutPreexisting_when_toPartial_then_clearsConditions", () => {
    expect(isSeniorApplicant(70)).toBe(true);
    expect(
      toPartialUpdateCoverageRequest(
        {
          coverageType: "PREMIUM",
          hasPreexistingConditions: false,
          conditions: ["DIABETES"],
        },
        70,
      ),
    ).toEqual({
      coverageType: "PREMIUM",
      hasPreexistingConditions: false,
      conditions: [],
    });
  });
});
