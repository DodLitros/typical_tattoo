import { useState } from "react";
import type { QuoteFormValues } from "../types";

const initialState: QuoteFormValues = {
  fullName: "",
  phone: "",
};

export function useQuoteForm() {
  const [values, setValues] = useState<QuoteFormValues>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateField = (field: keyof QuoteFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => setValues(initialState);

  return {
    values,
    isSubmitting,
    setIsSubmitting,
    updateField,
    reset,
  };
}
