import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { unstable_noStore as noStore } from "next/cache"

export async function GET(request: NextRequest, { params }: { params: { chatbotId: string } }) {
  noStore() // Disable caching for real-time data

  try {
    const chatbotId = Number(params.chatbotId)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    // Get filter parameters from URL
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "DESC"

    // Build the WHERE clause based on filters
    let whereClause = `chatbot_id = ${chatbotId}`

    if (status && status !== "all") {
      whereClause += ` AND status = '${status}'`
    }

    if (priority && priority !== "all") {
      whereClause += ` AND priority = '${priority}'`
    }

    // Build the ORDER BY clause
    const validSortColumns = ["created_at", "updated_at", "status", "priority", "subject"]
    const validSortOrders = ["ASC", "DESC"]

    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : "created_at"
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : "DESC"

    // Special sorting for new tickets first
    let orderClause
    if (finalSortBy === "created_at" && finalSortOrder === "DESC") {
      // Show new tickets (last 24 hours) first, then by creation date
      orderClause = `
        CASE 
          WHEN created_at >= NOW() - INTERVAL '24 hours' AND status = 'open' THEN 0 
          ELSE 1 
        END ASC,
        created_at DESC
      `
    } else {
      orderClause = `${finalSortBy} ${finalSortOrder}`
    }

    const tickets = await sql`
      SELECT 
        id,
        subject,
        message,
        status,
        priority,
        created_at,
        updated_at,
        name,
        email,
        phone,
        image_url,
        CASE 
          WHEN created_at >= NOW() - INTERVAL '24 hours' THEN true 
          ELSE false 
        END as is_new
      FROM tickets 
      WHERE chatbot_id = ${chatbotId}
      ${status && status !== "all" ? sql`AND status = ${status}` : sql``}
      ${priority && priority !== "all" ? sql`AND priority = ${priority}` : sql``}
      ORDER BY 
        CASE 
          WHEN created_at >= NOW() - INTERVAL '24 hours' AND status = 'open' THEN 0 
          ELSE 1 
        END ASC,
        created_at DESC
    `

    // Get ticket counts for filters
    const ticketCounts = await sql`
      SELECT 
        status,
        priority,
        COUNT(*) as count,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_count
      FROM tickets 
      WHERE chatbot_id = ${chatbotId}
      GROUP BY status, priority
    `

    // Process counts for easier frontend consumption
    const statusCounts = {
      all: 0,
      open: 0,
      in_progress: 0,
      closed: 0,
    }

    const priorityCounts = {
      all: 0,
      low: 0,
      normal: 0,
      high: 0,
    }

    let totalNewTickets = 0

    ticketCounts.forEach((row: any) => {
      const count = Number(row.count)
      const newCount = Number(row.new_count)

      statusCounts.all += count
      statusCounts[row.status as keyof typeof statusCounts] += count

      priorityCounts.all += count
      priorityCounts[row.priority as keyof typeof priorityCounts] += count

      totalNewTickets += newCount
    })

    return NextResponse.json({
      tickets,
      counts: {
        status: statusCounts,
        priority: priorityCounts,
        newTickets: totalNewTickets,
      },
      filters: {
        status,
        priority,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "خطا در دریافت تیکت‌ها" }, { status: 500 })
  }
}
