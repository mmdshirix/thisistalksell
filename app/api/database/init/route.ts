import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("API: Initializing database...")
    const result = await initializeDatabase()

    if (result.success) {
      console.log("API: Database initialized successfully.")
      return NextResponse.json(result)
    } else {
      console.error("API: Database initialization failed.", result.message)
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error("API Error initializing database:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, message: `خطای سرور: ${errorMessage}` }, { status: 500 })
  }
}
