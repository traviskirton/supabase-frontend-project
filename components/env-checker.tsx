"use client"

import { useEffect, useState } from "react"

export default function EnvChecker() {
  const [clientEnv, setClientEnv] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get all client-side environment variables (those with NEXT_PUBLIC prefix)
    const env: Record<string, string> = {}

    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      Object.keys(process.env).forEach((key) => {
        if (key.startsWith("NEXT_PUBLIC_")) {
          // Mask the values for security
          const value = process.env[key] || ""
          env[key] =
            value.length > 0
              ? value.substring(0, 3) + "..." + (value.length > 6 ? value.substring(value.length - 3) : "")
              : "Not set"
        }
      })

      setClientEnv(env)
    }
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Client-Side Environment Variables</h2>

      {Object.keys(clientEnv).length > 0 ? (
        <div className="bg-gray-50 p-4 rounded overflow-auto">
          <pre>{JSON.stringify(clientEnv, null, 2)}</pre>
        </div>
      ) : (
        <p className="text-gray-500">No client-side environment variables found.</p>
      )}

      <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded">
        <p className="font-semibold">Note:</p>
        <p>Client-side environment variables must be prefixed with NEXT_PUBLIC_ to be accessible in the browser.</p>
      </div>
    </div>
  )
}

