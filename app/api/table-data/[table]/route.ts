import { supabase, supabaseAdmin, isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

interface RouteParams {
  table: string
}

export async function GET(request: NextRequest, context: { params: RouteParams }) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase is not configured. Please add the required environment variables.",
      },
      { status: 500 },
    )
  }

  const tableName = context.params.table

  try {
    // Use the admin client if available, otherwise use the regular client
    const client = isSupabaseAdminConfigured() ? supabaseAdmin : supabase

    // Fetch data from the specified table
    const { data, error } = await client.from(tableName).select("*").limit(100)

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      return NextResponse.json(
        {
          error: error.message,
          note: isSupabaseAdminConfigured()
            ? undefined
            : "For better access, add the SUPABASE_SERVICE_ROLE_KEY environment variable.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error(`Error in table-data route:`, error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

