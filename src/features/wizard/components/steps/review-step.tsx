import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGetQuoteQueryKey,
  getListQuotesQueryKey,
  useSubmitQuote,
} from "@/api/generated/quotes/quotes";
import { getUserFacingErrorMessage } from "@/api/types";
import { QUOTES_LIST_DEFAULTS } from "@/features/quotes/hooks/use-quotes-list";
import { formatQuotePremium } from "@/features/quotes/utils/format-quote";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";
import { successHref } from "@/routes/paths";

const sectionSx = { mt: 1 } as const;

function formatYesNo(value: boolean | undefined): string {
  if (value === true) {
    return "Yes";
  }
  if (value === false) {
    return "No";
  }
  return "—";
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Typography>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {label}:{" "}
      </Box>
      {value}
    </Typography>
  );
}

export function ReviewStep({ quoteId, quote, readOnly }: WizardStepProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submitQuote = useSubmitQuote();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = Boolean(quoteId && quote && !readOnly);
  const isSubmitting = submitQuote.isPending;

  const invalidateQuoteQueries = useCallback(
    async (id: string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetQuoteQueryKey(id) }),
        queryClient.invalidateQueries({
          queryKey: getListQuotesQueryKey({
            page: QUOTES_LIST_DEFAULTS.page,
            size: QUOTES_LIST_DEFAULTS.size,
            sort: QUOTES_LIST_DEFAULTS.sort,
          }),
        }),
      ]);
    },
    [queryClient],
  );

  const onSubmit = useCallback(async () => {
    if (!quoteId) {
      return;
    }
    setErrorMessage(null);
    try {
      await submitQuote.mutateAsync({ id: quoteId });
      await invalidateQuoteQueries(quoteId);
      navigate(successHref(quoteId));
    } catch (error) {
      setErrorMessage(
        getUserFacingErrorMessage(error, "Could not submit quote"),
      );
    }
  }, [invalidateQuoteQueries, navigate, quoteId, submitQuote]);

  const conditions =
    quote?.conditions && quote.conditions.length > 0
      ? quote.conditions.join(", ")
      : "—";

  return (
    <Stack spacing={3}>
      <div>
        <Typography component="h2" variant="h6">
          Review & submit
        </Typography>
        <Typography color="text.secondary" sx={sectionSx}>
          Confirm details for {quote?.name ?? "this quote"} before submitting.
        </Typography>
      </div>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1}>
        <Typography component="h3" variant="subtitle1">
          Personal
        </Typography>
        <SummaryRow label="Name" value={quote?.name ?? "—"} />
        <SummaryRow label="Email" value={quote?.email ?? "—"} />
        <SummaryRow
          label="Age"
          value={quote?.age != null ? String(quote.age) : "—"}
        />
        <SummaryRow label="ZIP code" value={quote?.zipCode ?? "—"} />
      </Stack>

      <Stack spacing={1}>
        <Typography component="h3" variant="subtitle1">
          Coverage
        </Typography>
        <SummaryRow label="Type" value={quote?.coverageType ?? "—"} />
        <SummaryRow
          label="Prescription medication"
          value={formatYesNo(quote?.takesPrescriptionMedication)}
        />
        <SummaryRow
          label="Tobacco use"
          value={formatYesNo(quote?.usesTobacco)}
        />
        <SummaryRow
          label="Spouse coverage"
          value={formatYesNo(quote?.needsSpouseCoverage)}
        />
        {quote?.hasPreexistingConditions != null ? (
          <>
            <SummaryRow
              label="Pre-existing conditions"
              value={formatYesNo(quote.hasPreexistingConditions)}
            />
            <SummaryRow label="Conditions" value={conditions} />
          </>
        ) : null}
        <SummaryRow
          label="Estimated monthly premium"
          value={formatQuotePremium(quote?.estimatedMonthlyPremium)}
        />
      </Stack>

      {canSubmit ? (
        <Button
          type="button"
          variant="contained"
          disabled={isSubmitting}
          onClick={() => {
            void onSubmit();
          }}
          sx={{ alignSelf: "flex-start" }}
        >
          {isSubmitting ? "Submitting…" : "Submit quote"}
        </Button>
      ) : null}
    </Stack>
  );
}
