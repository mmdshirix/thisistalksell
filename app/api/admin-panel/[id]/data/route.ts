import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getAdminUserFromSession } from "@/lib/admin-auth"
import { unstable_noStore as noStore } from "next/cache"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  noStore()
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
  }

  // --- Authentication ---
  const adminUser = await getAdminUserFromSession(request, chatbotId)
  if (!adminUser) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 })
  }

  try {
    // --- Fetch all data in parallel ---
    const [chatbotResult, statsResult, analyticsResult] = await Promise.all([
      // 1. Get Chatbot Info
      sql`SELECT id, name, primary_color FROM chatbots WHERE id = ${chatbotId}`,

      // 2. Get Core Stats
      sql`
        SELECT
          (SELECT COUNT(*) FROM chatbot_messages WHERE chatbot_id = ${chatbotId}) as "totalMessages",
          (SELECT COUNT(*) FROM chatbot_messages WHERE chatbot_id = ${chatbotId} AND timestamp >= CURRENT_DATE) as "todayMessages",
          (SELECT COUNT(DISTINCT user_ip) FROM chatbot_messages WHERE chatbot_id = ${chatbotId}) as "uniqueUsers",
          (SELECT COUNT(*) FROM tickets WHERE chatbot_id = ${chatbotId} AND status = 'open') as "activeTickets"
      `,

      // 3. Get Analytics Data (Charts)
      sql`
        WITH daily_data AS (
          SELECT
            DATE_TRUNC('day', timestamp)::date as day,
            COUNT(*) as value
          FROM chatbot_messages
          WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '6 days'
          GROUP BY 1
        ),
        hourly_data AS (
          SELECT
            EXTRACT(HOUR FROM timestamp) as hour,
            COUNT(*) as value
          FROM chatbot_messages
          WHERE chatbot_id = ${chatbotId} AND timestamp >= CURRENT_DATE
          GROUP BY 1
        )
        SELECT
          (SELECT json_agg(t) FROM (
            SELECT to_char(day, 'YYYY-MM-DD') as name, value FROM daily_data ORDER BY day
          ) t) as "dailyData",
          (SELECT json_agg(t) FROM (
            SELECT hour::text || ':00' as name, value FROM hourly_data ORDER BY hour
          ) t) as "hourlyData"
      `,
    ])

    if (chatbotResult.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    // Format data
    const chatbot = chatbotResult[0]
    const stats = {
      totalMessages: Number(statsResult[0].totalMessages || 0),
      todayMessages: Number(statsResult[0].todayMessages || 0),
      uniqueUsers: Number(statsResult[0].uniqueUsers || 0),
      activeTickets: Number(statsResult[0].activeTickets || 0),
    }
    const analytics = {
      dailyData: analyticsResult[0].dailyData || [],
      hourlyData: analyticsResult[0].hourlyData || [],
    }

    // Fill in missing days for dailyData
    const completeDailyData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]
      const found = analytics.dailyData.find((d: any) => d.name === dateString)
      completeDailyData.push({
        name: new Date(dateString).toLocaleDateString("fa-IR", { weekday: "short" }),
        value: found ? found.value : 0,
      })
    }
    analytics.dailyData = completeDailyData

    return NextResponse.json({
      adminUser: {
        id: adminUser.id,
        username: adminUser.username,
        fullName: adminUser.full_name,
      },
      chatbot,
      stats,
      analytics,
    })
  } catch (error) {
    console.error(`[API Error] /admin-panel/${chatbotId}/data:`, error)
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
  }
}
