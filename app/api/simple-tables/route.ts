import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Supabase credentials",
          details: {
            urlDefined: !!supabaseUrl,
            keyDefined: !!supabaseKey,
          },
        },
        { status: 500 },
      )
    }

    console.log(`Simple Tables API: Fetching from ${supabaseUrl} ...`)

    // Make a direct request to the Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error (${response.status}):`, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Supabase API error: ${response.status}`,
          details: errorText,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    // The response contains the available tables as keys
    const tables = Object.keys(data)
      .filter(
        (table) =>
          // Filter out system tables and metadata
          !table.startsWith("pg_") &&
          !table.startsWith("_") &&
          !table.startsWith("auth_") &&
          !table.startsWith("supabase_") &&
          !table.startsWith("storage_") &&
          table !== "schema" &&
          table !== "extensions" &&
          table !== "buckets" &&
          table !== "objects" &&
          table !== "policies",
      )
      .sort()

    console.log(`Simple Tables API: Found ${tables.length} tables`)

    return NextResponse.json({
      success: true,
      tables,
      count: tables.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Simple Tables API error:", error)

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

