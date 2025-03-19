export async function getTableNames(supabaseUrl?: string, apiKey?: string): Promise<string[]> {
  // Use provided values or environment variables
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prioritize service role key if available
  const key = apiKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("Missing Supabase credentials")
    throw new Error("Missing Supabase credentials. Please check your environment variables.")
  }

  try {
    console.log(`Fetching tables from ${url.substring(0, 15)}...`)

    // Make a direct request to the Supabase REST API
    const response = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error (${response.status}):`, errorText)
      throw new Error(`Supabase API error: ${response.status} - ${errorText || "No error details available"}`)
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError)
      throw new Error("Failed to parse response from Supabase. The response was not valid JSON.")
    }

    if (!data || typeof data !== "object") {
      console.error("Invalid response data:", data)
      throw new Error("Invalid response from Supabase. Expected an object.")
    }

    // The response contains the available tables as keys
    // Filter out system tables and other non-table entries
    const tables = Object.keys(data)
      .filter(
        (table) =>
          // Filter out system tables and metadata
          !table.startsWith("pg_") &&
          !table.startsWith("_") &&
          !table.startsWith("auth_") &&
          !table.startsWith("supabase_") &&
          !table.startsWith("storage_") &&
          table !== "schema" &&
          table !== "extensions" &&
          table !== "buckets" &&
          table !== "objects" &&
          table !== "policies",
      )
      .sort()

    console.log(`Found ${tables.length} tables`)
    return tables
  } catch (error: any) {
    // Ensure we have a proper error message
    const errorMessage = error?.message || "Unknown error occurred while fetching tables"
    console.error("Error fetching tables:", errorMessage, error)
    throw error // Re-throw to let the caller handle it
  }
}

