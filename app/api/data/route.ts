import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Example query - replace 'your_table' with your actual table name
    const { data, error } = await supabase.from("your_table").select("*").limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

