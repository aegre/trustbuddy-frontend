import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, type ReactNode } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  getGetQuoteQueryKey,
  getListQuotesQueryKey,
  useClearPromoCode,
  useSubmitQuote,
  useUpdatePromoCode,
} from "@/api/generated/quotes/quotes";
import { getUserFacingErrorMessage, type QuoteResponse } from "@/api/types";
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
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  mb: 1.5,
  flexWrap: "wrap",
} as const;

const sectionTitleSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
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

const cardSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 2,
} as const;

const premiumBannerSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 0.5,
  px: { xs: 2, sm: 2.5 },
  py: { xs: 2, sm: 2.5 },
  borderRadius: 2,
  bgcolor: "action.selected",
} as const;

const promoRowSx = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "flex-start" },
  gap: 1.5,
} as const;

const costBreakdownSx = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  columnGap: 2,
  rowGap: 0.75,
  width: "100%",
  m: 0,
} as const;

const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
  gap: 2,
} as const;

const actionsSx = {
  display: "flex",
  flexDirection: { xs: "column-reverse", sm: "row" },
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: { xs: "stretch", sm: "center" },
  gap: 1.5,
  pt: 1,
  "& > .MuiButton-root": {
    width: { xs: "100%", sm: "auto" },
  },
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
  icon,
  editTo,
  children,
}: {
  title: string;
  icon: ReactNode;
  editTo?: string;
  children: ReactNode;
}) {
  return (
    <Paper variant="outlined" elevation={0} sx={cardSx}>
      <Box sx={sectionHeaderSx}>
        <Box sx={sectionTitleSx}>
          <Box
            sx={{
              color: "primary.main",
              display: "inline-flex",
              alignItems: "center",
            }}
            aria-hidden
          >
            {icon}
          </Box>
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
        </Box>
        {editTo ? (
          <Button
            component={RouterLink}
            to={editTo}
            size="small"
            variant="text"
            startIcon={<EditOutlinedIcon fontSize="small" />}
            sx={{ minWidth: 0 }}
          >
            Edit
          </Button>
        ) : null}
      </Box>
      <Box component="dl" sx={definitionListSx}>
        {children}
      </Box>
    </Paper>
  );
}

function ConditionsDetail({
  conditions,
}: {
  conditions: NonNullable<QuoteResponse["conditions"]>;
}) {
  const value =
    conditions.length === 0
      ? "—"
      : conditions.map((condition) => formatEnumLabel(condition)).join(", ");

  return (
    <Typography component="dd" sx={detailSx}>
      {value}
    </Typography>
  );
}

function formatPromoDiscountLabel(
  promoCode: string | undefined,
  promotionPercentage: number | undefined,
): string {
  const code = promoCode?.trim() || "Promo";
  if (
    typeof promotionPercentage === "number" &&
    !Number.isNaN(promotionPercentage)
  ) {
    return `${code} · ${promotionPercentage}%`;
  }
  return code;
}

