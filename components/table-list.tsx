"use client"

import { useState, useEffect } from "react"
import { isSupabaseConfigured } from "@/lib/supabase"
import TableData from "./table-data"
import Link from "next/link"

export default function TableList() {
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [method, setMethod] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    async function fetchTables() {
      // Check if Supabase is configured before making the request
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured. Please add the required environment variables.")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching tables...")

        // Try the simple endpoint first
        try {
          console.log("Trying simple-tables endpoint...")
          const response = await fetch("/api/simple-tables")

          if (response.ok) {
            const result = await response.json()

            if (!result.success) {
              throw new Error(result.error || "API returned unsuccessful response")
            }

            console.log("Tables data from simple API:", result)
            setTables(result.tables || [])
            setNote(`Found ${result.tables.length} tables using simple API.`)
            setMethod("simple_api")
            setLoading(false)
            return
          } else {
            const errorText = await response.text()
            console.error("Simple API error:", errorText)
          }
        } catch (err: any) {
          console.error("Error with simple-tables endpoint:", err.message)
          // Continue to next approach
        }

        // Try the main endpoint next
        try {
          console.log("Trying list-all-tables endpoint...")
          const response = await fetch("/api/list-all-tables")

          if (response.ok) {
            const result = await response.json()

            if (!result.success) {
              throw new Error(result.error || "API returned unsuccessful response")
            }

            console.log("Tables data from main API:", result)
            setTables(result.tables || [])
            setNote(`Found ${result.tables.length} tables using main API.`)
            setMethod("main_api")
            setLoading(false)
            return
          } else {
            const errorData = await response.json().catch(() => null)
            console.error("Main API error:", errorData || response.statusText)
            setDebugInfo(errorData)
          }
        } catch (err: any) {
          console.error("Error with list-all-tables endpoint:", err.message)
          // Continue to fallback
        }

        // If both API approaches fail, throw an error
        throw new Error("Failed to fetch tables from both API endpoints")
      } catch (err: any) {
        console.error("Error fetching tables:", err)
        setError(`Failed to fetch tables: ${err.message}`)
        setDebugInfo(err)
        setLoading(false)
      }
    }

    fetchTables()
  }, [])

  if (loading) return <div className="p-4">Loading tables...</div>

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>

          {debugInfo && (
            <div className="mt-4 p-3 bg-red-100 rounded overflow-auto">
              <details>
                <summary className="cursor-pointer font-medium">Debug Information</summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Troubleshooting</h3>
          <ul className="list-disc pl-5 text-yellow-700 space-y-2">
            <li>Make sure your Supabase project is active and accessible</li>
            <li>Check that your environment variables are correctly set</li>
            <li>Add the SUPABASE_SERVICE_ROLE_KEY for better functionality</li>
            <li>
              Try the manual table check on the{" "}
              <Link href="/debug" className="text-blue-600 underline">
                debug page
              </Link>
            </li>
            <li>Create some tables in your Supabase database if none exist</li>
          </ul>
        </div>

        <div className="mt-4">
          <Link href="/debug" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Debug Page
          </Link>
        </div>
      </div>
    )
  }

  if (tables.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No Tables Found</h3>
          <p className="text-yellow-700">No tables were found in your database.</p>
          {note && <p className="text-yellow-700 mt-2">{note}</p>}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Next Steps</h3>
          <p className="text-blue-700 mb-2">
            To use this application, you need to create some tables in your Supabase database:
          </p>
          <ol className="list-decimal pl-5 text-blue-700 space-y-2">
            <li>Log in to your Supabase dashboard</li>
            <li>Go to the Table Editor or SQL Editor</li>
            <li>Create some tables with data</li>
            <li>Return to this page to view your tables</li>
          </ol>
          <Link href="/debug" className="text-blue-600 hover:underline block mt-4">
            Go to Debug Page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Tables ({tables.length})</h2>
        {note && <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">{note}</div>}

        <ul className="space-y-2">
          {tables.map((table) => (
            <li key={table}>
              <button
                onClick={() => setSelectedTable(table)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedTable === table ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                }`}
              >
                {table}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link href="/debug" className="text-blue-600 hover:underline text-sm">
            Troubleshoot Database Connection
          </Link>
        </div>
      </div>

      <div className="md:col-span-3">
        {selectedTable ? (
          <TableData tableName={selectedTable} />
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">Select a table to view its data</p>
          </div>
        )}
      </div>
    </div>
  )
}

