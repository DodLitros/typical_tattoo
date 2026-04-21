import { supabase } from "../../../lib/supabaseClient";
import type { ClientEntry, QuoteFormValues, QuoteRequestPayload } from "../types";

export async function getClients() {
  return supabase
    .from("client")
    .select("id, full_name, phone")
    .returns<ClientEntry[]>();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getClientByAuthId() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from("client")
    .select("id, full_name, phone")
    .eq("id", user.id)
    .single();
  
  return data;
}

export async function createQuoteRequestForClient() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No authenticated user");
  
  const { data, error } = await supabase
    .from("quote_request")
    .insert({
      client_id: user.id,
      status: "draft",
      wants_appointment: false,
    })
    .select("id")
    .single();
  
  if (error) throw error;
  return data;
}

export async function createQuoteRequest(values: QuoteFormValues) {
  const payload: QuoteRequestPayload = {
    full_name: values.fullName,
    phone: values.phone,
  };
  return supabase.from("quote_request").insert(payload);
}

export async function updateQuoteRequest(
  quoteRequestId: string,
  updates: {
    description?: string;
    body_placement?: string;
    size_hint?: string;
    preferred_date?: string;
    preferred_time_slot?: string;
  }
) {
  const { data, error } = await supabase
    .from("quote_request")
    .update(updates)
    .eq("id", quoteRequestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadQuoteMedia(
  quoteRequestId: string,
  files: File[]
) {
  const mediaIds = [];
  debugger;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = `${quoteRequestId}/${Date.now()}-${file.name}`;

    // Subir archivo a Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("quote_media")
      .upload(fileName, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from("quote_media")
      .getPublicUrl(fileName);

    // Crear registro en quote_media
    const { data: mediaData, error: mediaError } = await supabase
      .from("quote_media")
      .insert({
        quote_request_id: quoteRequestId,
        storage_url: urlData.publicUrl,
        media_type: file.type.startsWith("image") ? "image" : "video",
        sort_order: i,
      })
      .select("id")
      .single();

    if (mediaError) throw mediaError;
    mediaIds.push(mediaData.id);
  }

  return mediaIds;
}
