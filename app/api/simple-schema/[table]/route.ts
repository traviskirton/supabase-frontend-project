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

    // Try to get the schema by directly querying the table
    const { data, error } = await client.from(tableName).select("*").limit(1)

    if (error) {
      console.error(`Error querying table ${tableName}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If we got data, extract the column names and types
    if (data && data.length > 0) {
      const row = data[0]
      const schema = Object.keys(row).map((column_name) => {
        const value = row[column_name]
        let data_type = typeof value

        // Try to determine more specific types
        if (value === null) {
          data_type = "unknown"
        } else if (Array.isArray(value)) {
          data_type = "array"
        } else if (value instanceof Date) {
          data_type = "timestamp"
        } else if (typeof value === "object") {
          data_type = "json"
        }

        return {
          column_name,
          data_type,
          is_nullable: true, // We can't determine this from a single row
          column_default: null, // We can't determine this from a single row
        }
      })

      return NextResponse.json({ schema })
    } else {
      // If the table is empty, we can only return the column names
      const { data: emptyData, error: emptyError } = await client.from(tableName).select()

      if (emptyError) {
        console.error(`Error querying empty table ${tableName}:`, emptyError)
        return NextResponse.json({ error: emptyError.message }, { status: 500 })
      }

      // Get column names from the empty result
      const columnNames = Object.keys(emptyData[0] || {})

      const schema = columnNames.map((column_name) => ({
        column_name,
        data_type: "unknown", // We can't determine types from an empty table
        is_nullable: true,
        column_default: null,
      }))

      return NextResponse.json({ schema })
    }
  } catch (error: any) {
    console.error(`Error in simple schema route:`, error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

