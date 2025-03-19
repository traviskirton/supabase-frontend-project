import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API endpoint working",
    env: {
      supabaseUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  })
}

