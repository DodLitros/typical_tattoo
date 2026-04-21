import { supabase } from "../../../lib/supabaseClient";

export async function signInWithOtp(phone: string, full_name: string) {
  // Agregar prefijo si no lo tiene
  const phoneWithPrefix = phone.startsWith("+") ? phone : `+57${phone}`;
  
  return supabase.auth.signInWithOtp({
    phone: phoneWithPrefix,
    options: {
      data: {
        full_name: full_name,
      },
    },
  });
}

export async function verifyOtp(phone: string, token: string) {
  const phoneWithPrefix = phone.startsWith("+") ? phone : `+57${phone}`;
  
  return supabase.auth.verifyOtp({
    phone: phoneWithPrefix,
    token: token,
    type: "sms",
  });
}
