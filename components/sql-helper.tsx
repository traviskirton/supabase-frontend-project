"use client"

import { useState } from "react"
import { isSupabaseAdminConfigured } from "@/lib/supabase"

export default function SqlHelper() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<string | null>(null)
  const [sqlType, setSqlType] = useState<"functions" | "list-tables">("functions")
  const adminConfigured = isSupabaseAdminConfigured()

  async function showInstructions() {
    setStatus("loading")

    setTimeout(() => {
      setStatus("success")

      if (sqlType === "functions") {
        setResult(`
To create the required SQL functions, please follow these steps:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the following SQL:

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

5. Click "Run" to execute the SQL
6. Refresh this page to see if the functions are now available
        `)
      } else if (sqlType === "list-tables") {
        setResult(`
To list all tables in your Supabase database, please follow these steps:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the following SQL:

-- List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

5. Click "Run" to execute the SQL
6. You should see a list of all tables in your database
        `)
      }
    }, 500)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">SQL Helper</h2>
      <p className="mb-4 text-gray-600">Use these SQL snippets to help manage your Supabase database.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select SQL Type:</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setSqlType("functions")}
            className={`px-4 py-2 rounded-md ${
              sqlType === "functions" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Create SQL Functions
          </button>
          <button
            onClick={() => setSqlType("list-tables")}
            className={`px-4 py-2 rounded-md ${
              sqlType === "list-tables" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            List All Tables
          </button>
        </div>
      </div>

      <button
        onClick={showInstructions}
        disabled={status === "loading"}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {status === "loading"
          ? "Loading Instructions..."
          : `Show ${sqlType === "functions" ? "SQL Function" : "List Tables"} Instructions`}
      </button>

      {result && (
        <div className="mt-4 p-3 rounded bg-green-50 text-green-800">
          <pre className="whitespace-pre-wrap text-sm overflow-auto">{result}</pre>
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

      {!adminConfigured && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-700">
            For full functionality, add the{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> environment variable.
          </p>
        </div>
      )}
    </div>
  )
}

