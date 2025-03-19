import { supabase, supabaseAdmin, isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase is not configured. Please add the required environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    console.log("Attempting to fetch tables...")

    // First try using the RPC function with the regular client
    try {
      console.log("Trying RPC with anon key...")
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_tables")

      if (!rpcError && rpcData) {
        console.log("Tables fetched successfully via RPC")
        return NextResponse.json({ tables: rpcData })
      }

      console.log("RPC with anon key failed:", rpcError?.message)
    } catch (rpcErr) {
      console.log("RPC call exception:", rpcErr)
    }

    // If that fails and we have a service role key, try with the admin client
    if (isSupabaseAdminConfigured()) {
      try {
        console.log("Trying RPC with service role key...")
        const { data: adminRpcData, error: adminRpcError } = await supabaseAdmin.rpc("get_tables")

        if (!adminRpcError && adminRpcData) {
          console.log("Tables fetched successfully via admin RPC")
          return NextResponse.json({ tables: adminRpcData })
        }

        console.log("RPC with service role key failed:", adminRpcError?.message)
      } catch (adminRpcErr) {
        console.log("Admin RPC call exception:", adminRpcErr)
      }
    }

    // If both RPC methods fail, return a response indicating to try the list-tables endpoint
    console.log("RPC methods failed, suggesting list-tables endpoint...")

    return NextResponse.json({
      useFallback: true,
      fallbackEndpoint: "/api/list-tables",
      message: "RPC methods failed, try using the list-tables endpoint",
    })
  } catch (error: any) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

