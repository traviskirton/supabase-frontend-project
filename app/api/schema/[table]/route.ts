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

    // If both RPC methods fail, fall back to querying information_schema directly
    console.log("Falling back to information_schema query...")

    const client = isSupabaseAdminConfigured() ? supabaseAdmin : supabase
    const { data: fallbackData, error: fallbackError } = await client
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_schema", "public")
      .eq("table_name", tableName)

    if (fallbackError) {
      console.error("Fallback query error:", fallbackError)
      return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const schema = fallbackData.map((col) => ({
      column_name: col.column_name,
      data_type: col.data_type,
      is_nullable: col.is_nullable === "YES",
      column_default: col.column_default,
    }))

    console.log("Schema fetched successfully via fallback method")
    return NextResponse.json({ schema })
  } catch (error: any) {
    console.error(`Error in schema route:`, error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

