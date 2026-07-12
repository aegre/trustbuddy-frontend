import { CoverageStep } from "@/features/wizard/components/steps/coverage-step";
import { PersonalStep } from "@/features/wizard/components/steps/personal-step";
import { ReviewStep } from "@/features/wizard/components/steps/review-step";
import type {
  WizardStepDefinition,
  WizardStepSlug,
} from "@/features/wizard/types/wizard-steps";

export const WIZARD_STEPS: readonly WizardStepDefinition[] = [
  {
    slug: "personal",
    label: "Personal",
    description: "Name, contact, and basics",
    Component: PersonalStep,
  },
  {
    slug: "coverage",
    label: "Coverage",
    description: "Plan and health answers",
    Component: CoverageStep,
  },
  {
    slug: "review",
    label: "Review",
    description: "Confirm and submit",
    Component: ReviewStep,
  },
] as const;

export const WIZARD_STEP_BY_SLUG: Record<WizardStepSlug, WizardStepDefinition> =
  {
    personal: WIZARD_STEPS[0]!,
    coverage: WIZARD_STEPS[1]!,
    review: WIZARD_STEPS[2]!,
  };
