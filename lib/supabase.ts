/**
 * Supabase clients
 * - `supabase` is safe for browser/edge usage and uses NEXT_PUBLIC_* env vars.
 * - `supabaseAdmin` is intended for server-side use only and requires the
 *   service role key (do NOT expose this to the browser).
 */
import { createClient } from '@supabase/supabase-js'

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(publicUrl, publicAnonKey)

// Server-side admin client (service role key). Use only in server runtime.
const serviceUrl = process.env.SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseAdmin = createClient(serviceUrl, serviceKey)

// Note: Never expose the `supabaseAdmin` service role key to client-side code.
