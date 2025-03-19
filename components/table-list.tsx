"use client"

import { useState, useEffect } from "react"
import { isSupabaseConfigured } from "@/lib/supabase-client"
import TableData from "./table-data"
import { getEnv } from "@/lib/env"

export default function TableList() {
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  // Direct environment variable check
  const directUrlCheck = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const directKeyCheck = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  useEffect(() => {
    async function fetchTables() {
      // Check if Supabase is configured before making the request
      if (!isSupabaseConfigured()) {
        setError(`Supabase is not configured. Please add the required environment variables.
                 Direct URL check: ${directUrlCheck ? "Set" : "Not set"}
                 Direct Key check: ${directKeyCheck ? "Set" : "Not set"}`)
        setLoading(false)
        return
      }

      try {
        console.log("Fetching tables...")
        const response = await fetch("/api/tables")
        console.log("Response status:", response.status)

        // Check if response is OK before parsing JSON
        if (!response.ok) {
          const text = await response.text()
          console.error("Error response:", text)
          setError(`API error: ${response.status}`)
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log("Tables data:", data)

        if (data.error) {
          setError(data.error)
        } else {
          setTables(data.tables || [])
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setError("Failed to fetch tables")
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [directUrlCheck, directKeyCheck])

  if (loading) return <div>Loading tables...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (tables.length === 0) return <div>No tables found in your database.</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Tables</h2>
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

