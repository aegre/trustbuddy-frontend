import type { ComponentType } from "react";

export const WIZARD_STEP_SLUGS = ["personal", "coverage", "review"] as const;

export type WizardStepSlug = (typeof WIZARD_STEP_SLUGS)[number];

export type WizardStepProps = {
  quoteId?: string;
};

export type WizardStepDefinition = {
  slug: WizardStepSlug;
  label: string;
  description: string;
  Component: ComponentType<WizardStepProps>;
};

export function isWizardStepSlug(value: unknown): value is WizardStepSlug {
  return (
    typeof value === "string" &&
    (WIZARD_STEP_SLUGS as readonly string[]).includes(value)
  );
}
