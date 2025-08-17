import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const chatbotId = params.id

    // Get chatbot info
    const chatbotResult = await sql`
      SELECT id, name, primary_color FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbotResult.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    const chatbot = chatbotResult[0]

    // Get stats
    const totalMessagesResult = await sql`
      SELECT COUNT(*) as count FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
    `

    const uniqueUsersResult = await sql`
      SELECT COUNT(DISTINCT user_ip) as count FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
    `

    const todayMessagesResult = await sql`
      SELECT COUNT(*) as count FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
      AND DATE(timestamp) = CURRENT_DATE
    `

    const activeTicketsResult = await sql`
      SELECT COUNT(*) as count FROM tickets 
      WHERE chatbot_id = ${chatbotId} 
      AND status IN ('open', 'in_progress')
    `

    // Get daily data for the last 7 days
    const dailyDataResult = await sql`
      SELECT 
        TO_CHAR(DATE(timestamp), 'MM/DD') as name,
        COUNT(*) as value
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
      AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(timestamp)
      ORDER BY DATE(timestamp) ASC
    `

    // Get hourly data for today
    const hourlyDataResult = await sql`
      SELECT 
        EXTRACT(HOUR FROM timestamp)::text || ':00' as name,
        COUNT(*) as value
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
      AND DATE(timestamp) = CURRENT_DATE
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY EXTRACT(HOUR FROM timestamp) ASC
    `

    // Apply stats multiplier
    const statsMultiplierResult = await sql`
      SELECT COALESCE(stats_multiplier, 1.0) as multiplier FROM chatbots WHERE id = ${chatbotId}
    `
    const multiplier = Number(statsMultiplierResult[0]?.multiplier || 1.0)

    const stats = {
      totalMessages: Math.round((totalMessagesResult[0]?.count || 0) * multiplier),
      uniqueUsers: Math.round((uniqueUsersResult[0]?.count || 0) * multiplier),
      todayMessages: Math.round((todayMessagesResult[0]?.count || 0) * multiplier),
      activeTickets: activeTicketsResult[0]?.count || 0, // Don't multiply tickets
    }

    const analytics = {
      dailyData: dailyDataResult.map((item: any) => ({
        name: item.name,
        value: Math.round(item.value * multiplier),
      })),
      hourlyData: hourlyDataResult.map((item: any) => ({
        name: item.name,
        value: Math.round(item.value * multiplier),
      })),
    }

    return NextResponse.json({
      chatbot,
      stats,
      analytics,
    })
  } catch (error) {
    console.error("Error fetching admin panel data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
