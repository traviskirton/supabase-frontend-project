import { getTableNames } from "@/lib/get-tables"

export default async function TablesPage() {
  // When used in a server component, this can use the service role key
  const tables = await getTableNames()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Database Tables</h1>

      {tables.length === 0 ? (
        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Tables Found</h2>
          <p className="text-yellow-700">
            Your database doesn't have any tables yet. Create some tables in your Supabase dashboard.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-medium">Found {tables.length} tables</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {tables.map((table) => (
              <li key={table} className="p-4 hover:bg-gray-50">
                {table}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

