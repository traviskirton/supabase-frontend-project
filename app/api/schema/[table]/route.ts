import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { table: string } }) {
  const tableName = params.table

  try {
    // This query gets the column information for the specified table
    const { data, error } = await supabase.rpc("get_table_schema", {
      table_name: tableName,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ schema: data })
  } catch (error) {
    console.error(`Error fetching schema for ${tableName}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

