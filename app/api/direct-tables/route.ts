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

    // Try to get a list of tables by querying each potential table
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

    const existingTables = []

    // Check each table to see if it exists
    for (const tableName of commonTables) {
      try {
        const { error } = await client.from(tableName).select("count").limit(1)

        // If no error, the table exists
        if (!error) {
          existingTables.push(tableName)
        }
      } catch (err) {
        // Ignore errors for tables that don't exist
        continue
      }
    }

    return NextResponse.json({
      tables: existingTables,
      method: "common_tables_check",
      note:
        existingTables.length === 0
          ? "No tables found. You may need to create tables in your database."
          : `Found ${existingTables.length} tables by checking common table names.`,
    })
  } catch (error: any) {
    console.error("Error listing tables:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

