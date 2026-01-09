import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// This function creates a Supabase client using environment variables
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient()