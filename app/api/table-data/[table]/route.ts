import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { table: string } }) {
  const tableName = params.table

  try {
    // Fetch data from the specified table
    const { data, error } = await supabase.from(tableName).select("*").limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

