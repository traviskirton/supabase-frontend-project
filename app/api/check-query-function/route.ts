import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase is not configured. Please add the required environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    // Try to use the pgclient_query function
    const { data, error } = await supabase.rpc("pgclient_query", {
      query: "SELECT 1 as test",
    })

    if (error) {
      return NextResponse.json({
        exists: false,
        error: error.message,
        message:
          "The pgclient_query function does not exist or is not accessible. Please create it using the SQL Helper.",
      })
    }

    return NextResponse.json({
      exists: true,
      message: "The pgclient_query function exists and is working correctly.",
    })
  } catch (error: any) {
    console.error("Error checking query function:", error)
    return NextResponse.json({
      exists: false,
      error: error.message,
      message: "Error checking the pgclient_query function. Please create it using the SQL Helper.",
    })
  }
}

