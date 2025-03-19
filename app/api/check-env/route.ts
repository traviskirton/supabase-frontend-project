import { NextResponse } from "next/server"

export async function GET() {
  // Get all environment variables that start with NEXT_PUBLIC
  const publicEnvVars: Record<string, string> = {}

  for (const key in process.env) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      // Mask the values for security
      const value = process.env[key] || ""
      publicEnvVars[key] =
        value.length > 0
          ? value.substring(0, 3) + "..." + (value.length > 6 ? value.substring(value.length - 3) : "")
          : "Not set"
    }
  }

  // Check specific variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    message: "Environment variables check",
    timestamp: new Date().toISOString(),
    publicEnvVars,
    supabaseConfig: {
      urlDefined: !!supabaseUrl,
      keyDefined: !!supabaseKey,
      urlLength: supabaseUrl ? supabaseUrl.length : 0,
      keyLength: supabaseKey ? supabaseKey.length : 0,
    },
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  })
}

