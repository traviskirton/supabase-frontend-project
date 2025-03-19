"use client"

import { useState } from "react"

export default function CreateTablesFunction() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<string | null>(null)
  const [sqlCode, setSqlCode] = useState<string>(`
-- Create a function to get all actual tables in the database
CREATE OR REPLACE FUNCTION get_actual_tables()
RETURNS SETOF text AS $$
BEGIN
  RETURN QUERY
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  ORDER BY table_name;
END;
$$ LANGUAGE plpgsql;
  `)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Table Listing Function</h2>
      <p className="mb-4 text-gray-600">
        To get accurate table listings, create this function in your Supabase database:
      </p>

      <div className="bg-gray-50 p-4 rounded mb-4">
        <h3 className="font-semibold mb-2">SQL to Create Table Listing Function</h3>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">{sqlCode}</pre>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">To create this function:</p>
        <ol className="list-decimal pl-6 space-y-1 text-gray-600">
          <li>Log in to your Supabase dashboard</li>
          <li>Go to the SQL Editor</li>
          <li>Create a new query</li>
          <li>Copy and paste the SQL above</li>
          <li>Click "Run" to execute the SQL</li>
          <li>Return to this page and refresh</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Why This Works</h3>
        <p className="text-blue-700">
          This function directly queries the PostgreSQL system catalogs to get the exact list of tables in your
          database's public schema. It will only return actual tables, not views or other database objects.
        </p>
      </div>
    </div>
  )
}

