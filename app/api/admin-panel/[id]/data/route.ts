import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { unstable_noStore as noStore } from "next/cache"

// Helper function to verify session and get admin user
async function getAdminUserFromSession(chatbotId: number): Promise<any | null> {
  try {
    // Dynamic import to avoid build-time issues
    const { sql } = await import("@/lib/db")

    const cookieStore = cookies()
    const token = cookieStore.get(`auth_token_${chatbotId}`)?.value

    if (!token) {
      console.log("No auth token found for chatbot", chatbotId)
      return null
    }

    const sessionResult = await sql`
      SELECT s.user_id, s.expires_at, u.username, u.full_name, u.email
      FROM chatbot_admin_sessions s
      JOIN chatbot_admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${token} AND u.chatbot_id = ${chatbotId} AND u.is_active = TRUE
    `

    if (sessionResult.length === 0) {
      console.log("No valid session found for token")
      return null
    }

    const session = sessionResult[0]
    if (new Date(session.expires_at) < new Date()) {
      console.log("Session expired, deleting...")
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
  noStore() // Disable caching for real-time data

  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    console.log("Fetching real-time data for chatbot ID:", chatbotId)

    // Verify admin session
    const adminUser = await getAdminUserFromSession(chatbotId)
    if (!adminUser) {
      console.log("Admin authentication failed for chatbot", chatbotId)
      return NextResponse.json({ error: "احراز هویت ناموفق" }, { status: 401 })
    }

    console.log("Admin user authenticated:", adminUser.username)

    // Dynamic import to avoid build-time issues
    const { sql } = await import("@/lib/db")

    // Get chatbot info with all details for preview
    let chatbot
    try {
      const chatbotResult = await sql`
        SELECT 
          id, name, primary_color, text_color, background_color, 
          chat_icon, position, margin_x, margin_y, welcome_message, 
          navigation_message, knowledge_base_text, knowledge_base_url, 
          store_url, ai_url, deepseek_api_key,
          COALESCE(stats_multiplier, 1.0) as stats_multiplier
        FROM chatbots 
        WHERE id = ${chatbotId}
      `
      if (chatbotResult.length === 0) {
        return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
      }
      chatbot = chatbotResult[0]
      console.log("Chatbot found:", chatbot.name)
    } catch (error) {
      console.error("Error fetching chatbot:", error)
      return NextResponse.json({ error: "خطا در دریافت اطلاعات چت‌بات" }, { status: 500 })
    }

    // Get real-time message statistics with proper counting
    const stats = {
      totalMessages: 0,
      uniqueUsers: 0,
      todayMessages: 0,
      thisMonthMessages: 0,
      activeTickets: 0,
      newTickets: 0,
    }

    try {
      // Count all messages (both user and bot messages) for this specific chatbot
      const messageStats = await sql`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT COALESCE(user_ip, 'unknown')) as unique_users,
          COUNT(CASE WHEN DATE(timestamp) = CURRENT_DATE THEN 1 END) as today_messages,
          COUNT(CASE WHEN DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as this_month_messages
        FROM chatbot_messages 
        WHERE chatbot_id = ${chatbotId}
          AND (user_message IS NOT NULL OR bot_response IS NOT NULL)
      `

      if (messageStats.length > 0 && messageStats[0]) {
        const rawStats = messageStats[0]
        stats.totalMessages = Math.floor(Number(rawStats.total_messages || 0) * Number(chatbot.stats_multiplier || 1))
        stats.uniqueUsers = Math.floor(Number(rawStats.unique_users || 0) * Number(chatbot.stats_multiplier || 1))
        stats.todayMessages = Math.floor(Number(rawStats.today_messages || 0) * Number(chatbot.stats_multiplier || 1))
        stats.thisMonthMessages = Math.floor(
          Number(rawStats.this_month_messages || 0) * Number(chatbot.stats_multiplier || 1),
        )
      }

      console.log(`Message stats for chatbot ${chatbotId}:`, stats)
    } catch (error) {
      console.error("Error fetching message stats:", error)
    }

    // Get ticket statistics
    try {
      const ticketsResult = await sql`
        SELECT 
          COUNT(CASE WHEN status IN ('open', 'in_progress') THEN 1 END) as active_tickets,
          COUNT(CASE WHEN status = 'open' AND created_at >= CURRENT_DATE - INTERVAL '24 hours' THEN 1 END) as new_tickets
        FROM tickets 
        WHERE chatbot_id = ${chatbotId}
      `
      if (ticketsResult.length > 0 && ticketsResult[0]) {
        stats.activeTickets = Number(ticketsResult[0].active_tickets) || 0
        stats.newTickets = Number(ticketsResult[0].new_tickets) || 0
      }
    } catch (error) {
      console.error("Error fetching tickets stats:", error)
    }

    // Get daily analytics for the last 30 days
    let dailyData = []
    try {
      const dailyAnalytics = await sql`
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as messages
        FROM chatbot_messages 
        WHERE chatbot_id = ${chatbotId} 
          AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
          AND (user_message IS NOT NULL OR bot_response IS NOT NULL)
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `

      // Create complete 30-day data with zeros for missing days
      const last30Days = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split("T")[0]

        const found = dailyAnalytics.find((row: any) => row.date === dateString)
        const messageCount = found ? Number(found.messages) : 0
        const adjustedCount = Math.floor(messageCount * Number(chatbot.stats_multiplier || 1))

        last30Days.push({
          name: date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
          value: adjustedCount,
          fullDate: dateString,
        })
      }
      dailyData = last30Days
    } catch (error) {
      console.error("Error fetching daily analytics:", error)
      // Provide default 30-day data
      dailyData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return {
          name: date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
          value: 0,
          fullDate: date.toISOString().split("T")[0],
        }
      })
    }

    // Get hourly analytics for today
    let hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      name: `${hour}:00`,
      value: 0,
    }))

    try {
      const hourlyAnalytics = await sql`
        SELECT 
          EXTRACT(HOUR FROM timestamp) as hour,
          COUNT(*) as messages
        FROM chatbot_messages 
        WHERE chatbot_id = ${chatbotId} 
          AND DATE(timestamp) = CURRENT_DATE
          AND (user_message IS NOT NULL OR bot_response IS NOT NULL)
        GROUP BY EXTRACT(HOUR FROM timestamp)
        ORDER BY hour
      `

      const hourlyMap = new Map()
      hourlyAnalytics.forEach((row: any) => {
        const adjustedCount = Math.floor(Number(row.messages) * Number(chatbot.stats_multiplier || 1))
        hourlyMap.set(Number(row.hour), adjustedCount)
      })

      hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        name: `${hour}:00`,
        value: hourlyMap.get(hour) || 0,
      }))
    } catch (error) {
      console.error("Error fetching hourly analytics:", error)
    }

    // Get weekly analytics for the last 4 weeks
    let weeklyData = []
    try {
      const weeklyAnalytics = await sql`
        SELECT 
          DATE_TRUNC('week', timestamp) as week_start,
          COUNT(*) as messages
        FROM chatbot_messages 
        WHERE chatbot_id = ${chatbotId} 
          AND timestamp >= CURRENT_DATE - INTERVAL '4 weeks'
          AND (user_message IS NOT NULL OR bot_response IS NOT NULL)
        GROUP BY DATE_TRUNC('week', timestamp)
        ORDER BY week_start ASC
      `

      weeklyData = weeklyAnalytics.map((row: any, index: number) => ({
        name: `هفته ${index + 1}`,
        value: Math.floor(Number(row.messages) * Number(chatbot.stats_multiplier || 1)),
      }))

      // Fill missing weeks with zeros
      while (weeklyData.length < 4) {
        weeklyData.push({
          name: `هفته ${weeklyData.length + 1}`,
          value: 0,
        })
      }
    } catch (error) {
      console.error("Error fetching weekly analytics:", error)
      weeklyData = Array.from({ length: 4 }, (_, i) => ({
        name: `هفته ${i + 1}`,
        value: 0,
      }))
    }

    // Get monthly analytics for the last 6 months
    let monthlyData = []
    try {
      const monthlyAnalytics = await sql`
        SELECT 
          DATE_TRUNC('month', timestamp) as month_start,
          COUNT(*) as messages
        FROM chatbot_messages 
        WHERE chatbot_id = ${chatbotId} 
          AND timestamp >= CURRENT_DATE - INTERVAL '6 months'
          AND (user_message IS NOT NULL OR bot_response IS NOT NULL)
        GROUP BY DATE_TRUNC('month', timestamp)
        ORDER BY month_start ASC
      `

      monthlyData = monthlyAnalytics.map((row: any) => ({
        name: new Date(row.month_start).toLocaleDateString("fa-IR", { month: "short" }),
        value: Math.floor(Number(row.messages) * Number(chatbot.stats_multiplier || 1)),
      }))

      // Fill missing months with zeros
      while (monthlyData.length < 6) {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - monthlyData.length))
        monthlyData.push({
          name: date.toLocaleDateString("fa-IR", { month: "short" }),
          value: 0,
        })
      }
    } catch (error) {
      console.error("Error fetching monthly analytics:", error)
      monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        return {
          name: date.toLocaleDateString("fa-IR", { month: "short" }),
          value: 0,
        }
      })
    }

    const responseData = {
      adminUser,
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        primary_color: chatbot.primary_color,
        text_color: chatbot.text_color,
        background_color: chatbot.background_color,
        chat_icon: chatbot.chat_icon,
        position: chatbot.position,
        margin_x: chatbot.margin_x,
        margin_y: chatbot.margin_y,
        welcome_message: chatbot.welcome_message,
        navigation_message: chatbot.navigation_message,
        knowledge_base_text: chatbot.knowledge_base_text,
        knowledge_base_url: chatbot.knowledge_base_url,
        store_url: chatbot.store_url,
        ai_url: chatbot.ai_url,
      },
      stats,
      analytics: {
        dailyData,
        hourlyData,
        weeklyData,
        monthlyData,
      },
    }

    console.log("Returning real-time data successfully for chatbot:", chatbot.name)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Unexpected error in admin panel data API:", error)
    return NextResponse.json(
      {
        error: "خطای داخلی سرور",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
