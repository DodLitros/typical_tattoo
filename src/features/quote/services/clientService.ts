import { supabase } from "../../../lib/supabaseClient";
import type { NewClient } from "../types";

export async function createNewClient(values: NewClient) {
  const payload: NewClient= {
    full_name: values.full_name,
    phone: values.phone,
  };

  const { data, error } = await supabase
    .from("client")
    .upsert(payload, { onConflict: "phone" });

  if (error) throw error;
  return data;
}