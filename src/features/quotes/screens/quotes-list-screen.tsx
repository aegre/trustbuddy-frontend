import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getApiErrorMessage } from "@/api/types";
import { QuotesTable } from "@/features/quotes/components/quotes-table";
import { useQuotesList } from "@/features/quotes/hooks/use-quotes-list";
import { paths } from "@/routes/paths";

const containerSx = { py: 4 } as const;
const headerSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  flexWrap: "wrap",
} as const;
const loadingSx = {
  display: "flex",
  justifyContent: "center",
  py: 6,
} as const;

const EMPTY_QUOTES: never[] = [];

export function QuotesListScreen() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useQuotesList();

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const quotes = data?.content ?? EMPTY_QUOTES;

  const errorAction = useMemo(
    () => (
      <Button color="inherit" size="small" onClick={onRetry}>
        Retry
      </Button>
    ),
    [onRetry],
  );

  return (
    <Container component="main" maxWidth="lg" sx={containerSx}>
      <Stack spacing={3}>
        <Box sx={headerSx}>
          <Typography component="h1" variant="h5">
            Quotes
          </Typography>
          <Button
            component={RouterLink}
            to={paths.wizardPersonal}
            variant="contained"
          >
            New quote
          </Button>
        </Box>

        {isPending ? (
          <Box sx={loadingSx}>
            <output aria-label="Loading quotes">
              <CircularProgress />
            </output>
          </Box>
        ) : null}

        {isError ? (
          <Alert severity="error" action={errorAction}>
            {getApiErrorMessage(error, "Could not load quotes")}
          </Alert>
        ) : null}

        {!isPending && !isError ? <QuotesTable quotes={quotes} /> : null}

        {isFetching && !isPending ? (
          <Typography variant="caption" color="text.secondary">
            Refreshing…
          </Typography>
        ) : null}
      </Stack>
    </Container>
  );
}
