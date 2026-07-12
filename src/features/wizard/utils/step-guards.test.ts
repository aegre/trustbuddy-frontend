import { describe, expect, it } from "vitest";
import {
  getNextWizardStep,
  getPreviousWizardStep,
  getWizardStepIndex,
  isWizardStepAccessible,
  parseWizardStepSlug,
} from "@/features/wizard/utils/step-guards";
import { WIZARD_STEPS } from "@/features/wizard/types/wizard-step-registry";
import { isWizardStepSlug } from "@/features/wizard/types/wizard-steps";

describe("wizard step registry", () => {
  it("registers personal, coverage, and review in order", () => {
    expect(WIZARD_STEPS.map((step) => step.slug)).toEqual([
      "personal",
      "coverage",
      "review",
    ]);
  });
});

describe("step guards", () => {
  it("parses known slugs and rejects unknown", () => {
    expect(parseWizardStepSlug("personal")).toBe("personal");
    expect(parseWizardStepSlug("coverage")).toBe("coverage");
    expect(parseWizardStepSlug("review")).toBe("review");
    expect(parseWizardStepSlug("unknown")).toBeNull();
    expect(parseWizardStepSlug(undefined)).toBeNull();
    expect(isWizardStepSlug("personal")).toBe(true);
    expect(isWizardStepSlug("nope")).toBe(false);
  });

  it("resolves indexes and adjacent steps", () => {
    expect(getWizardStepIndex("personal")).toBe(0);
    expect(getWizardStepIndex("coverage")).toBe(1);
    expect(getWizardStepIndex("review")).toBe(2);

    expect(getPreviousWizardStep("personal")).toBeNull();
    expect(getPreviousWizardStep("coverage")).toBe("personal");
    expect(getNextWizardStep("coverage")).toBe("review");
    expect(getNextWizardStep("review")).toBeNull();
  });

  it("gates review with coverage Yup schema completion", () => {
    expect(isWizardStepAccessible("personal", {})).toBe(true);
    expect(isWizardStepAccessible("coverage", {})).toBe(false);
    expect(isWizardStepAccessible("review", {})).toBe(false);

    expect(isWizardStepAccessible("coverage", { quoteId: "q-1" })).toBe(true);
    expect(
      isWizardStepAccessible("review", {
        quoteId: "q-1",
        // API defaults coverageType to STANDARD; health answers still missing.
        quote: { coverageType: "STANDARD" },
      }),
    ).toBe(false);
    expect(
      isWizardStepAccessible("review", {
        quoteId: "q-1",
        quote: {
          coverageType: "STANDARD",
          takesPrescriptionMedication: false,
          usesTobacco: false,
          needsSpouseCoverage: false,
        },
      }),
    ).toBe(true);
    expect(
      isWizardStepAccessible("review", {
        quoteId: "q-1",
        quote: {
          age: 70,
          coverageType: "STANDARD",
          takesPrescriptionMedication: false,
          usesTobacco: false,
          needsSpouseCoverage: false,
          hasPreexistingConditions: true,
          conditions: [],
        },
      }),
    ).toBe(false);
    expect(
      isWizardStepAccessible("review", {
        quoteId: "q-1",
        quote: {
          age: 70,
          coverageType: "STANDARD",
          takesPrescriptionMedication: false,
          usesTobacco: false,
          needsSpouseCoverage: false,
          hasPreexistingConditions: true,
          conditions: ["DIABETES"],
        },
      }),
    ).toBe(true);
  });
});
