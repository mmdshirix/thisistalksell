import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

// Helper function to verify session and get admin user
async function getAdminUserFromSession(chatbotId: number): Promise<any | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(`auth_token_${chatbotId}`)?.value

    if (!token) {
      return null
    }

    const sessionResult = await sql`
      SELECT s.user_id, s.expires_at, u.username, u.full_name, u.email
      FROM chatbot_admin_sessions s
      JOIN chatbot_admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${token} AND u.chatbot_id = ${chatbotId} AND u.is_active = TRUE
    `

    if (sessionResult.length === 0) {
      return null
    }

    const session = sessionResult[0]
    if (new Date(session.expires_at) < new Date()) {
      // Session expired, delete it
      await sql`DELETE FROM chatbot_admin_sessions WHERE session_token = ${token}`
      return null
    }

    return {
      id: session.user_id,
      username: session.username,
      fullName: session.full_name,
      email: session.email,
    }
  } catch (error) {
    console.error("Error validating admin session:", error)
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    // Verify admin session
    const adminUser = await getAdminUserFromSession(chatbotId)
    if (!adminUser) {
      return NextResponse.json({ error: "احراز هویت ناموفق" }, { status: 401 })
    }

    // Get chatbot info
    const chatbotResult = await sql`
      SELECT id, name, primary_color FROM chatbots WHERE id = ${chatbotId}
    `
    if (chatbotResult.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }
    const chatbot = chatbotResult[0]

    // Get stats
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT session_id) as unique_users,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_messages
      FROM messages 
      WHERE chatbot_id = ${chatbotId}
    `
    const stats = statsResult[0]

    // Get active tickets count
    const ticketsResult = await sql`
      SELECT COUNT(*) as active_tickets
      FROM tickets 
      WHERE chatbot_id = ${chatbotId} AND status IN ('open', 'in_progress')
    `
    const activeTickets = ticketsResult[0].active_tickets

    // Get daily analytics (last 7 days)
    const dailyAnalytics = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as messages
      FROM messages 
      WHERE chatbot_id = ${chatbotId} 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    // Get hourly analytics (today)
    const hourlyAnalytics = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as messages
      FROM messages 
      WHERE chatbot_id = ${chatbotId} 
        AND DATE(created_at) = CURRENT_DATE
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `

    // Format analytics data
    const dailyData = dailyAnalytics.map((row: any) => ({
      name: new Date(row.date).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
      value: Number(row.messages),
    }))

    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const found = hourlyAnalytics.find((row: any) => Number(row.hour) === hour)
      return {
        name: hour.toString(),
        value: found ? Number(found.messages) : 0,
      }
    })

    return NextResponse.json({
      adminUser,
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        primary_color: chatbot.primary_color,
      },
      stats: {
        totalMessages: Number(stats.total_messages),
        uniqueUsers: Number(stats.unique_users),
        todayMessages: Number(stats.today_messages),
        activeTickets: Number(activeTickets),
      },
      analytics: {
        dailyData,
        hourlyData,
      },
    })
  } catch (error) {
    console.error("Error fetching admin panel data:", error)
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
  }
}
