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
    // SQL to create the get_tables function
    const createGetTablesSQL = `
      -- Drop existing function if it exists
      DROP FUNCTION IF EXISTS get_tables();
      
      -- Create function to get all tables
      CREATE OR REPLACE FUNCTION get_tables()
      RETURNS TABLE (tablename text) AS $$
      BEGIN
        RETURN QUERY
        SELECT table_name::text
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
      END;
      $$ LANGUAGE plpgsql;
    `

    // SQL to create the get_table_schema function
    const createGetTableSchemaSQL = `
      -- Drop existing function if it exists
      DROP FUNCTION IF EXISTS get_table_schema(text);
      
      -- Create function to get table schema
      CREATE OR REPLACE FUNCTION get_table_schema(p_table_name text)
      RETURNS TABLE (
        column_name text,
        data_type text,
        is_nullable boolean,
        column_default text
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          c.column_name::text,
          c.data_type::text,
          (c.is_nullable = 'YES')::boolean,
          c.column_default::text
        FROM 
          information_schema.columns c
        WHERE 
          c.table_schema = 'public' 
          AND c.table_name = p_table_name;
      END;
      $$ LANGUAGE plpgsql;
    `

    // Execute the SQL to create the functions
    const { error: getTablesError } = await supabase.rpc("pgclient_exec", {
      query: createGetTablesSQL,
    })

    const { error: getTableSchemaError } = await supabase.rpc("pgclient_exec", {
      query: createGetTableSchemaSQL,
    })

    if (getTablesError || getTableSchemaError) {
      return NextResponse.json({
        success: false,
        errors: {
          getTablesError: getTablesError?.message,
          getTableSchemaError: getTableSchemaError?.message,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "SQL functions created successfully",
    })
  } catch (error: any) {
    console.error("Error creating SQL functions:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 },
    )
  }
}

