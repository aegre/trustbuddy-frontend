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
  p: 2.5,
  borderRadius: 2,
  textDecoration: "none",
  color: "inherit",
  "&:hover": { bgcolor: "action.hover" },
} as const;

const cardHeaderSx = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 2,
  flexWrap: "wrap",
} as const;

const leadingSx = {
  flex: "1 1 12rem",
  minWidth: 0,
} as const;

const trailingSx = {
  ml: "auto",
  flexShrink: 0,
  alignItems: "flex-end",
  textAlign: "right",
} as const;

const titleSx = { fontWeight: 600 } as const;

const premiumSx = {
  fontWeight: 700,
  lineHeight: 1.2,
} as const;

const createdSx = { mt: 1.5, display: "block" } as const;

export function QuotesCards({ quotes }: QuotesCardsProps) {
  if (quotes.length === 0) {
    return (
      <Typography color="text.secondary">
        No quotes yet. Create one to get started.
      </Typography>
    );
  }

  return (
    <Stack component="ul" spacing={1.5} aria-label="Quotes" sx={listSx}>
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
              <Box sx={cardHeaderSx}>
                <Box sx={leadingSx}>
                  <Typography component="h2" variant="subtitle1" sx={titleSx}>
                    {name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {quote.email ?? "—"}
                  </Typography>
                </Box>
                <Stack spacing={0.75} sx={trailingSx}>
                  <Chip
                    label={status}
                    size="small"
                    color={quoteStatusChipColor(quote.status)}
                  />
                  <Typography variant="h5" component="p" sx={premiumSx}>
                    {premium}
                  </Typography>
                </Stack>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={createdSx}
              >
                Created {formatQuoteDate(quote.createdAt)}
              </Typography>
            </Paper>
          </Box>
        );
      })}
    </Stack>
  );
}
