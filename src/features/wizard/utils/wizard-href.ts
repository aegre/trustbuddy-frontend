import type { WizardStepSlug } from "@/features/wizard/types/wizard-steps";
import { paths } from "@/routes/paths";

export type WizardHrefOptions = {
  quoteId?: string;
};

/**
 * Build `/wizard/:stepSlug` with optional `quoteId` query param.
 */
export function wizardHref(
  stepSlug: WizardStepSlug,
  options: WizardHrefOptions = {},
): string {
  const pathname = `${paths.wizardBase}/${stepSlug}`;
  if (!options.quoteId) {
    return pathname;
  }
  const params = new URLSearchParams({ quoteId: options.quoteId });
  return `${pathname}?${params.toString()}`;
}
