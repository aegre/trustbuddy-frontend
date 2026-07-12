import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { WizardStepSkeleton } from "@/features/wizard/components/wizard-step-skeleton";

export type WizardPageSkeletonProps = {
  /** Accessible loading label. */
  label?: string;
};

const containerSx = { py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } } as const;
const paperSx = { p: { xs: 2, sm: 3.5 } } as const;

const stepperSx = {
  display: "flex",
  alignItems: "flex-start",
  width: "100%",
  pt: 1,
  pb: 0.5,
} as const;

const stepColumnSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  position: "relative",
  minWidth: 0,
} as const;

const connectorSx = {
  position: "absolute",
  top: 14,
  left: "calc(-50% + 16px)",
  right: "calc(50% + 16px)",
  height: 2,
  borderRadius: 1,
} as const;

const STEP_COUNT = 3;

function WizardStepperSkeleton() {
  return (
    <Box sx={stepperSx} aria-hidden>
      {Array.from({ length: STEP_COUNT }, (_, index) => (
        <Box key={index} sx={stepColumnSx}>
          {index > 0 ? (
            <Skeleton variant="rectangular" sx={connectorSx} />
          ) : null}
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="text" width={72} height={20} sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

/** Full-page shimmer for lazy wizard chunk load / quote fetch. */
export function WizardPageSkeleton({
  label = "Loading wizard",
}: WizardPageSkeletonProps) {
  return (
    <Container component="main" maxWidth="md" sx={containerSx}>
      <Box component="output" aria-label={label} aria-busy="true" sx={{ m: 0 }}>
        <Stack spacing={2} aria-hidden>
          <WizardStepperSkeleton />

          <Paper elevation={0} variant="outlined" sx={paperSx}>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Skeleton variant="text" width={96} height={20} />
              <Skeleton variant="text" width={160} height={32} />
              <Skeleton variant="text" width="55%" height={18} />
            </Stack>
            <WizardStepSkeleton announce={false} />
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
