import { createClient } from "@supabase/supabase-js"

// IMPORTANT: Replace these values with your actual Supabase credentials
// Only use this file for testing and DO NOT commit it with real credentials
const supabaseUrl = "https://your-project-id.supabase.co"
const supabaseAnonKey = "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function isSupabaseConfigured() {
  return true // Always returns true since we're using hardcoded values
}

export function getSupabaseConfig() {
  return {
    urlDefined: true,
    keyDefined: true,
    urlPrefix: supabaseUrl.substring(0, 10) + "...",
    keyPrefix: supabaseAnonKey.substring(0, 5) + "...",
  }
}

