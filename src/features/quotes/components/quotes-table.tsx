import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import type { QuoteResponse } from "@/api/types";
import {
  formatQuoteDate,
  formatQuotePremium,
  formatQuoteStatus,
} from "@/features/quotes/utils/format-quote";
import { wizardPersonalHref } from "@/routes/paths";

export type QuotesTableProps = {
  quotes: QuoteResponse[];
};

const tableContainerSx = { bgcolor: "background.paper" } as const;
const rowSx = {
  cursor: "pointer",
  textDecoration: "none",
  color: "inherit",
  "&:hover": { bgcolor: "action.hover" },
} as const;

export function QuotesTable({ quotes }: QuotesTableProps) {
  if (quotes.length === 0) {
    return (
      <Typography color="text.secondary">
        No quotes yet. Create one to get started.
      </Typography>
    );
  }

  return (
    <TableContainer sx={tableContainerSx}>
      <Table aria-label="Quotes">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Premium</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow
              key={quote.id ?? `${quote.email}-${quote.createdAt}`}
              component={RouterLink}
              to={wizardPersonalHref(quote.id)}
              hover
              sx={rowSx}
            >
              <TableCell>{quote.name ?? "—"}</TableCell>
              <TableCell>{quote.email ?? "—"}</TableCell>
              <TableCell>{formatQuoteStatus(quote.status)}</TableCell>
              <TableCell align="right">
                {formatQuotePremium(quote.estimatedMonthlyPremium)}
              </TableCell>
              <TableCell>{formatQuoteDate(quote.createdAt)}</TableCell>
              <TableCell>{formatQuoteDate(quote.updatedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
