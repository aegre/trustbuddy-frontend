import { describe, expect, it } from "vitest";
import { createCoverageSchema } from "@/features/wizard/schemas/coverage";

describe("createCoverageSchema", () => {
  it("given_nonSeniorWithNullPreexisting_when_validated_then_passes", async () => {
    await expect(
      createCoverageSchema(40).validate({
        coverageType: "STANDARD",
        takesPrescriptionMedication: false,
        usesTobacco: false,
        needsSpouseCoverage: false,
        hasPreexistingConditions: null,
        conditions: [],
      }),
    ).resolves.toMatchObject({
      coverageType: "STANDARD",
      usesTobacco: false,
    });
  });

  it("given_seniorWithoutPreexistingAnswer_when_validated_then_fails", async () => {
    await expect(
      createCoverageSchema(70).validate({
        coverageType: "STANDARD",
        takesPrescriptionMedication: false,
        usesTobacco: false,
        needsSpouseCoverage: false,
        hasPreexistingConditions: null,
        conditions: [],
      }),
    ).rejects.toThrow(/pre-existing/i);
  });
});
