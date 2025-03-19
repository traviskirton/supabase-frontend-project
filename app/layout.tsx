import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Supabase Data Project",
  description: "A project that connects to Supabase",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // Create a script to inject environment variables
  const envScript = `
    window.ENV = {
      NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "${supabaseAnonKey}"
    };
  `

  return (
    <html lang="en">
      <head>
        <Script id="env-script" dangerouslySetInnerHTML={{ __html: envScript }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

