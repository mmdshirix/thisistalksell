import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 })
    }

    // Simple test query
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      chatbotId,
      database: "connected",
      test: result[0]?.test,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
