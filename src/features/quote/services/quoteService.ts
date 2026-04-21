import { supabase } from "../../../lib/supabaseClient";
import type { ClientEntry, QuoteFormValues, QuoteRequestPayload } from "../types";

export async function getClients() {
  return supabase
    .from("client")
    .select("id, full_name, phone")
    .returns<ClientEntry[]>();
}

export async function createQuoteRequest(values: QuoteFormValues) {
  const payload: QuoteRequestPayload = {
    full_name: values.fullName,
    phone: values.phone,
  };
  return supabase.from("quote_request").insert(payload);
}
