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

        // Fetch table schema
        const schemaResponse = await fetch(`/api/schema/${tableName}`)

        if (!schemaResponse.ok) {
          const errorText = await schemaResponse.text()
          console.error("Schema response error:", errorText)
          setError(`Failed to fetch schema: ${schemaResponse.status}`)
          setLoading(false)
          return
        }

        const schemaResult = await schemaResponse.json()

        if (schemaResult.error) {
          setError(schemaResult.error)
          setLoading(false)
          return
        }

        setData(dataResult.data || [])
        setSchema(schemaResult.schema || [])
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

