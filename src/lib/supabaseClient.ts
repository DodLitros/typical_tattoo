import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY ?? "";

const options = {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'Content-Type': 'application/json' },
  },
}
export const supabase = createClient(supabaseUrl, supabaseKey, options);
const { data, error } = await supabase.auth.getSession();
