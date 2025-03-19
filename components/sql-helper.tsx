"use client"

import { useState } from "react"
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase"

export default function SqlHelper() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<string | null>(null)
  const adminConfigured = isSupabaseAdminConfigured()

  async function createFunctions() {
    if (!adminConfigured) {
      setStatus("error")
      setResult("Service Role Key is required to create SQL functions")
      return
    }

    setStatus("loading")
    try {
      // SQL to create the functions
      const sql = `
        -- Drop existing functions if they exist
        DROP FUNCTION IF EXISTS get_table_schema(text);
        DROP FUNCTION IF EXISTS get_tables();
        
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
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
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
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Grant execute permissions to anon and authenticated roles
        GRANT EXECUTE ON FUNCTION get_table_schema(text) TO anon, authenticated;
        GRANT EXECUTE ON FUNCTION get_tables() TO anon, authenticated;
      `

      // Execute the SQL
      const { error } = await supabaseAdmin.rpc("pgmoon.query", { query: sql })

      if (error) {
        setStatus("error")
        setResult(`Error creating functions: ${error.message}`)
      } else {
        setStatus("success")
        setResult("SQL functions created successfully!")
      }
    } catch (error: any) {
      setStatus("error")
      setResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create SQL Functions</h2>
      <p className="mb-4 text-gray-600">
        If you're seeing RPC errors, you may need to create the required SQL functions in your Supabase database.
      </p>

      {!adminConfigured ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
          <p className="text-yellow-700">
            You need to add the <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            environment variable to create SQL functions.
          </p>
        </div>
      ) : (
        <button
          onClick={createFunctions}
          disabled={status === "loading"}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {status === "loading" ? "Creating Functions..." : "Create SQL Functions"}
        </button>
      )}

      {result && (
        <div
          className={`mt-4 p-3 rounded ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {result}
        </div>
      )}

      <div className="mt-4 bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">SQL Functions Required:</h3>
        <ul className="list-disc pl-6">
          <li>
            <code className="bg-gray-100 px-2 py-1 rounded">get_tables()</code> - Returns a list of all tables
          </li>
          <li>
            <code className="bg-gray-100 px-2 py-1 rounded">get_table_schema(text)</code> - Returns schema information
            for a table
          </li>
        </ul>
      </div>
    </div>
  )
}

