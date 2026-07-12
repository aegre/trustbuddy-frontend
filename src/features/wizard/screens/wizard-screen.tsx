import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useCallback, useMemo, type ReactNode } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { getUserFacingErrorMessage } from "@/api/types";
import { QuoteNotEditableAlert } from "@/features/wizard/components/quote-not-editable-alert";
import { useQuote } from "@/features/wizard/hooks/use-quote";
import { WizardLayout } from "@/features/wizard/layouts/wizard-layout";
import { WIZARD_STEP_BY_SLUG } from "@/features/wizard/types/wizard-step-registry";
import { isQuoteEditable } from "@/features/wizard/utils/quote-edit-guards";
import { parseWizardStepSlug } from "@/features/wizard/utils/step-guards";
import { wizardHref } from "@/features/wizard/utils/wizard-href";

const loadingSx = {
  display: "flex",
  justifyContent: "center",
  py: 6,
} as const;

export function WizardScreen() {
  const { stepSlug: stepSlugParam } = useParams<{ stepSlug: string }>();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId") ?? undefined;
  const stepSlug = parseWizardStepSlug(stepSlugParam);
  const { data: quote, isPending, error, refetch, isError } = useQuote(quoteId);

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const errorAction = useMemo(
    () => (
      <Button color="inherit" size="small" onClick={onRetry}>
        Retry
      </Button>
    ),
    [onRetry],
  );

  if (!stepSlug) {
    return <Navigate to={wizardHref("personal", { quoteId })} replace />;
  }

  const step = WIZARD_STEP_BY_SLUG[stepSlug];
  const StepComponent = step.Component;
  const showStepChrome = !quoteId || (!isPending && !isError);
  const readOnly = Boolean(quoteId && quote && !isQuoteEditable(quote));
  const hideNext =
    stepSlug === "personal" &&
    (!quoteId || (!isPending && !isError && !readOnly));

  let body: ReactNode;
  if (!quoteId) {
    body = <StepComponent />;
  } else if (isPending) {
    body = (
      <Box sx={loadingSx}>
        <output aria-label="Loading quote">
          <CircularProgress />
        </output>
      </Box>
    );
  } else if (isError) {
    body = (
      <Alert severity="error" action={errorAction}>
        {getUserFacingErrorMessage(error, "Could not load quote")}
      </Alert>
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
      showStepChrome={showStepChrome}
      hideNext={hideNext}
    >
      {body}
    </WizardLayout>
  );
}
