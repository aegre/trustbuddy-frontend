import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
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
import { formatQuotePremium } from "@/features/quotes/utils/format-quote";
import { useQuote } from "@/features/wizard/hooks/use-quote";
import { paths } from "@/routes/paths";

const containerSx = {
  py: { xs: 6, sm: 8 },
  display: "flex",
  justifyContent: "center",
} as const;

const panelSx = {
  width: "100%",
  maxWidth: 440,
} as const;

const loadingSx = {
  display: "flex",
  justifyContent: "center",
  py: 6,
} as const;

const iconWrapSx = {
  display: "flex",
  justifyContent: "center",
  color: "success.main",
} as const;

const headerSx = {
  textAlign: "center",
} as const;

const introSx = { mt: 1 } as const;

const premiumBannerSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
  px: 2,
  py: 2.5,
  borderRadius: 1,
  border: 1,
  borderColor: "divider",
  bgcolor: "background.paper",
  textAlign: "center",
} as const;

const actionsSx = {
  display: "flex",
  justifyContent: "center",
  pt: 1,
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

  const premium = formatQuotePremium(quote?.estimatedMonthlyPremium);

  return (
    <Container component="main" maxWidth="sm" sx={containerSx}>
      <Box sx={panelSx}>
        <Stack spacing={3}>
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
            <>
              <Box sx={iconWrapSx} aria-hidden>
                <CheckCircleOutlineIcon sx={{ fontSize: 48 }} />
              </Box>

              <Box sx={headerSx}>
                <Typography component="h1" variant="h5">
                  Quote submitted
                </Typography>
                <Typography color="text.secondary" sx={introSx}>
                  {quote.name
                    ? `Your quote for ${quote.name} has been submitted.`
                    : "Your quote has been submitted."}
                </Typography>
              </Box>

              <Box sx={premiumBannerSx}>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Estimated monthly premium
                </Typography>
                <Typography component="p" variant="h4" sx={{ m: 0 }}>
                  {premium}
                </Typography>
              </Box>

              <Box sx={actionsSx}>
                <Button
                  component={RouterLink}
                  to={paths.home}
                  variant="contained"
                  size="large"
                >
                  Back to quotes
                </Button>
              </Box>
            </>
          ) : null}

          {(isPending || isError) && !quote ? (
            <Box sx={actionsSx}>
              <Button
                component={RouterLink}
                to={paths.home}
                variant="contained"
                size="large"
              >
                Back to quotes
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Container>
  );
}
