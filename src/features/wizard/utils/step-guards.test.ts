import { describe, expect } from "vitest";
import test from "vitest-gwt";
import {
  getNextWizardStep,
  getPreviousWizardStep,
  getWizardStepIndex,
  parseWizardStepSlug,
} from "@/features/wizard/utils/step-guards";
import { WIZARD_STEPS } from "@/features/wizard/types/wizard-step-registry";
import { isWizardStepSlug } from "@/features/wizard/types/wizard-steps";

describe("wizard step registry", () => {
  test("registers personal, coverage, and review in order", {
    then: {
      steps_are_in_order,
    },
  });
});

describe("step guards", () => {
  test("parses known slugs and rejects unknown", {
    then: {
      known_slugs_parse,
      unknown_slugs_are_rejected,
    },
  });

  test("resolves indexes and adjacent steps", {
    then: {
      step_indexes_match_order,
      adjacent_steps_resolve,
    },
  });
});

function steps_are_in_order() {
  expect(WIZARD_STEPS.map((step) => step.slug)).toEqual([
    "personal",
    "coverage",
    "review",
  ]);
}

function known_slugs_parse() {
  expect(parseWizardStepSlug("personal")).toBe("personal");
  expect(parseWizardStepSlug("coverage")).toBe("coverage");
  expect(parseWizardStepSlug("review")).toBe("review");
  expect(isWizardStepSlug("personal")).toBe(true);
}

function unknown_slugs_are_rejected() {
  expect(parseWizardStepSlug("unknown")).toBeNull();
  expect(parseWizardStepSlug(undefined)).toBeNull();
  expect(isWizardStepSlug("nope")).toBe(false);
}

function step_indexes_match_order() {
  expect(getWizardStepIndex("personal")).toBe(0);
  expect(getWizardStepIndex("coverage")).toBe(1);
  expect(getWizardStepIndex("review")).toBe(2);
}

function adjacent_steps_resolve() {
  expect(getPreviousWizardStep("personal")).toBeNull();
  expect(getPreviousWizardStep("coverage")).toBe("personal");
  expect(getNextWizardStep("coverage")).toBe("review");
  expect(getNextWizardStep("review")).toBeNull();
}
