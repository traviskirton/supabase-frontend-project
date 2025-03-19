import { createClient } from "@supabase/supabase-js"
import { getEnv } from "./env"

// Get Supabase credentials using our utility
const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
)

// Export a function to check if Supabase is properly configured
export function isSupabaseConfigured() {
  return !!supabaseUrl && !!supabaseAnonKey
}

// Export the raw values for debugging (masked for security)
export function getSupabaseConfig() {
  return {
    urlDefined: !!supabaseUrl,
    keyDefined: !!supabaseAnonKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "Not set",
    keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + "..." : "Not set",
  }
}

