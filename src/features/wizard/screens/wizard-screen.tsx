import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { WizardLayout } from "@/features/wizard/layouts/wizard-layout";
import { WIZARD_STEP_BY_SLUG } from "@/features/wizard/types/wizard-step-registry";
import { parseWizardStepSlug } from "@/features/wizard/utils/step-guards";
import { wizardHref } from "@/features/wizard/utils/wizard-href";

export function WizardScreen() {
  const { stepSlug: stepSlugParam } = useParams<{ stepSlug: string }>();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId") ?? undefined;
  const stepSlug = parseWizardStepSlug(stepSlugParam);

  if (!stepSlug) {
    return <Navigate to={wizardHref("personal", { quoteId })} replace />;
  }

  const step = WIZARD_STEP_BY_SLUG[stepSlug];
  const StepComponent = step.Component;

  return (
    <WizardLayout stepSlug={stepSlug} quoteId={quoteId}>
      <StepComponent quoteId={quoteId} />
    </WizardLayout>
  );
}
