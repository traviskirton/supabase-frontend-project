import { NextResponse } from "next/server"
import { getSupabaseConfig } from "@/lib/supabase"

export async function GET() {
  // Get all environment variables that start with NEXT_PUBLIC
  const publicEnvVars: Record<string, string> = {}

  for (const key in process.env) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      // Mask the values for security
      const value = process.env[key] || ""
      publicEnvVars[key] = value.substring(0, 5) + "..." + (value.length > 10 ? value.substring(value.length - 5) : "")
    }
  }

  return NextResponse.json({
    supabaseConfig: getSupabaseConfig(),
    publicEnvVars,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString(),
  })
}

