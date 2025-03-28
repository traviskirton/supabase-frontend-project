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
    console.log(`Attempting to fetch schema for table: ${tableName}`)

    // First try using the RPC function with the regular client
    try {
      console.log("Trying RPC with anon key...")
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_table_schema", {
        p_table_name: tableName,
      })

      if (!rpcError && rpcData) {
        console.log("Schema fetched successfully via RPC")
        return NextResponse.json({ schema: rpcData })
      }

      console.log("RPC with anon key failed:", rpcError?.message)
    } catch (rpcErr) {
      console.log("RPC call exception:", rpcErr)
    }

    // If that fails and we have a service role key, try with the admin client
    if (isSupabaseAdminConfigured()) {
      try {
        console.log("Trying RPC with service role key...")
        const { data: adminRpcData, error: adminRpcError } = await supabaseAdmin.rpc("get_table_schema", {
          p_table_name: tableName,
        })

        if (!adminRpcError && adminRpcData) {
          console.log("Schema fetched successfully via admin RPC")
          return NextResponse.json({ schema: adminRpcData })
        }

        console.log("RPC with service role key failed:", adminRpcError?.message)
      } catch (adminRpcErr) {
        console.log("Admin RPC call exception:", adminRpcErr)
      }
    }

    // If both RPC methods fail, fall back to a direct query
    console.log("Falling back to direct query...")

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
    console.error(`Error in schema route:`, error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

