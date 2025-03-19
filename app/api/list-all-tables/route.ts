import { NextResponse } from "next/server"
import { getTableNames } from "@/lib/get-tables"

export async function GET() {
  try {
    console.log("API: Fetching table names...")

    // Check if Supabase credentials are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase URL is not configured",
          details: "Please add the NEXT_PUBLIC_SUPABASE_URL environment variable",
        },
        { status: 500 },
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase API key is not configured",
          details: "Please add either NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable",
        },
        { status: 500 },
      )
    }

    // Get all tables using the service role key for best results
    const tables = await getTableNames()

    console.log(`API: Successfully retrieved ${tables.length} tables`)

    return NextResponse.json({
      success: true,
      tables,
      count: tables.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("API error fetching tables:", error)

    // Provide detailed error information
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

