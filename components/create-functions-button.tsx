"use client"

import { useState } from "react"

export default function CreateFunctionsButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)

  async function createFunctions() {
    setStatus("loading")
    try {
      const response = await fetch("/api/create-functions", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setResult(data.message)
      } else {
        setStatus("error")
        setResult(data.error || "Failed to create functions")
      }
    } catch (error: any) {
      setStatus("error")
      setResult(error.message)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create SQL Functions</h2>
      <p className="mb-4 text-gray-600">
        If you're seeing errors about missing functions, click the button below to create the required SQL functions in
        your Supabase database:
      </p>

      <button
        onClick={createFunctions}
        disabled={status === "loading"}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {status === "loading" ? "Creating Functions..." : "Create SQL Functions"}
      </button>

      {result && (
        <div
          className={`mt-4 p-3 rounded ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {result}
        </div>
      )}
    </div>
  )
}

