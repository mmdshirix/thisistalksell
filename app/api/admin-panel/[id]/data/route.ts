import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

// Helper function to safely parse JSON responses
function safeJson(data: any) {
  try {
    return typeof data === "string" ? JSON.parse(data) : data
  } catch {
    return data
  }
}

// Helper function to verify session and get admin user
async function getAdminUserFromSession(chatbotId: number): Promise<any | null> {
  try {
    if (!sql) {
      console.error("Database connection not available")
      return null
    }

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
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    console.log("Fetching data for chatbot ID:", chatbotId)

    // Check database connection
    if (!sql) {
      console.error("Database connection not available")
      return NextResponse.json({ error: "اتصال به دیتابیس برقرار نیست" }, { status: 500 })
    }

    // Verify admin session
    const adminUser = await getAdminUserFromSession(chatbotId)
    if (!adminUser) {
      console.log("Admin authentication failed for chatbot", chatbotId)
      return NextResponse.json({ error: "احراز هویت ناموفق" }, { status: 401 })
    }

    console.log("Admin user authenticated:", adminUser.username)

    // Get chatbot info
    let chatbot
    try {
      const chatbotResult = await sql`
        SELECT id, name, primary_color FROM chatbots WHERE id = ${chatbotId}
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

    // Get stats with fallback queries
    const stats = {
      totalMessages: 0,
      uniqueUsers: 0,
      todayMessages: 0,
      activeTickets: 0,
    }

    try {
      // Try to get message stats from messages table
      const messageStats = await sql`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT COALESCE(session_id, user_ip, 'unknown')) as unique_users,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_messages
        FROM messages 
        WHERE chatbot_id = ${chatbotId}
      `

      if (messageStats.length > 0) {
        stats.totalMessages = Number(messageStats[0].total_messages) || 0
        stats.uniqueUsers = Number(messageStats[0].unique_users) || 0
        stats.todayMessages = Number(messageStats[0].today_messages) || 0
      }
    } catch (error) {
      console.error("Error fetching message stats:", error)
      // Try alternative table name
      try {
        const altMessageStats = await sql`
          SELECT 
            COUNT(*) as total_messages,
            COUNT(DISTINCT COALESCE(user_ip, session_id, 'unknown')) as unique_users,
            COUNT(CASE WHEN DATE(timestamp) = CURRENT_DATE THEN 1 END) as today_messages
          FROM chatbot_messages 
          WHERE chatbot_id = ${chatbotId}
        `

        if (altMessageStats.length > 0) {
          stats.totalMessages = Number(altMessageStats[0].total_messages) || 0
          stats.uniqueUsers = Number(altMessageStats[0].unique_users) || 0
          stats.todayMessages = Number(altMessageStats[0].today_messages) || 0
        }
      } catch (altError) {
        console.error("Error with alternative message stats query:", altError)
      }
    }

    // Get active tickets count
    try {
      const ticketsResult = await sql`
        SELECT COUNT(*) as active_tickets
        FROM tickets 
        WHERE chatbot_id = ${chatbotId} AND status IN ('open', 'in_progress')
      `
      if (ticketsResult.length > 0) {
        stats.activeTickets = Number(ticketsResult[0].active_tickets) || 0
      }
    } catch (error) {
      console.error("Error fetching tickets stats:", error)
    }

    // Get analytics data with fallback
    let dailyData = []
    let hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      name: hour.toString(),
      value: 0,
    }))

    try {
      // Try to get daily analytics
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

      dailyData = dailyAnalytics.map((row: any) => ({
        name: new Date(row.date).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
        value: Number(row.messages),
      }))
    } catch (error) {
      console.error("Error fetching daily analytics:", error)
      // Try alternative table
      try {
        const altDailyAnalytics = await sql`
          SELECT 
            DATE(timestamp) as date,
            COUNT(*) as messages
          FROM chatbot_messages 
          WHERE chatbot_id = ${chatbotId} 
            AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(timestamp)
          ORDER BY date DESC
        `

        dailyData = altDailyAnalytics.map((row: any) => ({
          name: new Date(row.date).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
          value: Number(row.messages),
        }))
      } catch (altError) {
        console.error("Error with alternative daily analytics:", altError)
        // Provide default data
        dailyData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return {
            name: date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
            value: 0,
          }
        }).reverse()
      }
    }

    try {
      // Try to get hourly analytics
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

      const hourlyMap = new Map()
      hourlyAnalytics.forEach((row: any) => {
        hourlyMap.set(Number(row.hour), Number(row.messages))
      })

      hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        name: hour.toString(),
        value: hourlyMap.get(hour) || 0,
      }))
    } catch (error) {
      console.error("Error fetching hourly analytics:", error)
      // Try alternative table
      try {
        const altHourlyAnalytics = await sql`
          SELECT 
            EXTRACT(HOUR FROM timestamp) as hour,
            COUNT(*) as messages
          FROM chatbot_messages 
          WHERE chatbot_id = ${chatbotId} 
            AND DATE(timestamp) = CURRENT_DATE
          GROUP BY EXTRACT(HOUR FROM timestamp)
          ORDER BY hour
        `

        const hourlyMap = new Map()
        altHourlyAnalytics.forEach((row: any) => {
          hourlyMap.set(Number(row.hour), Number(row.messages))
        })

        hourlyData = Array.from({ length: 24 }, (_, hour) => ({
          name: hour.toString(),
          value: hourlyMap.get(hour) || 0,
        }))
      } catch (altError) {
        console.error("Error with alternative hourly analytics:", altError)
      }
    }

    const responseData = {
      adminUser,
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        primary_color: chatbot.primary_color,
      },
      stats,
      analytics: {
        dailyData,
        hourlyData,
      },
    }

    console.log("Returning data successfully")
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
