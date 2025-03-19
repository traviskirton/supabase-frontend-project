import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Direct SQL query approach
    const { data, error } = await supabase.rpc("get_tables")

    if (error) {
      console.error("Error fetching tables:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tables: data || [] })
  } catch (error: any) {
    console.error("Error in /api/tables route:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

