import { getSupabaseConfig, isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/supabase"
import TableList from "@/components/table-list"
import Link from "next/link"

export default function Home() {
  const supabaseConfigured = isSupabaseConfigured()
  const supabaseAdminConfigured = isSupabaseAdminConfigured()
  const supabaseConfig = getSupabaseConfig()

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Supabase Data Explorer</h1>

      {!supabaseConfigured ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Missing Supabase Configuration</h2>
          <p className="mb-4">
            The Supabase environment variables are not configured. Please add the following environment variables to
            your Vercel project:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project
              URL
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase
              anonymous key
            </li>
          </ul>
          <p className="mb-4">You can find these values in your Supabase dashboard under Project Settings &gt; API.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-yellow-700 mb-2">Configuration Status:</h3>
            <ul className="list-disc pl-6">
              <li>URL defined: {supabaseConfig.urlDefined ? "Yes" : "No"}</li>
              <li>Anon Key defined: {supabaseConfig.keyDefined ? "Yes" : "No"}</li>
              <li>Service Role Key defined: {supabaseConfig.serviceKeyDefined ? "Yes" : "No"}</li>
              <li>URL prefix: {supabaseConfig.urlPrefix}</li>
              <li>Anon Key prefix: {supabaseConfig.keyPrefix}</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/debug" className="text-blue-600 hover:underline">
              View Diagnostic Information
            </Link>
            <Link href="/api/verify-env" className="text-blue-600 hover:underline" target="_blank">
              Verify Environment Variables
            </Link>
            <Link href="/api/test-connection" className="text-blue-600 hover:underline" target="_blank">
              Test Supabase Connection
            </Link>
          </div>
        </div>
      ) : (
        <>
          {!supabaseAdminConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <h2 className="text-lg font-semibold text-yellow-700 mb-2">Service Role Key Not Configured</h2>
              <p className="mb-2">
                For full functionality, consider adding the Supabase Service Role Key as an environment variable:
              </p>
              <ul className="list-disc pl-6 mb-2">
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> - Your Supabase
                  service role key
                </li>
              </ul>
              <p className="text-sm text-yellow-600">
                Note: The service role key has admin privileges. Keep it secure and never expose it to the client.
              </p>
            </div>
          )}
          <TableList />
        </>
      )}
    </main>
  )
}

