import Link from "next/link"
import ManualCredentials from "@/components/manual-credentials"
import EnvChecker from "@/components/env-checker"
import SqlHelper from "@/components/sql-helper"
import CreateTablesFunction from "@/components/create-tables-function"
import ManualTableCheck from "@/components/manual-table-check"
import TableInfo from "@/components/table-info"

export default function DebugPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <TableInfo />
      </div>
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Diagnostics</h1>

      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Back to Home
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Quick Start Guide</h2>
        <ol className="list-decimal pl-6 space-y-2 text-blue-700">
          <li>Make sure your Supabase URL and anon key are correctly set in Vercel environment variables</li>
          <li>
            Add the <code className="bg-blue-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> for full
            functionality
          </li>
          <li>Create the SQL function for table listing using the tool below</li>
          <li>Create some tables in your Supabase database if none exist</li>
          <li>Return to the main page to view your tables</li>
        </ol>
      </div>

      <div className="mb-8">
        <ManualTableCheck />
      </div>

      <div className="mb-8">
        <CreateTablesFunction />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Environment Variable Checks</h2>
          <div className="space-y-4">
            <Link
              href="/api/verify-env"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              target="_blank"
            >
              Verify Environment Variables
            </Link>
            <Link
              href="/api/test-connection"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              target="_blank"
            >
              Test Supabase Connection
            </Link>
            <Link
              href="/api/direct-sql-tables"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              target="_blank"
            >
              List Available Tables (Direct)
            </Link>
          </div>
        </div>

        <ManualCredentials />
      </div>

      <div className="mb-8">
        <EnvChecker />
      </div>

      <div className="mb-8">
        <SqlHelper />
      </div>

      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create Tables in Supabase</h2>
          <p className="mb-4 text-gray-600">
            To use this application, you need to have tables in your Supabase database. Here's a simple example to
            create a todos table:
          </p>

          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="font-semibold mb-2">SQL to Create a Todos Table</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add some sample data
INSERT INTO todos (title, completed) VALUES
  ('Learn Supabase', true),
  ('Build an app', false),
  ('Deploy to production', false);`}
            </pre>
          </div>

          <p className="text-gray-600 mb-4">To execute this SQL:</p>
          <ol className="list-decimal pl-6 space-y-1 text-gray-600 mb-4">
            <li>Log in to your Supabase dashboard</li>
            <li>Go to the SQL Editor</li>
            <li>Create a new query</li>
            <li>Copy and paste the SQL above</li>
            <li>Click "Run" to execute the SQL</li>
          </ol>

          <p className="text-gray-600">
            After creating tables, return to the{" "}
            <Link href="/" className="text-blue-600 hover:underline">
              main page
            </Link>{" "}
            to view them.
          </p>
        </div>
      </div>
    </div>
  )
}

