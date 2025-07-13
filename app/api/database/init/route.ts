import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function POST() {
  try {
    console.log("API: Initializing database...")
    const result = await initializeDatabase()

    if (result.success) {
      console.log("API: Database initialized successfully")
      return NextResponse.json(result, { status: 200 })
    } else {
      console.error("API: Database initialization failed:", result.message)
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error("API: Database initialization error:", error)
    return NextResponse.json({ success: false, message: `Database initialization failed: ${error}` }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to initialize database" })
}
