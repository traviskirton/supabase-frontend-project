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

    // Try multiple SQL queries to get tables
    const queries = [
      // Query 1: Standard PostgreSQL catalog query
      `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename;`,

      // Query 2: Information schema query
      `SELECT table_name as tablename FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
       ORDER BY table_name;`,

      // Query 3: Alternative using pg_class
      `SELECT relname as tablename FROM pg_class 
       WHERE relkind = 'r' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') 
       ORDER BY relname;`,
    ]

    let tables = []
    let queryUsed = ""

    // Try each query until one works
    for (const query of queries) {
      try {
        console.log("Trying SQL query:", query)
        const { data, error } = await client.rpc("pgclient_query", { query })

        if (!error && data && data.length > 0) {
          console.log("Query successful, found tables:", data)
          tables = data.map((row: any) => row.tablename)
          queryUsed = query
          break
        } else if (error) {
          console.error("SQL query error:", error)
        }
      } catch (queryError) {
        console.error("Error executing query:", queryError)
      }
    }

    // If no tables found with RPC, try a different approach
    if (tables.length === 0) {
      console.log("Trying alternative approach to find tables...")

      // Try to query a few system tables to see what's accessible
      try {
        const { data: pgStatActivity } = await client.from("pg_stat_activity").select("count").limit(1)
        if (pgStatActivity) {
          console.log("Can access pg_stat_activity")
        }
      } catch (e) {
        console.log("Cannot access pg_stat_activity")
      }

      // Try to list all schemas
      try {
        const { data: schemas } = await client.rpc("pgclient_query", {
          query: `SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';`,
        })
        if (schemas) {
          console.log("Available schemas:", schemas)
        }
      } catch (e) {
        console.log("Cannot list schemas")
      }

      // Try to create a temporary function to list tables
      try {
        const createFunctionQuery = `
          CREATE OR REPLACE FUNCTION temp_list_tables() 
          RETURNS TABLE (tablename text) AS $$
          BEGIN
            RETURN QUERY SELECT table_name::text FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
          END;
          $$ LANGUAGE plpgsql;
        `

        const { error: createError } = await client.rpc("pgclient_query", { query: createFunctionQuery })

        if (!createError) {
          const { data: funcResult } = await client.rpc("temp_list_tables")
          if (funcResult) {
            tables = funcResult
            console.log("Found tables using temporary function:", tables)
          }
        }
      } catch (funcError) {
        console.error("Error with temporary function:", funcError)
      }
    }

    return NextResponse.json({
      tables,
      queryUsed: queryUsed || "Alternative methods",
      note:
        tables.length === 0
          ? "No tables found. You may need to create tables in your database."
          : `Found ${tables.length} tables in your database.`,
    })
  } catch (error: any) {
    console.error("Error with direct SQL query:", error)
    return NextResponse.json({
      tables: [],
      error: error.message,
      note: "Could not query tables directly. Try creating some tables in your database.",
    })
  }
}

