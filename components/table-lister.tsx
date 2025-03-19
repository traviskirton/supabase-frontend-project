"use client"

import { useState, useEffect } from "react"
import { getTableNames } from "@/lib/get-tables"

export default function TableLister() {
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchTables() {
    setLoading(true)
    setError(null)

    try {
      // Note: When using client-side, this will use the NEXT_PUBLIC_SUPABASE_ANON_KEY
      // The service role key should never be exposed to the client
      const tableNames = await getTableNames()
      setTables(tableNames)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Alternative approach using the API endpoint
  async function fetchTablesFromApi() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/list-all-tables")

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Unknown error")
      }

      setTables(data.tables)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Use the API endpoint approach by default
    // This is better because it can use the service role key securely
    fetchTablesFromApi()
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Database Tables</h2>
        <button
          onClick={fetchTablesFromApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">Error: {error}</div>}

      {tables.length === 0 && !loading && !error ? (
        <div className="p-4 text-center bg-gray-50 rounded">No tables found in your database.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {tables.map((table) => (
            <li key={table} className="py-2 px-1 hover:bg-gray-50">
              {table}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {tables.length > 0 && `Found ${tables.length} tables in your database.`}
      </div>
    </div>
  )
}

