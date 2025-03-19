"use client"

import { useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export default function CreateQueryFunction() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<string | null>(null)

  async function createFunction() {
    if (!isSupabaseConfigured()) {
      setStatus("error")
      setResult("Supabase is not configured. Please add the required environment variables.")
      return
    }

    setStatus("loading")
    setResult(null)

    try {
      // SQL to create the pgclient_query function
      const sql = `
        -- Create a function to execute arbitrary SQL queries
        CREATE OR REPLACE FUNCTION pgclient_query(query text)
        RETURNS JSONB AS $$
        DECLARE
          result JSONB;
        BEGIN
          EXECUTE query INTO result;
          RETURN result;
        EXCEPTION WHEN OTHERS THEN
          RAISE EXCEPTION 'Error executing query: %', SQLERRM;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Grant execute permissions
        GRANT EXECUTE ON FUNCTION pgclient_query(text) TO anon, authenticated;
      `

      // Execute the SQL directly
      const { error } = await supabase.rpc("pgclient_exec", { query: sql })

      if (error) {
        console.error("Error creating function:", error)
        setStatus("error")
        setResult(`Error creating function: ${error.message}`)

        // If pgclient_exec doesn't exist, show instructions
        if (error.message.includes("pgclient_exec")) {
          setResult(`
The pgclient_exec function doesn't exist. Please create the pgclient_query function manually:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the following SQL:

-- Create a function to execute arbitrary SQL queries
CREATE OR REPLACE FUNCTION pgclient_query(query text)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error executing query: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION pgclient_query(text) TO anon, authenticated;

5. Click "Run" to execute the SQL
          `)
        }
        return
      }

      // Test if the function was created successfully
      const { data, error: testError } = await supabase.rpc("pgclient_query", {
        query: "SELECT 1 as test",
      })

      if (testError) {
        setStatus("error")
        setResult(`Function was created but test failed: ${testError.message}`)
        return
      }

      setStatus("success")
      setResult("The pgclient_query function was created successfully!")
    } catch (error: any) {
      console.error("Error:", error)
      setStatus("error")
      setResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create SQL Query Function</h2>
      <p className="mb-4 text-gray-600">
        This will create the <code className="bg-gray-100 px-2 py-1 rounded">pgclient_query</code> function in your
        Supabase database, which is needed for better table detection.
      </p>

      <button
        onClick={createFunction}
        disabled={status === "loading"}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {status === "loading" ? "Creating Function..." : "Create SQL Query Function"}
      </button>

      {result && (
        <div
          className={`mt-4 p-3 rounded ${
            status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          <pre className="whitespace-pre-wrap text-sm overflow-auto">{result}</pre>
        </div>
      )}

      <div className="mt-4 bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">What This Does:</h3>
        <p className="text-sm text-gray-600 mb-2">
          This creates a PostgreSQL function that allows executing SQL queries from the application. It's used to:
        </p>
        <ul className="list-disc pl-6 text-sm text-gray-600">
          <li>List all tables in your database</li>
          <li>Get schema information for tables</li>
          <li>Execute other database metadata queries</li>
        </ul>
      </div>
    </div>
  )
}

