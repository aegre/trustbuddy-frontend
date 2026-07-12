import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGetQuoteQueryKey,
  getListQuotesQueryKey,
  useUpdateCoverage,
} from "@/api/generated/quotes/quotes";
import { getUserFacingErrorMessage } from "@/api/types";
import { QUOTES_LIST_DEFAULTS } from "@/features/quotes/hooks/use-quotes-list";
import { CoverageForm } from "@/features/wizard/components/steps/coverage-form";
import type { CoverageFormValues } from "@/features/wizard/schemas/coverage";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";
import {
  toPartialUpdateCoverageRequest,
  toUpdateCoverageRequest,
} from "@/features/wizard/utils/coverage-request";
import { wizardHref } from "@/features/wizard/utils/wizard-href";

const PREMIUM_PATCH_DEBOUNCE_MS = 300;

export function CoverageStep({ quoteId, quote, readOnly }: WizardStepProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [premium, setPremium] = useState<number | undefined>(
    quote?.estimatedMonthlyPremium,
  );
  const patchGeneration = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateCoverage = useUpdateCoverage();

  const defaultValues = useMemo((): Partial<CoverageFormValues> | undefined => {
    if (!quote) {
      return undefined;
    }
    return {
      coverageType: quote.coverageType ?? "",
      takesPrescriptionMedication: quote.takesPrescriptionMedication,
      usesTobacco: quote.usesTobacco,
      needsSpouseCoverage: quote.needsSpouseCoverage,
      hasPreexistingConditions: quote.hasPreexistingConditions,
      conditions: (quote.conditions ?? []) as CoverageFormValues["conditions"],
    };
  }, [quote]);

  const invalidateQuoteQueries = useCallback(
    async (id: string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetQuoteQueryKey(id) }),
        queryClient.invalidateQueries({
          queryKey: getListQuotesQueryKey({
            page: QUOTES_LIST_DEFAULTS.page,
            size: QUOTES_LIST_DEFAULTS.size,
            sort: QUOTES_LIST_DEFAULTS.sort,
          }),
        }),
      ]);
    },
    [queryClient],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      patchGeneration.current += 1;
    };
  }, []);

  const patchPremium = useCallback(
    async (values: CoverageFormValues) => {
      if (!quoteId || readOnly) {
        return;
      }

      const data = toPartialUpdateCoverageRequest(values, quote?.age);
      if (!data) {
        return;
      }

      const generation = ++patchGeneration.current;
      try {
        const response = await updateCoverage.mutateAsync({
          id: quoteId,
          data,
        });
        if (generation === patchGeneration.current) {
          setPremium(response.data.estimatedMonthlyPremium);
        }
      } catch {
        // Live refresh is best-effort; Continue still surfaces errors.
      }
    },
    [quote?.age, quoteId, readOnly, updateCoverage],
  );

  const onValuesChange = useCallback(
    (values: CoverageFormValues) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        void patchPremium(values);
      }, PREMIUM_PATCH_DEBOUNCE_MS);
    },
    [patchPremium],
  );

  const onSubmit = useCallback(
    async (values: CoverageFormValues) => {
      if (!quoteId) {
        setErrorMessage("Save personal information before updating coverage");
        return;
      }

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }

      setErrorMessage(null);
      setIsSubmitting(true);
      const generation = ++patchGeneration.current;
      try {
        const response = await updateCoverage.mutateAsync({
          id: quoteId,
          data: toUpdateCoverageRequest(values, quote?.age),
        });
        if (generation === patchGeneration.current) {
          setPremium(response.data.estimatedMonthlyPremium);
        }
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
    [invalidateQuoteQueries, navigate, quote?.age, quoteId, updateCoverage],
  );

  if (!quoteId) {
    return (
      <CoverageForm
        onSubmit={onSubmit}
        errorMessage="Save personal information before updating coverage"
        readOnly
      />
    );
  }

  return (
    <CoverageForm
      key={quoteId}
      onSubmit={onSubmit}
      onValuesChange={readOnly ? undefined : onValuesChange}
      defaultValues={defaultValues}
      age={quote?.age}
      estimatedMonthlyPremium={premium}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      readOnly={readOnly}
    />
  );
}
