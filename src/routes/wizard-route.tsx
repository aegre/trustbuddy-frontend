import { Suspense, lazy } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const WizardScreen = lazy(async () => {
  const module = await import("@/features/wizard/screens/wizard-screen");
  return { default: module.WizardScreen };
});

const fallbackSx = {
  display: "flex",
  justifyContent: "center",
  py: 8,
} as const;

const wizardFallback = (
  <Box component="output" sx={fallbackSx} aria-label="Loading wizard">
    <CircularProgress />
  </Box>
);

export function WizardRoute() {
  return (
    <Suspense fallback={wizardFallback}>
      <WizardScreen />
    </Suspense>
  );
}
