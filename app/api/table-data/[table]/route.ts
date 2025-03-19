import { supabase } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { table: string } }) {
  const tableName = params.table

  try {
    // Fetch data from the specified table
    const { data, error } = await supabase.from(tableName).select("*").limit(100)

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error(`Error in table-data route:`, error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

