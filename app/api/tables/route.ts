import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Fetching tables using RPC...")

    // Execute the RPC function to get tables
    const { data, error } = await supabase.rpc("get_tables")

    if (error) {
      console.error("Supabase RPC error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Tables data from RPC:", data)
    return NextResponse.json({ tables: data || [] })
  } catch (error: any) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

