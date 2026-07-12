import { useQueryClient } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGetQuoteQueryKey,
  getListQuotesQueryKey,
  updateCoverage,
  useUpdateCoverage,
} from "@/api/generated/quotes/quotes";
import { getUserFacingErrorMessage } from "@/api/types";
import { CoverageForm } from "@/features/wizard/components/steps/coverage-form";
import {
  isSeniorApplicant,
  type CoverageFormValues,
} from "@/features/wizard/schemas/coverage";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";
import {
  toPartialUpdateCoverageRequest,
  toUpdateCoverageRequest,
} from "@/features/wizard/utils/coverage-request";
import { wizardHref } from "@/features/wizard/utils/wizard-href";

const PREMIUM_PATCH_DEBOUNCE_MS = 300;

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export function CoverageStep({ quoteId, quote, readOnly }: WizardStepProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [premiumErrorMessage, setPremiumErrorMessage] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(false);
  const [premium, setPremium] = useState<number | undefined>(
    quote?.estimatedMonthlyPremium,
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastValuesRef = useRef<CoverageFormValues | null>(null);
  const quoteIdRef = useRef(quoteId);
  const ageRef = useRef(quote?.age);
  const readOnlyRef = useRef(readOnly);
  const isSubmittingRef = useRef(false);
  quoteIdRef.current = quoteId;
  ageRef.current = quote?.age;
  readOnlyRef.current = readOnly;
  isSubmittingRef.current = isSubmitting;

  const updateCoverageMutation = useUpdateCoverage();

  const defaultValues = useMemo((): Partial<CoverageFormValues> | undefined => {
    if (!quote) {
      return undefined;
    }
    const senior = isSeniorApplicant(quote.age);
    return {
      coverageType: quote.coverageType ?? "",
      takesPrescriptionMedication:
        quote.takesPrescriptionMedication ?? undefined,
      usesTobacco: quote.usesTobacco ?? undefined,
      needsSpouseCoverage: quote.needsSpouseCoverage ?? undefined,
      // Non-seniors must not keep API `null` — Yup rejects it and the field is hidden.
      hasPreexistingConditions: senior
        ? (quote.hasPreexistingConditions ?? undefined)
        : undefined,
      conditions: senior
        ? ((quote.conditions ?? []) as CoverageFormValues["conditions"])
        : [],
    };
  }, [quote]);

  const invalidateQuoteQueries = useCallback(
    async (id: string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetQuoteQueryKey(id) }),
        queryClient.invalidateQueries({
          queryKey: getListQuotesQueryKey(),
        }),
      ]);
    },
    [queryClient],
  );

  const cancelPendingPremiumPatch = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const patchPremium = useCallback(
    async (values: CoverageFormValues) => {
      const id = quoteIdRef.current;
      if (!id || readOnlyRef.current) {
        setIsPremiumLoading(false);
        return;
      }

      const data = toPartialUpdateCoverageRequest(values, ageRef.current);
      if (!data) {
        setIsPremiumLoading(false);
        return;
      }

      cancelPendingPremiumPatch();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsPremiumLoading(true);
      setPremiumErrorMessage(null);

      try {
        const response = await updateCoverage(id, data, {
          signal: controller.signal,
        });
        setPremium(response.data.estimatedMonthlyPremium);
        setIsPremiumLoading(false);
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }
        if (isSubmittingRef.current) {
          return;
        }
        setIsPremiumLoading(false);
        setPremiumErrorMessage(
          getUserFacingErrorMessage(error, "Could not update premium"),
        );
      }
    },
    [cancelPendingPremiumPatch],
  );

  const debouncedPatchPremium = useMemo(
    () =>
      debounce((values: CoverageFormValues) => {
        void patchPremium(values);
      }, PREMIUM_PATCH_DEBOUNCE_MS),
    [patchPremium],
  );

  useEffect(() => {
    return () => {
      debouncedPatchPremium.cancel();
      cancelPendingPremiumPatch();
    };
  }, [cancelPendingPremiumPatch, debouncedPatchPremium]);

  const onValuesChange = useCallback(
    (values: CoverageFormValues) => {
      lastValuesRef.current = values;
      setPremiumErrorMessage(null);
      setIsPremiumLoading(true);
      debouncedPatchPremium(values);
    },
    [debouncedPatchPremium],
  );

  const onRetryPremium = useCallback(
    (values: CoverageFormValues) => {
      lastValuesRef.current = values;
      debouncedPatchPremium.cancel();
      void patchPremium(values);
    },
    [debouncedPatchPremium, patchPremium],
  );

  const onSubmit = useCallback(
    async (values: CoverageFormValues) => {
      if (!quoteId) {
        return;
      }

      debouncedPatchPremium.cancel();
      cancelPendingPremiumPatch();
      setIsPremiumLoading(false);
      setPremiumErrorMessage(null);

      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        const response = await updateCoverageMutation.mutateAsync({
          id: quoteId,
          data: toUpdateCoverageRequest(values, quote?.age),
        });
        setPremium(response.data.estimatedMonthlyPremium);
        await invalidateQuoteQueries(quoteId);
        navigate(wizardHref("review", { quoteId }));
      } catch (error) {
        setErrorMessage(
          getUserFacingErrorMessage(error, "Could not save coverage"),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      cancelPendingPremiumPatch,
      debouncedPatchPremium,
      invalidateQuoteQueries,
      navigate,
      quote?.age,
      quoteId,
      updateCoverageMutation,
    ],
  );

  // Coverage / review require quoteId — WizardScreen redirects otherwise.
  if (!quoteId) {
    return null;
  }

  return (
    <CoverageForm
      key={quoteId}
      onSubmit={onSubmit}
      onValuesChange={readOnly ? undefined : onValuesChange}
      onRetryPremium={readOnly ? undefined : onRetryPremium}
      defaultValues={defaultValues}
      age={quote?.age}
      estimatedMonthlyPremium={premium}
      isPremiumLoading={isPremiumLoading}
      premiumErrorMessage={premiumErrorMessage}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      readOnly={readOnly}
    />
  );
}
