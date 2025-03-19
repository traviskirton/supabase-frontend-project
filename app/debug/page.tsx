import Link from "next/link"
import ManualCredentials from "@/components/manual-credentials"
import EnvChecker from "@/components/env-checker"
import SqlHelper from "@/components/sql-helper"

export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Diagnostics</h1>

      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Environment Variable Checks</h2>
          <div className="space-y-4">
            <Link
              href="/api/verify-env"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              target="_blank"
            >
              Verify Environment Variables
            </Link>
            <Link
              href="/api/test-connection"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              target="_blank"
            >
              Test Supabase Connection
            </Link>
            <Link
              href="/api/diagnose"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              target="_blank"
            >
              Run Full Diagnostics
            </Link>
          </div>
        </div>

        <ManualCredentials />
      </div>

      <div className="mb-8">
        <EnvChecker />
      </div>

      <div className="mb-8">
        <SqlHelper />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Verify that your Supabase URL and anon key are correctly set in Vercel environment variables</li>
          <li>
            Add the <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> environment
            variable for full functionality
          </li>
          <li>Use the "Create SQL Functions" tool above to create the required database functions</li>
          <li>Try redeploying your project after clearing the cache</li>
          <li>Check that your Supabase project is active and not in maintenance mode</li>
          <li>Ensure your Supabase project allows requests from your Vercel deployment domain</li>
        </ol>
      </div>
    </div>
  )
}

