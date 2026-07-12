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

/**
 * Which stepper steps can be opened.
 * Personal is always available; coverage needs a quote id;
 * review needs coverage already saved on the quote.
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
  return Boolean(context.quote?.coverageType);
}
