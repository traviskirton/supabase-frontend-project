import { supabase } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { table: string } }) {
  const tableName = params.table

  try {
    // This query gets the column information for the specified table
    const { data, error } = await supabase.rpc("get_table_schema", {
      p_table_name: tableName,
    })

    if (error) {
      console.error(`Error fetching schema for ${tableName}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ schema: data || [] })
  } catch (error: any) {
    console.error(`Error in schema route:`, error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

