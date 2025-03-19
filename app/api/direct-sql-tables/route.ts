import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: "Missing Supabase credentials",
          tables: [],
        },
        { status: 500 },
      )
    }

    // Make a direct SQL query to PostgreSQL to get all tables
    // We'll use the Supabase REST API to execute a SQL query
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: `Failed to get tables: ${response.status} - ${errorText}`,
          tables: [],
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    // The response contains the available tables as keys
    const tables = Object.keys(data).filter(
      (table) =>
        // Filter out system tables
        !table.startsWith("pg_") && !table.startsWith("_") && table !== "schema" && !table.includes("auth"),
    )

    return NextResponse.json({
      tables,
      method: "direct_rest_api",
      note: `Found ${tables.length} tables using direct REST API.`,
    })
  } catch (error: any) {
    console.error("Error fetching tables:", error)
    return NextResponse.json(
      {
        error: error.message,
        tables: [],
      },
      { status: 500 },
    )
  }
}

