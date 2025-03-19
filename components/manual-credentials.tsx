"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

export default function ManualCredentials() {
  const [url, setUrl] = useState("")
  const [key, setKey] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)

  async function testConnection() {
    if (!url || !key) {
      setStatus("error")
      setResult("Please enter both URL and key")
      return
    }

    setStatus("loading")
    try {
      // Create a temporary client
      const tempClient = createClient(url, key)

      // Test the connection
      const { data, error } = await tempClient.from("pg_stat_statements").select("query").limit(1).maybeSingle()

      if (error) {
        setStatus("error")
        setResult(error.message)
      } else {
        setStatus("success")
        setResult("Connection successful!")
      }
    } catch (error: any) {
      setStatus("error")
      setResult(error.message)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Manual Supabase Connection Test</h2>
      <p className="mb-4 text-gray-600">
        If the environment variables aren't working, you can test your Supabase connection manually:
      </p>

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
            Supabase Anon Key
          </label>
          <input
            type="text"
            id="supabase-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="your-anon-key"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={testConnection}
          disabled={status === "loading"}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {status === "loading" ? "Testing..." : "Test Connection"}
        </button>

        {result && (
          <div
            className={`mt-4 p-3 rounded ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
          >
            {result}
          </div>
        )}
      </div>
    </div>
  )
}

