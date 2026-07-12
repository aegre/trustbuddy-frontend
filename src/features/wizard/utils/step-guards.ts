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
