import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    guide: {
      title: "How to Create Tables in Supabase",
      steps: [
        {
          title: "Using the Supabase Dashboard",
          instructions: [
            "Log in to your Supabase dashboard",
            "Go to the 'Table Editor' section",
            "Click 'New Table'",
            "Enter a name for your table",
            "Add columns with appropriate types",
            "Click 'Save' to create the table",
          ],
        },
        {
          title: "Using SQL",
          instructions: [
            "Log in to your Supabase dashboard",
            "Go to the 'SQL Editor' section",
            "Create a new query",
            "Enter SQL to create a table, for example:",
            "CREATE TABLE todos (id SERIAL PRIMARY KEY, title TEXT NOT NULL, completed BOOLEAN DEFAULT FALSE);",
            "Click 'Run' to execute the SQL",
          ],
        },
      ],
      sampleTables: [
        {
          name: "users",
          sql: "CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());",
        },
        {
          name: "todos",
          sql: "CREATE TABLE todos (id SERIAL PRIMARY KEY, title TEXT NOT NULL, completed BOOLEAN DEFAULT FALSE, user_id INTEGER REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT NOW());",
        },
        {
          name: "products",
          sql: "CREATE TABLE products (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, stock INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());",
        },
      ],
    },
  })
}

