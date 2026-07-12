import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { QuoteResponse } from "@/api/types";
import { WIZARD_STEPS } from "@/features/wizard/types/wizard-step-registry";
import type { WizardStepSlug } from "@/features/wizard/types/wizard-steps";
import {
  getNextWizardStep,
  getPreviousWizardStep,
  getWizardStepIndex,
  isWizardStepAccessible,
} from "@/features/wizard/utils/step-guards";
import { wizardHref } from "@/features/wizard/utils/wizard-href";

export type WizardLayoutProps = {
  stepSlug: WizardStepSlug;
  quoteId?: string;
  quote?: QuoteResponse | null;
  showStepChrome?: boolean;
  /** When true, hide the layout Next link (step owns continue, e.g. personal form). */
  hideNext?: boolean;
  /** When true, hide the layout Back/Next row (step owns footer actions). */
  hideNav?: boolean;
  children: ReactNode;
};

const containerSx = { py: 3 } as const;
const navSx = {
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
  pt: 1,
} as const;
const paperSx = { p: { xs: 2.5, sm: 3.5 } } as const;
const stepMetaSx = { mb: 0.5 } as const;

export function WizardLayout({
  stepSlug,
  quoteId,
  quote,
  showStepChrome = true,
  hideNext = false,
  hideNav = false,
  children,
}: WizardLayoutProps) {
  const activeStep = getWizardStepIndex(stepSlug);
  const previous = getPreviousWizardStep(stepSlug);
  const next = hideNext ? null : getNextWizardStep(stepSlug);
  const accessContext = { quoteId, quote };
  const stepDefinition = WIZARD_STEPS[activeStep];
  const stepNumber = activeStep + 1;
  const stepCount = WIZARD_STEPS.length;
  const showNav = showStepChrome && !hideNav;

  return (
    <Container component="main" maxWidth="md" sx={containerSx}>
      <Stack spacing={2}>
        {showStepChrome ? (
          <Stepper nonLinear activeStep={activeStep} alternativeLabel>
            {WIZARD_STEPS.map((step) => {
              const accessible = isWizardStepAccessible(
                step.slug,
                accessContext,
              );
              return (
                <Step
                  key={step.slug}
                  completed={activeStep > getWizardStepIndex(step.slug)}
                  disabled={!accessible}
                >
                  {accessible ? (
                    <StepButton
                      component={RouterLink}
                      to={wizardHref(step.slug, { quoteId })}
                    >
                      {step.label}
                    </StepButton>
                  ) : (
                    <StepLabel>{step.label}</StepLabel>
                  )}
                </Step>
              );
            })}
          </Stepper>
        ) : null}

        <Paper elevation={0} variant="outlined" sx={paperSx}>
          <Box sx={stepMetaSx}>
            <Typography
              color="primary"
              variant="body2"
              sx={{ fontWeight: 600 }}
            >
              Step {stepNumber} of {stepCount}
            </Typography>
            <Typography component="h1" variant="h5">
              {stepDefinition?.label ?? "Quote wizard"}
            </Typography>
            {stepDefinition?.description ? (
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 0.5 }}
              >
                {stepDefinition.description}
              </Typography>
            ) : null}
          </Box>

          <Box sx={{ pt: 2 }}>{children}</Box>
        </Paper>

        {showNav ? (
          <Box sx={navSx}>
            {previous ? (
              <Button
                component={RouterLink}
                to={wizardHref(previous, { quoteId })}
                variant="outlined"
              >
                Back
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
        ) : null}
      </Stack>
    </Container>
  );
}
