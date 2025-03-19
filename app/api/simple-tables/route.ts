import { supabase, supabaseAdmin, isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/supabase"
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
    // Use the admin client if available, otherwise use the regular client
    const client = isSupabaseAdminConfigured() ? supabaseAdmin : supabase

    // Try to get a list of tables by creating and querying a temporary table
    try {
      // First check if the temp table already exists
      const { error: checkError } = await client.from("temp_tables_check").select("id").limit(1)

      // If the table doesn't exist, create it
      if (checkError && checkError.message.includes("does not exist")) {
        const { error: createError } = await client.from("temp_tables_check").insert([{ id: 1 }])

        if (createError) {
          console.error("Failed to create temporary table:", createError)
          return NextResponse.json(
            {
              error: "Failed to create temporary table",
              details: createError.message,
            },
            { status: 500 },
          )
        }
      }

      // Query the temporary table to get metadata about all tables
      const { data, error } = await client.from("temp_tables_check").select()

      if (error) {
        console.error("Failed to query temporary table:", error)
        return NextResponse.json(
          {
            error: "Failed to query temporary table",
            details: error.message,
          },
          { status: 500 },
        )
      }

      // Extract table names from the response
      // The response will include all column names, which correspond to table names
      const tables = Object.keys(data[0] || {}).filter((name) => name !== "id")

      return NextResponse.json({ tables })
    } catch (error: any) {
      console.error("Error with temporary table approach:", error)

      // Fallback to a list of common table names
      return NextResponse.json({
        tables: ["users", "profiles", "auth", "todos", "items", "products", "orders", "posts", "comments"],
        note: "Using fallback list of common table names. Some may not exist in your database.",
      })
    }
  } catch (error: any) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

