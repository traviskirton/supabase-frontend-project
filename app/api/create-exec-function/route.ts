import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST() {
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
    // Try to create the pgclient_exec function using a direct SQL query
    const { error } = await supabase.from("_temp_create_function").select("*").limit(1)

    // If the table doesn't exist, we'll get an error, which is expected
    // Now try to create the function using a direct SQL statement

    // This is a workaround to execute SQL directly
    const functionSql = `
      -- Create a function to execute arbitrary SQL statements
      CREATE OR REPLACE FUNCTION pgclient_exec(query text)
      RETURNS void AS $$
      BEGIN
        EXECUTE query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Grant execute permissions
      GRANT EXECUTE ON FUNCTION pgclient_exec(text) TO anon, authenticated;
    `

    // We can't execute this directly, so we'll need to provide instructions
    return NextResponse.json({
      success: false,
      message: "Please create the pgclient_exec function manually using the SQL Editor in your Supabase dashboard.",
      sql: functionSql,
    })
  } catch (error: any) {
    console.error("Error creating exec function:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Error creating the pgclient_exec function.",
    })
  }
}

