"use client"

import { useState, useEffect } from "react"

export default function DebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        const response = await fetch("/api/diagnose")
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }
        const data = await response.json()
        setDiagnostics(data.diagnostics)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDiagnostics()
  }, [])

  if (loading) return <div className="p-8">Loading diagnostics...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Diagnostics</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(diagnostics?.environment, null, 2)}</pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Supabase Configuration</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(diagnostics?.supabase, null, 2)}</pre>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Verify that your Supabase URL and anon key are correctly set in Vercel environment variables</li>
          <li>Check that your Supabase project is active and not in maintenance mode</li>
          <li>Ensure your Supabase project allows requests from your Vercel deployment domain</li>
          <li>Try recreating the SQL functions in your Supabase database</li>
          <li>Check Vercel logs for any additional error information</li>
        </ol>
      </div>
    </div>
  )
}

