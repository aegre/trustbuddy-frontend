import { Suspense, lazy } from "react";
import { WizardPageSkeleton } from "@/features/wizard/components/wizard-page-skeleton";

const WizardScreen = lazy(async () => {
  const module = await import("@/features/wizard/screens/wizard-screen");
  return { default: module.WizardScreen };
});

export function WizardRoute() {
  return (
    <Suspense fallback={<WizardPageSkeleton />}>
      <WizardScreen />
    </Suspense>
  );
}
