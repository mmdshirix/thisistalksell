import { type NextRequest, NextResponse } from "next/server"

// Initialize database connection
let sql: any = null

async function initializeDatabase() {
  if (sql !== null) return sql

  try {
    if (process.env.DATABASE_URL) {
      const { neon } = await import("@neondatabase/serverless")
      sql = neon(process.env.DATABASE_URL)
      console.log("✅ Database connection established")
      return sql
    }
  } catch (error) {
    console.warn("⚠️ Failed to initialize database connection:", error)
  }

  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = Number(params.id)

  try {
    const dbConnection = await initializeDatabase()

    if (!dbConnection) {
      return NextResponse.json({ error: "اتصال به دیتابیس برقرار نیست" }, { status: 503 })
    }

    const result = await dbConnection`
      SELECT stats_multiplier FROM chatbots WHERE id = ${chatbotId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({
      chatbot_id: chatbotId,
      stats_multiplier: Number(result[0].stats_multiplier) || 1.0,
    })
  } catch (error) {
    console.error("Error fetching stats multiplier:", error)
    return NextResponse.json({ error: "خطا در دریافت ضریب آماری" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = Number(params.id)

  try {
    const { stats_multiplier } = await request.json()

    // Validate multiplier
    if (typeof stats_multiplier !== "number" || stats_multiplier < 0.1 || stats_multiplier > 100) {
      return NextResponse.json({ error: "ضریب باید بین 0.1 تا 100 باشد" }, { status: 400 })
    }

    const dbConnection = await initializeDatabase()

    if (!dbConnection) {
      return NextResponse.json({ error: "اتصال به دیتابیس برقرار نیست" }, { status: 503 })
    }

    const result = await dbConnection`
      UPDATE chatbots 
      SET stats_multiplier = ${stats_multiplier}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${chatbotId}
      RETURNING id, stats_multiplier
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      chatbot_id: chatbotId,
      stats_multiplier: Number(result[0].stats_multiplier),
      message: "ضریب آماری با موفقیت به‌روزرسانی شد",
    })
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی ضریب آماری" }, { status: 500 })
  }
}
