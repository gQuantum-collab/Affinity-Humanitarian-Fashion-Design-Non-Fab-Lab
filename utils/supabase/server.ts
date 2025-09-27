import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// createClient returns a server-side Supabase client (admin)
export async function createClient() {
  return getSupabaseAdmin()
}

export default createClient
