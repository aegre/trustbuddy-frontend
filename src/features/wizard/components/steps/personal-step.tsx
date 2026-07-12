import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGetQuoteQueryKey,
  getListQuotesQueryKey,
  useCreateQuote,
  useUpdatePersonalInfo,
} from "@/api/generated/quotes/quotes";
import { getUserFacingErrorMessage } from "@/api/types";
import { QUOTES_LIST_DEFAULTS } from "@/features/quotes/hooks/use-quotes-list";
import { PersonalForm } from "@/features/wizard/components/steps/personal-form";
import type { PersonalFormValues } from "@/features/wizard/schemas/personal";
import type { WizardStepProps } from "@/features/wizard/types/wizard-steps";
import { wizardHref } from "@/features/wizard/utils/wizard-href";

export function PersonalStep({ quoteId, quote, readOnly }: WizardStepProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createQuote = useCreateQuote();
  const updatePersonalInfo = useUpdatePersonalInfo();

  const defaultValues = useMemo((): Partial<PersonalFormValues> | undefined => {
    if (!quote) {
      return undefined;
    }
    return {
      name: quote.name ?? "",
      email: quote.email ?? "",
      age: quote.age ?? ("" as unknown as number),
      zipCode: quote.zipCode ?? "",
    };
  }, [quote]);

  const isSubmitting = createQuote.isPending || updatePersonalInfo.isPending;

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
    async (values: PersonalFormValues) => {
      setErrorMessage(null);
      try {
        if (quoteId) {
          await updatePersonalInfo.mutateAsync({ id: quoteId, data: values });
          await invalidateQuoteQueries(quoteId);
          navigate(wizardHref("coverage", { quoteId }));
          return;
        }

        const response = await createQuote.mutateAsync({ data: values });
        const createdId = response.data.id;
        if (!createdId) {
          setErrorMessage("Could not save personal information");
          return;
        }
        await invalidateQuoteQueries(createdId);
        navigate(wizardHref("coverage", { quoteId: createdId }));
      } catch (error) {
        setErrorMessage(
          getUserFacingErrorMessage(
            error,
            "Could not save personal information",
          ),
        );
      }
    },
    [
      createQuote,
      invalidateQuoteQueries,
      navigate,
      quoteId,
      updatePersonalInfo,
    ],
  );

  return (
    <PersonalForm
      key={quoteId ?? "new"}
      onSubmit={onSubmit}
      defaultValues={defaultValues}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      readOnly={readOnly}
    />
  );
}
