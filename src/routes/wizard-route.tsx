import { Suspense, lazy } from "react";
import { PageLoading } from "@/features/common/components/page-loading";

const WizardScreen = lazy(async () => {
  const module = await import("@/features/wizard/screens/wizard-screen");
  return { default: module.WizardScreen };
});

export function WizardRoute() {
  return (
    <Suspense fallback={<PageLoading label="Loading wizard" />}>
      <WizardScreen />
    </Suspense>
  );
}
