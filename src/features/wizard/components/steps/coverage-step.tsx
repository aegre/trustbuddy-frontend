import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGetQuoteQueryKey,
  getListQuotesQueryKey,
  useUpdateCoverage,
} from "@/api/generated/quotes/quotes";
import type { UpdateCoverageRequest } from "@/api/types";
import { getUserFacingErrorMessage } from "@/api/types";
import { QUOTES_LIST_DEFAULTS } from "@/features/quotes/hooks/use-quotes-list";
import { CoverageForm } from "@/features/wizard/components/steps/coverage-form";
import {
  isSeniorApplicant,
  type CoverageFormValues,
  type CoverageTypeValue,
  type ConditionValue,
} from "@/features/wizard/schemas/coverage";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";
import { wizardHref } from "@/features/wizard/utils/wizard-href";

function toUpdateCoverageRequest(
  values: CoverageFormValues,
  age: number | undefined,
): UpdateCoverageRequest {
  const senior = isSeniorApplicant(age);
  const request: UpdateCoverageRequest = {
    coverageType: values.coverageType as CoverageTypeValue,
    takesPrescriptionMedication: values.takesPrescriptionMedication,
    usesTobacco: values.usesTobacco,
    needsSpouseCoverage: values.needsSpouseCoverage,
  };

  if (senior) {
    request.hasPreexistingConditions = values.hasPreexistingConditions;
    request.conditions =
      values.hasPreexistingConditions === true
        ? ((values.conditions ?? []) as ConditionValue[])
        : [];
  }

  return request;
}

export function CoverageStep({ quoteId, quote, readOnly }: WizardStepProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [premium, setPremium] = useState<number | undefined>(
    quote?.estimatedMonthlyPremium,
  );

  const updateCoverage = useUpdateCoverage();

  const defaultValues = useMemo((): Partial<CoverageFormValues> | undefined => {
    if (!quote) {
      return undefined;
    }
    return {
      coverageType:
        (quote.coverageType as CoverageTypeValue | undefined) ??
        ("" as CoverageTypeValue),
      takesPrescriptionMedication: quote.takesPrescriptionMedication ?? false,
      usesTobacco: quote.usesTobacco ?? false,
      needsSpouseCoverage: quote.needsSpouseCoverage ?? false,
      hasPreexistingConditions: quote.hasPreexistingConditions,
      conditions: (quote.conditions as ConditionValue[] | undefined) ?? [],
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

  const onSubmit = useCallback(
    async (values: CoverageFormValues) => {
      if (!quoteId) {
        setErrorMessage("Save personal information before updating coverage");
        return;
      }

      setErrorMessage(null);
      try {
        const response = await updateCoverage.mutateAsync({
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
      defaultValues={defaultValues}
      age={quote?.age}
      estimatedMonthlyPremium={premium}
      errorMessage={errorMessage}
      isSubmitting={updateCoverage.isPending}
      readOnly={readOnly}
    />
  );
}
