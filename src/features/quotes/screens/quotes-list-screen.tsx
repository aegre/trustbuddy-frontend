import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useCallback, useEffect } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { getUserFacingErrorMessage } from "@/api/types";
import { PageErrorAlert } from "@/features/common/components/page-error-alert";
import { PageLoading } from "@/features/common/components/page-loading";
import { QuotesCards } from "@/features/quotes/components/quotes-cards";
import {
  QUOTES_LIST_DEFAULTS,
  useQuotesList,
} from "@/features/quotes/hooks/use-quotes-list";
import { paths } from "@/routes/paths";

const containerSx = { py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } } as const;
const headerSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
} as const;
const paginationSx = {
  display: "flex",
  justifyContent: "center",
  pt: 1,
  overflowX: "auto",
  maxWidth: "100%",
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
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("sm"));
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

  return (
    <Container component="main" maxWidth="lg" sx={containerSx}>
      <Stack spacing={2}>
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

        {isPending ? <PageLoading label="Loading quotes" /> : null}

        {isError ? (
          <PageErrorAlert onRetry={onRetry}>
            {getUserFacingErrorMessage(error, "Could not load quotes")}
          </PageErrorAlert>
        ) : null}

        {!isPending && !isError ? <QuotesCards quotes={quotes} /> : null}

        {showPagination ? (
          <Box sx={paginationSx}>
            <Pagination
              count={totalPages}
              page={(data?.number ?? 0) + 1}
              onChange={onPageChange}
              color="primary"
              size={isCompact ? "small" : "medium"}
              siblingCount={isCompact ? 0 : 1}
              boundaryCount={1}
              showFirstButton={!isCompact}
              showLastButton={!isCompact}
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
