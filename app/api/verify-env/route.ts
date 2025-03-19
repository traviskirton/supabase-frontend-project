import { NextResponse } from "next/server"

export async function GET() {
  // Get the environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const vercelRegion = process.env.VERCEL_REGION

  // Create a response with detailed information
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: {
      region: vercelRegion || "Not set",
      env: process.env.VERCEL_ENV || "Not set",
    },
    supabase: {
      urlDefined: !!supabaseUrl,
      anonKeyDefined: !!supabaseAnonKey,
      serviceKeyDefined: !!supabaseServiceKey,
      urlLength: supabaseUrl ? supabaseUrl.length : 0,
      anonKeyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
      serviceKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0,
      urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "Not set",
      anonKeyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + "..." : "Not set",
      serviceKeyPrefix: supabaseServiceKey ? supabaseServiceKey.substring(0, 5) + "..." : "Not set",
    },
  })
}

