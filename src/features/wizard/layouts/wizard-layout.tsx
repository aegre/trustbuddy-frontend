import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { WIZARD_STEPS } from "@/features/wizard/types/wizard-step-registry";
import type { WizardStepSlug } from "@/features/wizard/types/wizard-steps";
import {
  getNextWizardStep,
  getPreviousWizardStep,
  getWizardStepIndex,
} from "@/features/wizard/utils/step-guards";
import { wizardHref } from "@/features/wizard/utils/wizard-href";
import { paths } from "@/routes/paths";

export type WizardLayoutProps = {
  stepSlug: WizardStepSlug;
  quoteId?: string;
  children: ReactNode;
};

const containerSx = { py: 4 } as const;
const headerSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  flexWrap: "wrap",
} as const;
const navSx = {
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
  pt: 2,
} as const;
const contentSx = { py: 3 } as const;

export function WizardLayout({
  stepSlug,
  quoteId,
  children,
}: WizardLayoutProps) {
  const activeStep = getWizardStepIndex(stepSlug);
  const previous = getPreviousWizardStep(stepSlug);
  const next = getNextWizardStep(stepSlug);

  return (
    <Container component="main" maxWidth="md" sx={containerSx}>
      <Stack spacing={3}>
        <Box sx={headerSx}>
          <Typography component="h1" variant="h5">
            Quote wizard
          </Typography>
          <Button component={RouterLink} to={paths.home} variant="text">
            Back to quotes
          </Button>
        </Box>

        <Stepper nonLinear activeStep={activeStep} alternativeLabel>
          {WIZARD_STEPS.map((step) => (
            <Step
              key={step.slug}
              completed={activeStep > getWizardStepIndex(step.slug)}
            >
              <StepButton
                component={RouterLink}
                to={wizardHref(step.slug, { quoteId })}
              >
                {step.label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <Box sx={contentSx}>{children}</Box>

        <Box sx={navSx}>
          {previous ? (
            <Button
              component={RouterLink}
              to={wizardHref(previous, { quoteId })}
              variant="outlined"
            >
              Previous
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button
              component={RouterLink}
              to={wizardHref(next, { quoteId })}
              variant="contained"
            >
              Next
            </Button>
          ) : (
            <span />
          )}
        </Box>
      </Stack>
    </Container>
  );
}
