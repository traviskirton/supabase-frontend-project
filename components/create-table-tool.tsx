"use client"

import { useState } from "react"
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase"

export default function CreateTableTool() {
  const [tableName, setTableName] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<string | null>(null)
  const adminConfigured = isSupabaseAdminConfigured()

  async function createTable() {
    if (!tableName) {
      setStatus("error")
      setResult("Please enter a table name")
      return
    }

    if (!adminConfigured) {
      setStatus("error")
      setResult("The SUPABASE_SERVICE_ROLE_KEY is required to create tables")
      return
    }

    setStatus("loading")
    setResult(null)

    try {
      // SQL to create a simple table
      const sql = `
        CREATE TABLE ${tableName} (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Add some sample data
        INSERT INTO ${tableName} (name, description) VALUES
          ('Sample Item 1', 'This is a description for item 1'),
          ('Sample Item 2', 'This is a description for item 2'),
          ('Sample Item 3', 'This is a description for item 3');
      `

      // Execute the SQL directly
      const { error } = await supabaseAdmin.rpc("pgclient_exec", { query: sql })

      if (error) {
        console.error("Error creating table:", error)

        if (error.message.includes("pgclient_exec")) {
          setStatus("error")
          setResult(`
The pgclient_exec function doesn't exist. Please create the table manually:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the following SQL:

CREATE TABLE ${tableName} (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add some sample data
INSERT INTO ${tableName} (name, description) VALUES
  ('Sample Item 1', 'This is a description for item 1'),
  ('Sample Item 2', 'This is a description for item 2'),
  ('Sample Item 3', 'This is a description for item 3');

5. Click "Run" to execute the SQL
          `)
          return
        }

        setStatus("error")
        setResult(`Error creating table: ${error.message}`)
        return
      }

      // Test if the table was created successfully
      const { data, error: testError } = await supabaseAdmin.from(tableName).select("*")

      if (testError) {
        setStatus("error")
        setResult(`Table was created but test failed: ${testError.message}`)
        return
      }

      setStatus("success")
      setResult(`The table "${tableName}" was created successfully with ${data.length} sample rows!`)
    } catch (error: any) {
      console.error("Error:", error)
      setStatus("error")
      setResult(`Error: ${error.message}`)
    }
  }

  if (!adminConfigured) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create a Sample Table</h2>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-800">
            The <code className="bg-yellow-100 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is required to
            create tables. Please add this environment variable to your project.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create a Sample Table</h2>
      <p className="mb-4 text-gray-600">
        This will create a sample table in your Supabase database with some test data.
      </p>

      <div className="mb-4">
        <label htmlFor="table-name" className="block text-sm font-medium text-gray-700 mb-1">
          Table Name
        </label>
        <input
          type="text"
          id="table-name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="e.g., products"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={createTable}
        disabled={status === "loading" || !tableName}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {status === "loading" ? "Creating Table..." : "Create Sample Table"}
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
        <p className="text-sm text-gray-600 mb-2">This creates a simple table with the following structure:</p>
        <ul className="list-disc pl-6 text-sm text-gray-600">
          <li>id (SERIAL PRIMARY KEY)</li>
          <li>name (TEXT)</li>
          <li>description (TEXT)</li>
          <li>created_at (TIMESTAMPTZ)</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">It also adds 3 sample rows to the table.</p>
      </div>
    </div>
  )
}

