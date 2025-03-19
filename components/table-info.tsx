"use client"

import { useState, useEffect } from "react"
import { getTableNames } from "@/lib/get-tables"

export default function TableInfo() {
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true)
        const tableNames = await getTableNames()
        setTables(tableNames)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Database Tables</h2>

      {loading ? (
        <div className="text-center p-4">Loading tables...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700">Error: {error}</div>
      ) : tables.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-yellow-700">
          No tables found in your database.
        </div>
      ) : (
        <div>
          <div className="mb-3 text-sm text-gray-500">Found {tables.length} tables:</div>
          <ul className="bg-gray-50 p-4 rounded divide-y divide-gray-200">
            {tables.map((table) => (
              <li key={table} className="py-2 first:pt-0 last:pb-0">
                {table}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

