import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback } from "react";
import {
  Link as RouterLink,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { getUserFacingErrorMessage } from "@/api/types";
import { PageErrorAlert } from "@/features/common/components/page-error-alert";
import { PageLoading } from "@/features/common/components/page-loading";
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

const iconWrapSx = {
  display: "flex",
  justifyContent: "center",
  color: "success.main",
} as const;

const headerSx = {
  textAlign: "center",
} as const;

const introSx = { mt: 1 } as const;

const actionsSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1,
  pt: 1,
} as const;

export function SuccessScreen() {
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId") ?? undefined;
  const { data: quote, isPending, isError, error, refetch } = useQuote(quoteId);

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (!quoteId) {
    return <Navigate to={paths.home} replace />;
  }

  return (
    <Container component="main" maxWidth="sm" sx={containerSx}>
      <Box sx={panelSx}>
        <Stack spacing={3}>
          {isPending ? <PageLoading label="Loading quote" /> : null}

          {isError ? (
            <PageErrorAlert onRetry={onRetry}>
              {getUserFacingErrorMessage(error, "Could not load quote")}
            </PageErrorAlert>
          ) : null}

          {!isPending && !isError && quote ? (
            <>
              <Box sx={iconWrapSx} aria-hidden>
                <CheckCircleIcon sx={{ fontSize: 72 }} />
              </Box>

              <Box sx={headerSx}>
                <Typography component="h1" variant="h5">
                  Your quote has been submitted!
                </Typography>
                <Typography color="text.secondary" sx={introSx}>
                  {quote.name
                    ? `Thank you, ${quote.name}! We've received your information and will be in touch soon.`
                    : "We've received your information and will be in touch soon."}
                </Typography>
              </Box>

              <Box sx={actionsSx}>
                <Button
                  component={RouterLink}
                  to={paths.home}
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Ok
                </Button>
                <Button
                  component={RouterLink}
                  to={paths.wizardPersonal}
                  variant="text"
                  color="primary"
                >
                  Start a new quote
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
                fullWidth
              >
                Ok
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Container>
  );
}
