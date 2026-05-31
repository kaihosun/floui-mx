import { createClient } from '@supabase/supabase-js'

// Client with anon key — respects RLS (use in public-facing operations)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Admin client with service_role key — bypasses RLS (use for signed URLs, internal writes)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
