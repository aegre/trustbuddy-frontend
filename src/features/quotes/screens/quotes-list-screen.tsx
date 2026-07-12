import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { getUserFacingErrorMessage } from "@/api/types";
import { QuotesTable } from "@/features/quotes/components/quotes-table";
import {
  QUOTES_LIST_DEFAULTS,
  useQuotesList,
} from "@/features/quotes/hooks/use-quotes-list";
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
const paginationSx = {
  display: "flex",
  justifyContent: "center",
  pt: 1,
} as const;

const EMPTY_QUOTES: never[] = [];

/** Parse 1-based `page` from the URL; invalid or missing → 1. */
function parsePageParam(raw: string | null): number {
  if (raw == null || raw === "") {
    return 1;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

function pageSearchParams(page: number): URLSearchParams {
  const next = new URLSearchParams();
  if (page > 1) {
    next.set("page", String(page));
  }
  return next;
}

export function QuotesListScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parsePageParam(searchParams.get("page"));
  const pageIndex0 = pageFromUrl - 1;

  const { data, isPending, isError, error, refetch, isFetching } =
    useQuotesList({
      params: {
        page: pageIndex0,
        size: QUOTES_LIST_DEFAULTS.size,
        sort: QUOTES_LIST_DEFAULTS.sort,
      },
    });

  useEffect(() => {
    if (isPending || isError || !data) {
      return;
    }

    const totalPages = data.totalPages ?? 0;
    if (totalPages <= 0) {
      if (pageFromUrl !== 1) {
        setSearchParams(pageSearchParams(1), { replace: true });
      }
      return;
    }

    if (pageFromUrl > totalPages) {
      setSearchParams(pageSearchParams(totalPages), { replace: true });
    }
  }, [data, isError, isPending, pageFromUrl, setSearchParams]);

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onPageChange = useCallback(
    (_event: unknown, nextPage: number) => {
      setSearchParams(pageSearchParams(nextPage), { replace: true });
    },
    [setSearchParams],
  );

  const quotes = data?.content ?? EMPTY_QUOTES;
  const totalPages = data?.totalPages ?? 0;
  const showPagination = !isPending && !isError && totalPages > 1;

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
            {getUserFacingErrorMessage(error, "Could not load quotes")}
          </Alert>
        ) : null}

        {!isPending && !isError ? <QuotesTable quotes={quotes} /> : null}

        {showPagination ? (
          <Box sx={paginationSx}>
            <Pagination
              count={totalPages}
              page={(data?.number ?? 0) + 1}
              onChange={onPageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        ) : null}

        {isFetching && !isPending ? (
          <Typography variant="caption" color="text.secondary">
            Refreshing…
          </Typography>
        ) : null}
      </Stack>
    </Container>
  );
}
