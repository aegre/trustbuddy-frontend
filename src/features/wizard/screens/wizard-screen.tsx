import Stack from "@mui/material/Stack";
import { useCallback, type ReactNode } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { getUserFacingErrorMessage } from "@/api/types";
import { PageErrorAlert } from "@/features/common/components/page-error-alert";
import { PageLoading } from "@/features/common/components/page-loading";
import { QuoteNotEditableAlert } from "@/features/wizard/components/quote-not-editable-alert";
import { useQuote } from "@/features/wizard/hooks/use-quote";
import { WizardLayout } from "@/features/wizard/layouts/wizard-layout";
import { WIZARD_STEP_BY_SLUG } from "@/features/wizard/types/wizard-step-registry";
import { isQuoteEditable } from "@/features/wizard/utils/quote-edit-guards";
import { parseWizardStepSlug } from "@/features/wizard/utils/step-guards";
import { wizardHref } from "@/features/wizard/utils/wizard-href";

export function WizardScreen() {
  const { stepSlug: stepSlugParam } = useParams<{ stepSlug: string }>();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId") ?? undefined;
  const stepSlug = parseWizardStepSlug(stepSlugParam);
  const { data: quote, isPending, error, refetch, isError } = useQuote(quoteId);

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (!stepSlug) {
    return <Navigate to={wizardHref("personal", { quoteId })} replace />;
  }

  if (stepSlug !== "personal" && !quoteId) {
    return <Navigate to={wizardHref("personal")} replace />;
  }

  const step = WIZARD_STEP_BY_SLUG[stepSlug];
  const StepComponent = step.Component;
  const showStepChrome = !quoteId || (!isPending && !isError);
  const readOnly = Boolean(quoteId && quote && !isQuoteEditable(quote));
  /** Steps own Back/Continue/Next/Submit inside the card (including read-only). */
  const hideNav = showStepChrome;
  const hideNext = hideNav;

  let body: ReactNode;
  if (!quoteId) {
    body = <StepComponent />;
  } else if (isPending) {
    body = <PageLoading label="Loading quote" />;
  } else if (isError) {
    body = (
      <PageErrorAlert onRetry={onRetry}>
        {getUserFacingErrorMessage(error, "Could not load quote")}
      </PageErrorAlert>
    );
  } else {
    body = (
      <Stack spacing={2}>
        {readOnly && quote ? <QuoteNotEditableAlert quote={quote} /> : null}
        <StepComponent quoteId={quoteId} quote={quote} readOnly={readOnly} />
      </Stack>
    );
  }

  return (
    <WizardLayout
      stepSlug={stepSlug}
      quoteId={quoteId}
      quote={quote}
      showStepChrome={showStepChrome}
      hideNext={hideNext}
      hideNav={hideNav}
    >
      {body}
    </WizardLayout>
  );
}
