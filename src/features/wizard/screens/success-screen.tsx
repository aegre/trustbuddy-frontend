import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useMemo } from "react";
import {
  Link as RouterLink,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { getUserFacingErrorMessage } from "@/api/types";
import {
  formatQuotePremium,
  formatQuoteStatus,
} from "@/features/quotes/utils/format-quote";
import { useQuote } from "@/features/wizard/hooks/use-quote";
import { paths } from "@/routes/paths";

const containerSx = { py: 4 } as const;
const loadingSx = {
  display: "flex",
  justifyContent: "center",
  py: 6,
} as const;

export function SuccessScreen() {
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId") ?? undefined;
  const { data: quote, isPending, isError, error, refetch } = useQuote(quoteId);

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

  if (!quoteId) {
    return <Navigate to={paths.home} replace />;
  }

  return (
    <Container component="main" maxWidth="sm" sx={containerSx}>
      <Stack spacing={3}>
        <Typography component="h1" variant="h5">
          Quote submitted
        </Typography>

        {isPending ? (
          <Box sx={loadingSx}>
            <output aria-label="Loading quote">
              <CircularProgress />
            </output>
          </Box>
        ) : null}

        {isError ? (
          <Alert severity="error" action={errorAction}>
            {getUserFacingErrorMessage(error, "Could not load quote")}
          </Alert>
        ) : null}

        {!isPending && !isError && quote ? (
          <Stack spacing={1.5}>
            <Typography>
              Thanks{quote.name ? `, ${quote.name}` : ""}. Your quote has been
              submitted.
            </Typography>
            <Typography color="text.secondary">
              Status: {formatQuoteStatus(quote.status)}
            </Typography>
            <Typography color="text.secondary">
              Estimated monthly premium:{" "}
              {formatQuotePremium(quote.estimatedMonthlyPremium)}
            </Typography>
          </Stack>
        ) : null}

        <Button
          component={RouterLink}
          to={paths.home}
          variant="contained"
          sx={{ alignSelf: "flex-start" }}
        >
          Back to quotes
        </Button>
      </Stack>
    </Container>
  );
}
