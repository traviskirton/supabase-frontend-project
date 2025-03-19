import { supabaseAdmin, isSupabaseAdminConfigured, supabase, isSupabaseConfigured } from "@/lib/supabase"
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

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15)}...`
      : "Not set",
    anon_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    methods: {},
  }

  try {
    // Use the admin client if available
    const client = isSupabaseAdminConfigured() ? supabaseAdmin : supabase

    // Method 1: Try to directly query the database for tables using pg_tables
    if (isSupabaseAdminConfigured()) {
      try {
        const { data, error } = await client.from("pg_tables").select("tablename").eq("schemaname", "public")

        results.methods.pg_tables = {
          success: !error,
          error: error ? error.message : null,
          tables: data ? data.map((row) => row.tablename) : [],
          count: data ? data.length : 0,
        }
      } catch (e: any) {
        results.methods.pg_tables = {
          success: false,
          error: e.message,
          tables: [],
          count: 0,
        }
      }
    }

    // Method 2: Try information_schema.tables
    try {
      const { data, error } = await client
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .eq("table_type", "BASE TABLE")

      results.methods.information_schema = {
        success: !error,
        error: error ? error.message : null,
        tables: data ? data.map((row) => row.table_name) : [],
        count: data ? data.length : 0,
      }
    } catch (e: any) {
      results.methods.information_schema = {
        success: false,
        error: e.message,
        tables: [],
        count: 0,
      }
    }

    // Method 3: Try REST API
    try {
      // Headers for the request
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      // Use service role key if available, otherwise use anon key
      if (isSupabaseAdminConfigured()) {
        headers["apikey"] = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
        headers["Authorization"] = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`
      } else {
        headers["apikey"] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        const tables = Object.keys(data)

        results.methods.rest_api = {
          success: true,
          tables: tables,
          count: tables.length,
        }
      } else {
        results.methods.rest_api = {
          success: false,
          error: `Status ${response.status}: ${await response.text()}`,
          tables: [],
          count: 0,
        }
      }
    } catch (e: any) {
      results.methods.rest_api = {
        success: false,
        error: e.message,
        tables: [],
        count: 0,
      }
    }

    // Method 4: Try common tables
    const commonTables = [
      "users",
      "profiles",
      "todos",
      "items",
      "products",
      "orders",
      "posts",
      "comments",
      "categories",
      "tags",
      "settings",
    ]

    const verifiedTables = []

    for (const table of commonTables) {
      try {
        const { error } = await client.from(table).select("*").limit(1)
        if (!error) {
          verifiedTables.push(table)
        }
      } catch (e) {
        // Table doesn't exist or can't be queried
      }
    }

    results.methods.common_tables = {
      success: true,
      tables: verifiedTables,
      count: verifiedTables.length,
    }

    // Add recommendations
    results.recommendations = []

    if (!isSupabaseAdminConfigured()) {
      results.recommendations.push("Add the SUPABASE_SERVICE_ROLE_KEY environment variable for better table detection")
    }

    if (Object.values(results.methods).every((method: any) => method.count === 0)) {
      results.recommendations.push("Create some tables in your Supabase database")
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Error in diagnose-tables:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

