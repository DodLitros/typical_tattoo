import { supabase } from "../../../lib/supabaseClient";

export interface TimelineMedia {
  id: string;
  storage_url: string | null;
  thumbnail_url: string | null;
  media_type: "image" | "audio" | null;
  media_role: "reference" | "design" | "final" | null;
  sort_order: number | null;
}

export interface QuoteInfo {
  description: string | null;
  body_placement: string | null;
  size_hint: string | null;
  status: string | null;
  completed_at: string | null;
  created_at: string | null;
}

export interface ClientInfo {
  full_name: string | null;
}

export interface QuoteResponseInfo {
  price: number | null;
  duration_minutes: number | null;
  notes: string | null;
}

export interface AppointmentInfo {
  appointment_date: string | null;
  start_time: string | null;
  status: string | null;
}

export interface DesignInfo {
  storage_url: string | null;
  thumbnail_url: string | null;
  status: string | null;
}

export interface PortfolioPostWithDetails {
  id: string;
  title: string;
  cover_image_url: string | null;
  is_published: boolean | null;
  published_at: string | null;
  quote_request_id: string | null;
  timeline: TimelineMedia[];
  quote: QuoteInfo | null;
  client: ClientInfo | null;
  quoteResponse: QuoteResponseInfo | null;
  appointment: AppointmentInfo | null;
  design: DesignInfo | null;
  tags: { id: string; name: string; color_hex: string | null }[];
}

export async function getPublishedPortfolioPosts(): Promise<PortfolioPostWithDetails[]> {
  const { data: posts, error: postsError } = await supabase
    .from("portfolio_post")
    .select(`
      id,
      title,
      cover_image_url,
      is_published,
      published_at,
      quote_request_id
    `)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (postsError) throw postsError;
  if (!posts || posts.length === 0) return [];

  const postsWithDetails: PortfolioPostWithDetails[] = await Promise.all(
    posts.map(async (post) => {
      const [
        { data: media },
        { data: quote },
        { data: client },
        { data: quoteResponse },
        { data: appointment },
        { data: design },
        { data: tags },
      ] = await Promise.all([
        supabase
          .from("post_media")
          .select("id, storage_url, thumbnail_url, media_type, media_role, sort_order")
          .eq("post_id", post.id)
          .order("sort_order", { ascending: true }),
        post.quote_request_id
          ? supabase
              .from("quote_request")
              .select("description, body_placement, size_hint, status, completed_at, created_at")
              .eq("id", post.quote_request_id)
              .single()
          : Promise.resolve({ data: null }),
        post.quote_request_id
          ? supabase
              .from("client")
              .select("full_name")
              .eq("id", (
                await supabase
                  .from("quote_request")
                  .select("client_id")
                  .eq("id", post.quote_request_id)
                  .single()
              ).data?.client_id)
              .single()
          : Promise.resolve({ data: null }),
        post.quote_request_id
          ? supabase
              .from("quote_response")
              .select("price, duration_minutes, notes")
              .eq("quote_request_id", post.quote_request_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        post.quote_request_id
          ? supabase
              .from("appointment")
              .select("appointment_date, start_time, status")
              .eq("quote_request_id", post.quote_request_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        post.quote_request_id
          ? supabase
              .from("design")
              .select("storage_url, thumbnail_url, status")
              .eq("quote_request_id", post.quote_request_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from("post_tag")
          .select("tag:tag_id(id, name, color_hex)")
          .eq("post_id", post.id),
      ]);

      return {
        ...post,
        timeline: (media || []).map((m) => ({
          id: m.id,
          storage_url: m.storage_url,
          thumbnail_url: m.thumbnail_url,
          media_type: m.media_type,
          media_role: m.media_role,
          sort_order: m.sort_order,
        })),
        quote: quote,
        client: client,
        quoteResponse: quoteResponse,
        appointment: appointment,
        design: design,
        tags: (tags || []).map((t: any) => t.tag).filter(Boolean),
      };
    })
  );

  return postsWithDetails;
}