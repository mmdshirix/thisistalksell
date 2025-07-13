import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

async function getAdminUserFromSession(token: string) {
  try {
    const result = await sql`
      SELECT u.id, u.chatbot_id
      FROM chatbot_admin_sessions s
      JOIN chatbot_admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${token} 
        AND s.expires_at > CURRENT_TIMESTAMP 
        AND u.is_active = true
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
  }

  const token = cookies().get(`auth_token_${chatbotId}`)?.value
  if (!token) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 })
  }

  const adminUser = await getAdminUserFromSession(token)
  if (!adminUser || adminUser.chatbot_id !== chatbotId) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 })
  }

  try {
    const [chatbotResult, messagesResult, ticketsResult] = await Promise.all([
      sql`SELECT id, name, primary_color, COALESCE(stats_multiplier, 1.0) as multiplier FROM chatbots WHERE id = ${chatbotId}`,
      sql`SELECT timestamp, user_ip FROM chatbot_messages WHERE chatbot_id = ${chatbotId}`,
      sql`SELECT status FROM tickets WHERE chatbot_id = ${chatbotId}`,
    ])

    if (chatbotResult.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    const chatbot = chatbotResult[0]
    const multiplier = Number(chatbot.multiplier)

    // Process stats
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayMessages = messagesResult.filter((m) => new Date(m.timestamp) >= todayStart).length
    const totalMessages = messagesResult.length
    const uniqueUsers = new Set(messagesResult.map((m) => m.user_ip)).size

    // Ticket stats are ALWAYS real
    const activeTickets = ticketsResult.filter((t) => t.status === "open" || t.status === "in_progress").length

    const finalStats = {
      todayMessages: Math.round(todayMessages * multiplier),
      uniqueUsers: Math.round(uniqueUsers * multiplier),
      activeTickets: activeTickets, // No multiplier for tickets
      totalMessages: Math.round(totalMessages * multiplier),
    }

    // Process analytics (message-based, so multiplier applies)
    const dailyData = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayName = d.toLocaleDateString("fa-IR", { weekday: "short" })
        return { name: dayName, value: 0 }
      })
      .reverse()

    const hourlyData = Array(24)
      .fill(0)
      .map((_, i) => ({ name: `${i}:00`, value: 0 }))

    messagesResult.forEach((msg) => {
      const msgDate = new Date(msg.timestamp)
      const diffDays = Math.floor((now.getTime() - msgDate.getTime()) / (1000 * 3600 * 24))
      if (diffDays < 7) {
        dailyData[6 - diffDays].value++
      }
      if (msgDate >= todayStart) {
        hourlyData[msgDate.getHours()].value++
      }
    })

    dailyData.forEach((d) => (d.value = Math.round(d.value * multiplier)))
    hourlyData.forEach((h) => (h.value = Math.round(h.value * multiplier)))

    const responseData = {
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        primary_color: chatbot.primary_color,
      },
      stats: finalStats,
      analytics: { dailyData, hourlyData },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching admin panel data:", error)
    return NextResponse.json({ error: "خطا در دریافت اطلاعات پنل" }, { status: 500 })
  }
}
