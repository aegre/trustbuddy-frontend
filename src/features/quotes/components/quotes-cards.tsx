import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import type { QuoteResponse } from "@/api/types";
import { CoveragePlanIconBadge } from "@/features/common/components/coverage-plan-icon";
import {
  formatQuoteCoverageTitle,
  formatQuoteCreatedDate,
  formatQuotePremiumAmount,
  formatQuoteRef,
  formatQuoteStatus,
  quoteStatusChipColor,
} from "@/features/quotes/utils/format-quote";
import { wizardPersonalHref } from "@/routes/paths";

export type QuotesCardsProps = {
  quotes: QuoteResponse[];
};

const listSx = {
  listStyle: "none",
  m: 0,
  p: 0,
} as const;

const cardSx = {
  display: "flex",
  alignItems: "center",
  gap: { xs: 1.5, sm: 2 },
  p: { xs: 2, sm: 2.5 },
  borderRadius: 3,
  textDecoration: "none",
  color: "inherit",
  "&:hover": { bgcolor: "action.hover" },
} as const;

const iconBadgeSx = {
  display: { xs: "none", sm: "grid" },
} as const;

const metaSx = {
  minWidth: 0,
  flex: "1 1 auto",
} as const;

const titleSx = {
  fontWeight: 700,
  minWidth: 0,
  overflowWrap: "anywhere",
} as const;

const trailingSx = {
  display: "flex",
  alignItems: "center",
  gap: { xs: 1, sm: 1.5 },
  flexShrink: 0,
  ml: "auto",
} as const;

const priceBlockSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 0.75,
} as const;

const premiumSx = {
  display: "flex",
  alignItems: "baseline",
  gap: 0.5,
  m: 0,
  lineHeight: 1.2,
} as const;

const premiumAmountSx = {
  fontWeight: 700,
  fontSize: { xs: "1.25rem", sm: "1.5rem" },
} as const;

const premiumSuffixSx = {
  fontWeight: 500,
} as const;

const chipSx = {
  borderRadius: 999,
  fontWeight: 600,
  height: 24,
} as const;

const chevronSx = {
  color: "text.secondary",
  fontSize: { xs: 22, sm: 24 },
} as const;

export function QuotesCards({ quotes }: QuotesCardsProps) {
  if (quotes.length === 0) {
    return (
      <Typography color="text.secondary">
        No quotes yet. Create one to get started.
      </Typography>
    );
  }

  return (
    <Stack
      component="ul"
      spacing={{ xs: 1.5, sm: 2 }}
      aria-label="Quotes"
      sx={listSx}
    >
      {quotes.map((quote) => {
        const coverageTitle = formatQuoteCoverageTitle(
          quote.coverageType,
          quote.name,
        );
        const applicantName = quote.name?.trim() || "—";
        const ref = formatQuoteRef(quote.id);
        const status = formatQuoteStatus(quote.status);
        const premium = formatQuotePremiumAmount(quote.estimatedMonthlyPremium);
        const created = formatQuoteCreatedDate(quote.createdAt);

        return (
          <Box
            key={quote.id ?? `${quote.email}-${quote.createdAt}`}
            component="li"
          >
            <Paper
              component={RouterLink}
              to={wizardPersonalHref(quote.id)}
              elevation={0}
              variant="outlined"
              aria-label={`${coverageTitle}, ${applicantName}, ${ref}, ${status}, ${premium} per month`}
              sx={cardSx}
            >
              <CoveragePlanIconBadge
                coverageType={quote.coverageType}
                sx={iconBadgeSx}
              />

              <Box sx={metaSx}>
                <Typography component="h2" variant="subtitle1" sx={titleSx}>
                  {coverageTitle}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {applicantName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created {created}
                </Typography>
              </Box>

              <Box sx={trailingSx}>
                <Box sx={priceBlockSx}>
                  <Typography component="p" sx={premiumSx}>
                    <Box component="span" sx={premiumAmountSx}>
                      {premium}
                    </Box>
                    {premium !== "—" ? (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={premiumSuffixSx}
                      >
                        /mo
                      </Typography>
                    ) : null}
                  </Typography>
                  <Chip
                    label={status}
                    size="small"
                    color={quoteStatusChipColor(quote.status)}
                    sx={chipSx}
                  />
                </Box>
                <ChevronRightIcon aria-hidden sx={chevronSx} />
              </Box>
            </Paper>
          </Box>
        );
      })}
    </Stack>
  );
}
