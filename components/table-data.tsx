"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface TableDataProps {
  tableName: string
}

export default function TableData({ tableName }: TableDataProps) {
  const [data, setData] = useState<any[]>([])
  const [schema, setSchema] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        console.log(`Fetching data for table: ${tableName}`)

        // Fetch table data
        const dataResponse = await fetch(`/api/table-data/${tableName}`)

        if (!dataResponse.ok) {
          const errorText = await dataResponse.text()
          console.error("Data response error:", errorText)
          setError(`Failed to fetch data: ${dataResponse.status}`)
          setLoading(false)
          return
        }

        const dataResult = await dataResponse.json()

        if (dataResult.error) {
          setError(dataResult.error)
          setLoading(false)
          return
        }

        // Try the schema endpoints in order of preference
        const schemaEndpoints = [
          `/api/schema/${tableName}`, // RPC function
          `/api/simple-schema/${tableName}`, // Simple query
        ]

        let schemaResult = null
        let lastSchemaError = null

        for (const endpoint of schemaEndpoints) {
          try {
            console.log(`Trying schema endpoint: ${endpoint}...`)
            const response = await fetch(endpoint)

            if (response.ok) {
              const result = await response.json()
              if (!result.error) {
                schemaResult = result
                break
              }
              lastSchemaError = result.error
            } else {
              const text = await response.text()
              console.error(`Error from ${endpoint}:`, text)
              lastSchemaError = `API error: ${response.status}`
            }
          } catch (err) {
            console.error(`Fetch error for ${endpoint}:`, err)
            lastSchemaError = "Failed to fetch schema"
          }
        }

        if (!schemaResult) {
          console.error("All schema endpoints failed:", lastSchemaError)
          // Continue with data only
        }

        setData(dataResult.data || [])
        if (schemaResult) {
          setSchema(schemaResult.schema || [])
        }
      } catch (err) {
        console.error("Error fetching table data:", err)
        setError("Failed to fetch table data")
      } finally {
        setLoading(false)
      }
    }

    if (tableName) {
      fetchData()
    }
  }, [tableName])

  if (loading) return <div className="p-4">Loading data...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (data.length === 0) return <div className="p-4">No data found in this table.</div>

  // Get column names from the first data item or schema
  const columns = schema.length > 0 ? schema.map((col) => col.column_name) : Object.keys(data[0] || {})

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">{tableName}</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 text-left border-b">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column}`} className="px-4 py-2 border-b">
                  {renderCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Helper function to render different types of cell values
function renderCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">null</span>
  }

  if (typeof value === "object") {
    return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false"
  }

  return String(value)
}

