import {
  isWizardStepSlug,
  WIZARD_STEP_SLUGS,
  type WizardStepSlug,
} from "@/features/wizard/types/wizard-steps";
import type { QuoteResponse } from "@/api/types";

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

/** True once coverage health answers exist (coverageType is defaulted at create). */
export function hasCompletedCoverageStep(
  quote: QuoteResponse | null | undefined,
): boolean {
  if (quote == null) {
    return false;
  }
  const healthAnswered =
    quote.takesPrescriptionMedication != null &&
    quote.usesTobacco != null &&
    quote.needsSpouseCoverage != null;
  if (!healthAnswered) {
    return false;
  }
  if (typeof quote.age === "number" && quote.age > 65) {
    return quote.hasPreexistingConditions != null;
  }
  return true;
}

/**
 * Which stepper steps can be opened.
 * Personal is always available; coverage needs a quote id;
 * review needs coverage health fields saved (not just default coverageType).
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
