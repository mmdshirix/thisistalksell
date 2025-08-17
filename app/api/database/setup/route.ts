import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { databaseUrl } = await request.json()

    if (!databaseUrl || !databaseUrl.includes("postgres://")) {
      return NextResponse.json({ error: "Invalid database URL format" }, { status: 400 })
    }

    // تست اتصال مستقیم بدون ذخیره در فایل
    try {
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(databaseUrl)

      // تست ساده اتصال
      const result = await sql`SELECT 1 as test`

      if (result && result.length > 0) {
        // ذخیره موقت در متغیر محیطی runtime
        process.env.DATABASE_URL = databaseUrl

        return NextResponse.json({
          success: true,
          message: "Database connection successful! URL has been set for this session.",
          note: "To make this permanent, add DATABASE_URL to your environment variables in Vercel dashboard.",
        })
      } else {
        return NextResponse.json({ error: "Database connection test failed - no response" }, { status: 400 })
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        error: "Failed to setup database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      return NextResponse.json({
        connected: false,
        error: "No DATABASE_URL found",
        instruction: "Please set DATABASE_URL using the form below",
      })
    }

    // تست اتصال
    try {
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(databaseUrl)
      const result = await sql`SELECT 1 as test`

      if (result && result.length > 0) {
        return NextResponse.json({
          connected: true,
          url: databaseUrl.substring(0, 30) + "...",
          message: "Database connection is working",
        })
      } else {
        return NextResponse.json({
          connected: false,
          error: "Database URL exists but connection test failed",
        })
      }
    } catch (error) {
      return NextResponse.json({
        connected: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: "Failed to check database status",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
