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
    // Use the admin client if available, otherwise use the regular client
    const client = isSupabaseAdminConfigured() ? supabaseAdmin : supabase

    // Try to get a comprehensive list of all tables by querying the database metadata
    const allTables = new Set<string>()

    // Method 1: Try to query all tables directly
    try {
      // This query works in most PostgreSQL databases
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `

      const { data, error } = await client.rpc("pgclient_query", { query })

      if (!error && data) {
        data.forEach((row: any) => {
          if (row.table_name) allTables.add(row.table_name)
        })
      }
    } catch (e) {
      console.error("Method 1 failed:", e)
    }

    // Method 2: Try to query the PostgreSQL system catalogs
    try {
      const query = `
        SELECT relname AS table_name
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'r'
        AND n.nspname = 'public'
      `

      const { data, error } = await client.rpc("pgclient_query", { query })

      if (!error && data) {
        data.forEach((row: any) => {
          if (row.table_name) allTables.add(row.table_name)
        })
      }
    } catch (e) {
      console.error("Method 2 failed:", e)
    }

    // Method 3: Try to query the pg_tables view
    try {
      const query = `
        SELECT tablename AS table_name
        FROM pg_tables
        WHERE schemaname = 'public'
      `

      const { data, error } = await client.rpc("pgclient_query", { query })

      if (!error && data) {
        data.forEach((row: any) => {
          if (row.table_name) allTables.add(row.table_name)
        })
      }
    } catch (e) {
      console.error("Method 3 failed:", e)
    }

    // Method 4: Try to query each potential table directly
    // This is a fallback method that tries to access common table names
    const commonTables = [
      "users",
      "profiles",
      "auth",
      "todos",
      "items",
      "products",
      "orders",
      "posts",
      "comments",
      "categories",
      "tags",
      "settings",
      "customers",
      "employees",
      "projects",
      "tasks",
      "events",
      "messages",
      "notifications",
      "subscriptions",
      "payments",
      "invoices",
      "addresses",
      "contacts",
      "files",
      "images",
      "videos",
      "documents",
      "notes",
      // Add more potential table names here
      "accounts",
      "sessions",
      "transactions",
      "logs",
      "analytics",
      "metrics",
      "feedback",
      "reviews",
      "ratings",
      "favorites",
      "bookmarks",
      "likes",
      "followers",
      "friends",
      "groups",
      "teams",
      "roles",
      "permissions",
      "configurations",
      "preferences",
      "options",
      "stats",
      "data",
      "records",
      "entries",
      "articles",
      "blogs",
      "pages",
      "sections",
      "chapters",
      "books",
      "authors",
      "publishers",
      "editors",
      "contributors",
      "members",
      "subscribers",
      "visitors",
      "guests",
      "admins",
      "moderators",
      "staff",
    ]

    for (const tableName of commonTables) {
      try {
        const { error } = await client.from(tableName).select("count").limit(1)

        // If no error, the table exists
        if (!error) {
          allTables.add(tableName)
        }
      } catch (err) {
        // Ignore errors for tables that don't exist
        continue
      }
    }

    // Convert the Set to an array and sort
    const tables = Array.from(allTables).sort()

    return NextResponse.json({
      tables,
      note:
        tables.length === 0
          ? "No tables found. You may need to create tables in your database."
          : `Found ${tables.length} tables in your database.`,
      methodsUsed: "Multiple approaches combined",
    })
  } catch (error: any) {
    console.error("Error finding tables:", error)
    return NextResponse.json({
      tables: [],
      error: error.message,
      note: "Could not query tables. Try creating some tables in your database.",
    })
  }
}

