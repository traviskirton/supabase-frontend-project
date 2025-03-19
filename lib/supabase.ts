import { createClient } from "@supabase/supabase-js"

// Check if environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a client with the anon key (for client-side use)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
)

// Create a client with the service role key (for server-side admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-key",
)

// Export a function to check if Supabase is properly configured
export function isSupabaseConfigured() {
  return !!supabaseUrl && !!supabaseAnonKey
}

// Export a function to check if the admin client is configured
export function isSupabaseAdminConfigured() {
  return !!supabaseUrl && !!supabaseServiceKey
}

// Export the raw values for debugging (masked for security)
export function getSupabaseConfig() {
  return {
    urlDefined: !!supabaseUrl,
    keyDefined: !!supabaseAnonKey,
    serviceKeyDefined: !!supabaseServiceKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "Not set",
    keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + "..." : "Not set",
    serviceKeyPrefix: supabaseServiceKey ? supabaseServiceKey.substring(0, 5) + "..." : "Not set",
  }
}

