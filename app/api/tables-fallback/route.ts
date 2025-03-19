import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase is not configured. Please add the required environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    console.log("Fetching tables using fallback method...")

    // Direct SQL query to get tables
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_type", "BASE TABLE")

    if (error) {
      console.error("Fallback query error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map the data to the expected format
    const tables = data.map((row) => row.table_name)

    console.log("Tables data from fallback:", tables)
    return NextResponse.json({ tables })
  } catch (error: any) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

