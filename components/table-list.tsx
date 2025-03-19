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
  const [guide, setGuide] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

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

        // Try all endpoints in order of preference
        const endpoints = [
          "/api/all-tables", // Comprehensive approach
          "/api/tables", // RPC function
          "/api/direct-tables", // Direct SQL query
          "/api/list-tables", // Check common tables
        ]

        let tablesData = null
        let noteText = null
        const debugData = []

        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}...`)
            const response = await fetch(endpoint)

            if (response.ok) {
              const result = await response.json()

              // Add to debug info
              debugData.push({
                endpoint,
                status: response.status,
                tables: result.tables ? result.tables.length : 0,
                note: result.note,
                error: result.error,
              })

              // Check if we need to use a fallback endpoint
              if (result.useFallback && result.fallbackEndpoint) {
                console.log(`Endpoint ${endpoint} suggests using ${result.fallbackEndpoint}`)
                continue // Skip to the next endpoint
              }

              if (!result.error && result.tables) {
                console.log(`Tables data from ${endpoint}:`, result)

                // If we already have tables but this endpoint found more, use this one instead
                if (!tablesData || result.tables.length > tablesData.length) {
                  tablesData = result.tables
                  if (result.note) {
                    noteText = result.note
                  }

                  // If we found a good number of tables, we can stop
                  if (result.tables.length >= 5) {
                    console.log(`Found ${result.tables.length} tables, stopping search`)
                    break
                  }
                }
              }
            } else {
              debugData.push({
                endpoint,
                status: response.status,
                error: "API error",
              })
            }
          } catch (err) {
            console.error(`Error with endpoint ${endpoint}:`, err)
            debugData.push({
              endpoint,
              error: "Fetch error",
            })
            // Continue to the next endpoint
          }
        }

        setDebugInfo(JSON.stringify(debugData, null, 2))

        if (tablesData) {
          setTables(tablesData)
          if (noteText) {
            setNote(noteText)
          }
        } else {
          setError("Failed to fetch tables using all available methods")
        }

        // If we have no tables, fetch the guide
        if (!tablesData || tablesData.length === 0) {
          try {
            const guideResponse = await fetch("/api/create-table-guide")
            if (guideResponse.ok) {
              const guideData = await guideResponse.json()
              setGuide(guideData.guide)
            }
          } catch (guideErr) {
            console.error("Error fetching guide:", guideErr)
          }
        }
      } catch (err: any) {
        console.error("Overall fetch error:", err)
        setError(`Failed to fetch tables: ${err.message}`)
      } finally {
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
            <div className="mt-4">
              <details>
                <summary className="cursor-pointer text-red-800 font-medium">Debug Information</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">{debugInfo}</pre>
              </details>
            </div>
          )}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Troubleshooting</h3>
          <ul className="list-disc pl-5 text-yellow-700 space-y-2">
            <li>Make sure your Supabase project is active and accessible</li>
            <li>Check that your environment variables are correctly set</li>
            <li>
              Try creating the SQL functions using the{" "}
              <Link href="/debug" className="text-blue-600 underline">
                debug page
              </Link>
            </li>
            <li>Create some tables in your Supabase database if none exist</li>
          </ul>
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

          {debugInfo && (
            <div className="mt-4">
              <details>
                <summary className="cursor-pointer text-yellow-800 font-medium">Debug Information</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">{debugInfo}</pre>
              </details>
            </div>
          )}
        </div>

        {guide && (
          <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">{guide.title}</h3>

            {guide.steps.map((step: any, index: number) => (
              <div key={index} className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">{step.title}</h4>
                <ol className="list-decimal pl-5 text-gray-600 space-y-1">
                  {step.instructions.map((instruction: string, i: number) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>
            ))}

            <h4 className="font-medium text-gray-700 mb-2">Sample Tables</h4>
            <div className="space-y-4">
              {guide.sampleTables.map((table: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-gray-700 mb-1">{table.name}</h5>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{table.sql}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Next Steps</h3>
          <p className="text-blue-700 mb-2">After creating tables in your Supabase database:</p>
          <ol className="list-decimal pl-5 text-blue-700 space-y-2">
            <li>Return to this page to view your tables</li>
            <li>
              Create the SQL functions using the{" "}
              <Link href="/debug" className="text-blue-600 underline">
                debug page
              </Link>{" "}
              for better functionality
            </li>
            <li>Add some data to your tables using the Supabase dashboard or API</li>
          </ol>
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

        {debugInfo && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details>
              <summary className="cursor-pointer text-gray-600 text-sm font-medium">Debug Information</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">{debugInfo}</pre>
            </details>
          </div>
        )}

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

