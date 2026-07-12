import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, type ReactNode } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  getGetQuoteQueryKey,
  getListQuotesQueryKey,
  useSubmitQuote,
} from "@/api/generated/quotes/quotes";
import { getUserFacingErrorMessage, type QuoteResponse } from "@/api/types";
import { QUOTES_LIST_DEFAULTS } from "@/features/quotes/hooks/use-quotes-list";
import { formatQuotePremium } from "@/features/quotes/utils/format-quote";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";
import {
  canSubmitQuote,
  isQuoteEditable,
} from "@/features/wizard/utils/quote-edit-guards";
import { wizardHref } from "@/features/wizard/utils/wizard-href";
import { successHref } from "@/routes/paths";

const introSx = { mt: 0.5 } as const;

const sectionHeaderSx = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 2,
  mb: 1.5,
} as const;

const definitionListSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "11rem 1fr" },
  columnGap: 2,
  rowGap: 1.25,
  m: 0,
} as const;

const termSx = {
  m: 0,
  color: "text.secondary",
  fontSize: "0.875rem",
  fontWeight: 500,
  lineHeight: 1.5,
} as const;

const detailSx = {
  m: 0,
  fontWeight: 500,
  lineHeight: 1.5,
  wordBreak: "break-word",
} as const;

const premiumBannerSx = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 1,
  px: 2,
  py: 1.75,
  borderRadius: 1,
  border: 1,
  borderColor: "divider",
  bgcolor: "background.paper",
} as const;

const actionsSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  pt: 1,
} as const;

const chipRowSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: 0.75,
} as const;

function formatYesNo(value: boolean | undefined): string {
  if (value === true) {
    return "Yes";
  }
  if (value === false) {
    return "No";
  }
  return "—";
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Typography component="dt" sx={termSx}>
        {label}
      </Typography>
      <Typography component="dd" sx={detailSx}>
        {value}
      </Typography>
    </>
  );
}

function ReviewSection({
  title,
  editTo,
  children,
}: {
  title: string;
  editTo?: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Box sx={sectionHeaderSx}>
        <Typography component="h3" variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {editTo ? (
          <Button
            component={RouterLink}
            to={editTo}
            size="small"
            variant="text"
            sx={{ minWidth: 0, px: 0.5 }}
          >
            Edit
          </Button>
        ) : null}
      </Box>
      <Box component="dl" sx={definitionListSx}>
        {children}
      </Box>
    </Box>
  );
}

function ConditionsDetail({
  conditions,
}: {
  conditions: NonNullable<QuoteResponse["conditions"]>;
}) {
  if (conditions.length === 0) {
    return (
      <Typography component="dd" sx={detailSx}>
        —
      </Typography>
    );
  }

  return (
    <Box component="dd" sx={{ ...detailSx, ...chipRowSx }}>
      {conditions.map((condition) => (
        <Chip
          key={condition}
          label={formatEnumLabel(condition)}
          size="small"
          variant="outlined"
        />
      ))}
    </Box>
  );
}

export function ReviewStep({ quoteId, quote }: WizardStepProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submitQuote = useSubmitQuote();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = Boolean(quoteId && canSubmitQuote(quote));
  const canEditDetails = Boolean(quoteId && isQuoteEditable(quote));
  const isRetry = quote?.status === "SUBMISSION_FAILED";
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

  const premium = formatQuotePremium(quote?.estimatedMonthlyPremium);
  const coverageType = quote?.coverageType
    ? formatEnumLabel(quote.coverageType)
    : "—";
  const heading = canSubmit ? "Review & submit" : "Review";
  const intro = canSubmit
    ? `Confirm details for ${quote?.name ?? "this quote"} before submitting.`
    : `Summary for ${quote?.name ?? "this quote"}.`;

  return (
    <Stack spacing={3}>
      <div>
        <Typography component="h2" variant="h6">
          {heading}
        </Typography>
        <Typography color="text.secondary" sx={introSx}>
          {intro}
        </Typography>
      </div>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Box sx={premiumBannerSx}>
        <Typography color="text.secondary" variant="body2" fontWeight={500}>
          Estimated monthly premium
        </Typography>
        <Typography component="p" variant="h5" sx={{ m: 0 }}>
          {premium}
        </Typography>
      </Box>

      <ReviewSection
        title="Personal"
        editTo={
          canEditDetails && quoteId
            ? wizardHref("personal", { quoteId })
            : undefined
        }
      >
        <SummaryField label="Name" value={quote?.name ?? "—"} />
        <SummaryField label="Email" value={quote?.email ?? "—"} />
        <SummaryField
          label="Age"
          value={quote?.age != null ? String(quote.age) : "—"}
        />
        <SummaryField label="ZIP code" value={quote?.zipCode ?? "—"} />
      </ReviewSection>

      <Divider />

      <ReviewSection
        title="Coverage"
        editTo={
          canEditDetails && quoteId
            ? wizardHref("coverage", { quoteId })
            : undefined
        }
      >
        <SummaryField label="Type" value={coverageType} />
        <SummaryField
          label="Prescription medication"
          value={formatYesNo(quote?.takesPrescriptionMedication)}
        />
        <SummaryField
          label="Tobacco use"
          value={formatYesNo(quote?.usesTobacco)}
        />
        <SummaryField
          label="Spouse coverage"
          value={formatYesNo(quote?.needsSpouseCoverage)}
        />
        {quote?.hasPreexistingConditions != null ? (
          <>
            <SummaryField
              label="Pre-existing conditions"
              value={formatYesNo(quote.hasPreexistingConditions)}
            />
            <Typography component="dt" sx={termSx}>
              Conditions
            </Typography>
            <ConditionsDetail conditions={quote.conditions ?? []} />
          </>
        ) : null}
      </ReviewSection>

      {canSubmit ? (
        <Box sx={actionsSx}>
          <Button
            type="button"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            onClick={() => {
              void onSubmit();
            }}
          >
            {isSubmitting
              ? "Submitting…"
              : isRetry
                ? "Retry submit"
                : "Submit quote"}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}
