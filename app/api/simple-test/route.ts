import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return NextResponse.json({
      success: true,
      message: "API endpoint working",
      env: {
        supabaseUrlSet: !!supabaseUrl,
        supabaseKeySet: !!supabaseAnonKey,
        supabaseUrlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "Not set",
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

