import { NextResponse } from "next/server"
import { getSupabaseConfig } from "@/lib/supabase"

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Basic validation
    const urlValid = supabaseUrl && supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co")
    const keyValid = supabaseAnonKey && supabaseAnonKey.length > 20

    // Try a direct fetch to Supabase REST API
    let restApiStatus = "Not tested"
    let restApiResponse = null

    if (urlValid && keyValid) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
        })

        restApiStatus = response.status.toString()
        restApiResponse = await response.text()
      } catch (error: any) {
        restApiStatus = "Error"
        restApiResponse = error.message
      }
    }

    return NextResponse.json({
      diagnostics: {
        environment: {
          runtime: process.version,
          nodeEnv: process.env.NODE_ENV,
          region: process.env.VERCEL_REGION || "unknown",
          vercelEnv: process.env.VERCEL_ENV || "unknown",
        },
        supabase: {
          url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : "Not set",
          urlValid,
          keyValid,
          keyPresent: !!supabaseAnonKey,
          restApiStatus,
          restApiResponse,
          config: getSupabaseConfig(),
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Diagnostic error",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

