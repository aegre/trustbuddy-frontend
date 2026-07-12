import type { QuoteResponse } from "@/api/types";
import {
  createCoverageSchema,
  type ConditionValue,
  type CoverageFormValues,
  type CoverageTypeValue,
} from "@/features/wizard/schemas/coverage";
import {
  isWizardStepSlug,
  WIZARD_STEP_SLUGS,
  type WizardStepSlug,
} from "@/features/wizard/types/wizard-steps";

export function parseWizardStepSlug(
  value: string | undefined,
): WizardStepSlug | null {
  if (!isWizardStepSlug(value)) {
    return null;
  }
  return value;
}

export function getWizardStepIndex(slug: WizardStepSlug): number {
  return WIZARD_STEP_SLUGS.indexOf(slug);
}

export function getPreviousWizardStep(
  slug: WizardStepSlug,
): WizardStepSlug | null {
  const index = getWizardStepIndex(slug);
  if (index <= 0) {
    return null;
  }
  return WIZARD_STEP_SLUGS[index - 1] ?? null;
}

export function getNextWizardStep(slug: WizardStepSlug): WizardStepSlug | null {
  const index = getWizardStepIndex(slug);
  if (index < 0 || index >= WIZARD_STEP_SLUGS.length - 1) {
    return null;
  }
  return WIZARD_STEP_SLUGS[index + 1] ?? null;
}

export type WizardStepAccessContext = {
  quoteId?: string;
  quote?: QuoteResponse | null;
};

function toCoverageFormValues(quote: QuoteResponse): CoverageFormValues {
  return {
    coverageType: (quote.coverageType ?? "") as CoverageTypeValue | "",
    takesPrescriptionMedication: quote.takesPrescriptionMedication ?? undefined,
    usesTobacco: quote.usesTobacco ?? undefined,
    needsSpouseCoverage: quote.needsSpouseCoverage ?? undefined,
    hasPreexistingConditions: quote.hasPreexistingConditions ?? undefined,
    conditions: (quote.conditions ?? []) as ConditionValue[],
  };
}

/** Coverage step is complete when quote data satisfies the coverage Yup schema. */
export function hasCompletedCoverageStep(
  quote: QuoteResponse | null | undefined,
): boolean {
  if (quote == null) {
    return false;
  }
  return createCoverageSchema(quote.age).isValidSync(
    toCoverageFormValues(quote),
  );
}

/**
 * Which stepper steps can be opened.
 * Personal is always available; coverage needs a quote id;
 * review needs coverage Yup validation to pass on the quote payload.
 */
export function isWizardStepAccessible(
  slug: WizardStepSlug,
  context: WizardStepAccessContext,
): boolean {
  if (slug === "personal") {
    return true;
  }
  if (!context.quoteId) {
    return false;
  }
  if (slug === "coverage") {
    return true;
  }
  return hasCompletedCoverageStep(context.quote);
}