export function ReviewStep({ quoteId, quote }: WizardStepProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submitQuote = useSubmitQuote();
  const updatePromoCode = useUpdatePromoCode();
  const clearPromoCode = useClearPromoCode();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");

  const canSubmit = Boolean(quoteId && canSubmitQuote(quote));
  const canEditDetails = Boolean(quoteId && isQuoteEditable(quote));
  const isRetry = quote?.status === "SUBMISSION_FAILED";
  const isSubmitting = submitQuote.isPending;
  const isPromoPending = updatePromoCode.isPending || clearPromoCode.isPending;
  const hasDiscount = typeof quote?.discountAmount === "number";
  const discountAmount = hasDiscount ? quote.discountAmount : undefined;
  const discountedPremium =
    hasDiscount &&
    typeof quote?.estimatedMonthlyPremium === "number" &&
    typeof discountAmount === "number"
      ? quote.estimatedMonthlyPremium - discountAmount
      : undefined;

  const invalidateQuoteQueries = useCallback(
    async (id: string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetQuoteQueryKey(id) }),
        queryClient.invalidateQueries({
          queryKey: getListQuotesQueryKey(),
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

  const onApplyPromo = useCallback(async () => {
    if (!quoteId) {
      return;
    }
    const code = promoCodeInput.trim();
    if (!code) {
      setErrorMessage("Enter a promo code");
      return;
    }
    setErrorMessage(null);
    try {
      await updatePromoCode.mutateAsync({ id: quoteId, data: { code } });
      await invalidateQuoteQueries(quoteId);
      setPromoCodeInput("");
    } catch (error) {
      setErrorMessage(
        getUserFacingErrorMessage(error, "Could not apply promo code"),
      );
    }
  }, [invalidateQuoteQueries, promoCodeInput, quoteId, updatePromoCode]);

  const onClearPromo = useCallback(async () => {
    if (!quoteId) {
      return;
    }
    setErrorMessage(null);
    try {
      await clearPromoCode.mutateAsync({ id: quoteId });
      await invalidateQuoteQueries(quoteId);
    } catch (error) {
      setErrorMessage(
        getUserFacingErrorMessage(error, "Could not remove promo code"),
      );
    }
  }, [clearPromoCode, invalidateQuoteQueries, quoteId]);

  const premium = formatQuotePremium(quote?.estimatedMonthlyPremium);
  const discountAmountLabel = formatQuotePremium(discountAmount);
  const discountedPremiumLabel = formatQuotePremium(discountedPremium);
  const coverageType = quote?.coverageType
    ? formatEnumLabel(quote.coverageType)
    : "—";
  const heading = canSubmit ? "Review your quote" : "Review";
  const intro = canSubmit
    ? "Please review your information and quote details before submitting."
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

      {errorMessage ? (
        <Alert severity="error" role="alert">
          {errorMessage}
        </Alert>
      ) : null}

      <Box sx={summaryGridSx}>
        <Stack spacing={2}>
          <ReviewSection
            title="Personal information"
            icon={<PersonOutlinedIcon fontSize="small" />}
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

          <ReviewSection
            title="Coverage"
            icon={<ShieldOutlinedIcon fontSize="small" />}
            editTo={
              canEditDetails && quoteId
                ? wizardHref("coverage", { quoteId })
                : undefined
            }
          >
            <SummaryField label="Plan" value={coverageType} />
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
        </Stack>

        <Paper variant="outlined" elevation={0} sx={cardSx}>
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 1.5 }}
          >
            Cost
          </Typography>
          <Stack spacing={2}>
            <Box sx={premiumBannerSx}>
              {hasDiscount ? (
                <Box component="dl" sx={costBreakdownSx}>
                  <Typography
                    component="dt"
                    color="text.secondary"
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Estimated monthly premium
                  </Typography>
                  <Typography
                    component="dd"
                    variant="body1"
                    sx={{ m: 0, fontWeight: 500, textAlign: "right" }}
                  >
                    {premium}
                  </Typography>
                  <Typography
                    component="dt"
                    color="text.secondary"
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Discount (
                    {formatPromoDiscountLabel(
                      quote?.promoCode,
                      quote?.promotionPercentage,
                    )}
                    )
                  </Typography>
                  <Typography
                    component="dd"
                    variant="body1"
                    color="success.main"
                    sx={{ m: 0, fontWeight: 500, textAlign: "right" }}
                  >
                    −{discountAmountLabel}
                  </Typography>
                  <Typography
                    component="dt"
                    color="text.secondary"
                    variant="body2"
                    sx={{ fontWeight: 600, pt: 0.5 }}
                  >
                    Discounted monthly premium
                  </Typography>
                  <Typography
                    component="dd"
                    variant="h5"
                    color="primary"
                    sx={{ m: 0, pt: 0.5, textAlign: "right" }}
                  >
                    {discountedPremiumLabel}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Estimated monthly premium
                  </Typography>
                  <Typography
                    component="p"
                    variant="h5"
                    color="primary"
                    sx={{ m: 0 }}
                  >
                    {premium}
                  </Typography>
                </>
              )}
              <Typography color="text.secondary" variant="caption">
                Prices are estimated and may vary based on final underwriting.
              </Typography>
            </Box>

            {canEditDetails && quoteId ? (
              quote?.promoCode ? (
                <Box sx={promoRowSx}>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, alignSelf: { sm: "center" } }}
                  >
                    Promo code applied:{" "}
                    <Typography component="span" sx={{ fontWeight: 600 }}>
                      {quote.promoCode}
                    </Typography>
                  </Typography>
                  <Button
                    type="button"
                    variant="outlined"
                    size="medium"
                    disabled={isPromoPending}
                    startIcon={
                      clearPromoCode.isPending ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : null
                    }
                    onClick={() => {
                      void onClearPromo();
                    }}
                  >
                    {clearPromoCode.isPending ? "Removing…" : "Remove"}
                  </Button>
                </Box>
              ) : (
                <Box
                  component="form"
                  sx={promoRowSx}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void onApplyPromo();
                  }}
                >
                  <TextField
                    id="review-promo-code"
                    label="Promo code"
                    value={promoCodeInput}
                    onChange={(event) => {
                      setPromoCodeInput(event.target.value);
                    }}
                    disabled={isPromoPending}
                    fullWidth
                    size="small"
                    slotProps={{
                      htmlInput: { maxLength: 64, autoComplete: "off" },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    disabled={isPromoPending || !promoCodeInput.trim()}
                    startIcon={
                      updatePromoCode.isPending ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : null
                    }
                    sx={{ flexShrink: 0, alignSelf: { sm: "stretch" } }}
                  >
                    {updatePromoCode.isPending ? "Applying…" : "Apply"}
                  </Button>
                </Box>
              )
            ) : quote?.promoCode ? (
              <Typography variant="body2">
                Promo code applied:{" "}
                <Typography component="span" sx={{ fontWeight: 600 }}>
                  {quote.promoCode}
                </Typography>
              </Typography>
            ) : null}
          </Stack>
        </Paper>
      </Box>

      <Box sx={actionsSx}>
        {quoteId ? (
          <Button
            component={RouterLink}
            to={wizardHref("coverage", { quoteId })}
            variant="outlined"
            size="large"
          >
            Back
          </Button>
        ) : null}
        {canSubmit ? (
          <Button
            type="button"
            variant="contained"
            size="large"
            disabled={isSubmitting || isPromoPending}
            startIcon={
              isSubmitting ? (
                <CircularProgress color="inherit" size={16} />
              ) : null
            }
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
        ) : null}
      </Box>
    </Stack>
  );
}
