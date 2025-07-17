import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all" // "month" or "all"

    // Dynamic import to avoid build-time issues
    const { sql } = await import("@/lib/db")

    // Get total messages count
    const totalMessagesResult = await sql`
      SELECT COUNT(*) as total
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
    `
    const totalMessages = Number(totalMessagesResult[0]?.total || 0)

    // Get messages count for the period
    let periodMessages = totalMessages
    if (period === "month") {
      const monthResult = await sql`
        SELECT COUNT(*) as total
        FROM chatbot_messages 
        WHERE chatbot_id = ${chatbotId}
        AND timestamp >= NOW() - INTERVAL '30 days'
      `
      periodMessages = Number(monthResult[0]?.total || 0)
    }

    // Get unique users count
    const uniqueUsersResult = await sql`
      SELECT COUNT(DISTINCT user_ip) as unique_users
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
      ${period === "month" ? sql`AND timestamp >= NOW() - INTERVAL '30 days'` : sql``}
    `
    const uniqueUsers = Number(uniqueUsersResult[0]?.unique_users || 0)

    // Get daily stats for chart (last 30 days)
    const dailyStatsResult = await sql`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as messages,
        COUNT(DISTINCT user_ip) as users
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
      AND timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT 30
    `

    // Get hourly activity for today
    const hourlyActivityResult = await sql`
      SELECT 
        EXTRACT(HOUR FROM timestamp) as hour,
        COUNT(*) as messages
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
      AND DATE(timestamp) = CURRENT_DATE
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY hour
    `

    // Get top questions
    const topQuestionsResult = await sql`
      SELECT 
        user_message as question,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
      AND LENGTH(user_message) > 5
      ${period === "month" ? sql`AND timestamp >= NOW() - INTERVAL '30 days'` : sql``}
      GROUP BY user_message
      ORDER BY count DESC
      LIMIT 10
    `

    return NextResponse.json({
      totalMessages,
      periodMessages,
      uniqueUsers,
      period,
      dailyStats: dailyStatsResult,
      hourlyActivity: hourlyActivityResult,
      topQuestions: topQuestionsResult,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "خطا در دریافت آمار" }, { status: 500 })
  }
}
