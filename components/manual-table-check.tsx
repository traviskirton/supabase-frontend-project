"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

export default function ManualTableCheck() {
  const [url, setUrl] = useState("")
  const [key, setKey] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [tables, setTables] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function checkTables() {
    if (!url || !key) {
      setStatus("error")
      setError("Please enter both URL and key")
      return
    }

    setStatus("loading")
    setError(null)
    setTables([])

    try {
      // Create a temporary client
      const tempClient = createClient(url, key)

      // Try to get tables using the REST API
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // The response contains the available tables as keys
      const foundTables = Object.keys(data).filter(
        (table) =>
          // Filter out system tables
          !table.startsWith("pg_") && !table.startsWith("_") && table !== "schema" && !table.includes("auth"),
      )

      setTables(foundTables)
      setStatus("success")
    } catch (error: any) {
      setStatus("error")
      setError(error.message)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Manual Table Check</h2>
      <p className="mb-4 text-gray-600">Check which tables actually exist in your Supabase database:</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-700">
            Supabase URL
          </label>
          <input
            type="text"
            id="supabase-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project-id.supabase.co"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-700">
            Supabase Service Role Key (preferred) or Anon Key
          </label>
          <input
            type="text"
            id="supabase-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="your-key"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={checkTables}
          disabled={status === "loading"}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {status === "loading" ? "Checking..." : "Check Tables"}
        </button>

        {error && <div className="mt-4 p-3 bg-red-50 text-red-800 rounded">{error}</div>}

        {tables.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Found Tables ({tables.length}):</h3>
            <ul className="bg-gray-50 p-3 rounded list-disc pl-5">
              {tables.map((table) => (
                <li key={table}>{table}</li>
              ))}
            </ul>
          </div>
        )}

        {status === "success" && tables.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded">
            No tables found in your database. Try creating some tables first.
          </div>
        )}
      </div>
    </div>
  )
}

