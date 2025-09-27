import { createClient } from '@/utils/supabase/server'

// This page must run dynamically (server data, requires runtime envs).
export const dynamic = 'force-dynamic'

export default async function Notes() {
  // If the admin URL isn't available at runtime, show a helpful message
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <pre>Supabase not configured (NEXT_PUBLIC_SUPABASE_URL missing)</pre>
  }

  const supabase = await createClient()
  const { data: notes } = await supabase.from('notes').select()

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
