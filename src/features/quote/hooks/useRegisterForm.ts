import { useState } from "react";
import type { NewClient } from "../types";

const initialState: NewClient = {
  full_name: "",
  phone: "",
};

export function useRegisterForm() {
  const [values, setValues] = useState<NewClient>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  const updateField = (field: keyof NewClient, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setValues(initialState);
    setOtpSent(false);
    setOtpCode("");
  };

  return {
    values,
    isSubmitting,
    setIsSubmitting,
    updateField,
    reset,
    otpSent,
    setOtpSent,
    otpCode,
    setOtpCode,
  };
}
