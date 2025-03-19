import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get environment variables for debugging
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Simple query to test connection
    const { data, error } = await supabase.from("pg_stat_statements").select("query").limit(1).maybeSingle()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
          env: {
            supabaseUrlDefined: !!supabaseUrl,
            supabaseKeyDefined: !!supabaseAnonKey,
            urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "Not set",
            keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + "..." : "Not set",
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase",
      env: {
        supabaseUrlDefined: !!supabaseUrl,
        supabaseKeyDefined: !!supabaseAnonKey,
        urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "Not set",
        keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + "..." : "Not set",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        env: {
          supabaseUrlDefined: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKeyDefined: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      },
      { status: 500 },
    )
  }
}

