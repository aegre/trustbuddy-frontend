import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import type { QuoteResponse } from "@/api/types";
import {
  formatQuoteDate,
  formatQuotePremium,
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
  display: "block",
  p: { xs: 2, sm: 2.5 },
  borderRadius: 2,
  textDecoration: "none",
  color: "inherit",
  "&:hover": { bgcolor: "action.hover" },
} as const;

const topRowSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
} as const;

const nameSx = {
  fontWeight: 600,
  minWidth: 0,
  flex: "1 1 auto",
  overflowWrap: "anywhere",
} as const;

const emailSx = {
  overflowWrap: "anywhere",
} as const;

const footerSx = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 1.5,
  pt: 0.25,
} as const;

const premiumSx = {
  fontWeight: 700,
  lineHeight: 1.2,
  m: 0,
  fontSize: { xs: "1.375rem", sm: "1.5rem" },
  textAlign: "right",
  flexShrink: 0,
} as const;

const chipSx = { flexShrink: 0 } as const;

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
      spacing={{ xs: 1.25, sm: 1.5 }}
      aria-label="Quotes"
      sx={listSx}
    >
      {quotes.map((quote) => {
        const name = quote.name ?? "Untitled quote";
        const status = formatQuoteStatus(quote.status);
        const premium = formatQuotePremium(quote.estimatedMonthlyPremium);

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
              aria-label={`${name}, ${status}, ${premium}`}
              sx={cardSx}
            >
              <Stack spacing={1}>
                <Box sx={topRowSx}>
                  <Typography component="h2" variant="subtitle1" sx={nameSx}>
                    {name}
                  </Typography>
                  <Chip
                    label={status}
                    size="small"
                    color={quoteStatusChipColor(quote.status)}
                    sx={chipSx}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={emailSx}>
                  {quote.email ?? "—"}
                </Typography>
                <Box sx={footerSx}>
                  <Typography variant="caption" color="text.secondary">
                    Created {formatQuoteDate(quote.createdAt)}
                  </Typography>
                  <Typography variant="h5" component="p" sx={premiumSx}>
                    {premium}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        );
      })}
    </Stack>
  );
}
