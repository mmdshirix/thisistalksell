import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

/**
 * GET /api/admin-panel/[id]/tickets
 *
 * Query-string params
 *   • status?: "all" | "open" | "in_progress" | "resolved" | "closed"
 *   • sortBy?: "newest" | "oldest" | "priority"
 *
 * Returns
 * {
 *   tickets:  TicketRow[]
 *   statusCounts: { [status]: number }
 *   totalTickets: number
 * }
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (Number.isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است." }, { status: 400 })
    }

    const search = new URL(req.url).searchParams
    const status = search.get("status") ?? "all"
    const sort = search.get("sortBy") ?? "newest"

    // ---------- build WHERE clause ----------
    let where = sql`WHERE chatbot_id = ${chatbotId}`
    if (status !== "all") {
      where = sql`WHERE chatbot_id = ${chatbotId} AND status = ${status}`
    }

    // ---------- build ORDER clause ----------
    let order = sql`ORDER BY created_at DESC` // newest
    if (sort === "oldest") {
      order = sql`ORDER BY created_at ASC`
    } else if (sort === "priority") {
      /* high → normal → low, then newest */
      order = sql`
        ORDER BY
          CASE priority
            WHEN 'high'   THEN 1
            WHEN 'normal' THEN 2
            WHEN 'low'    THEN 3
          END,
          created_at DESC
      `
    }

    // ---------- fetch rows ----------
    const tickets = await sql`
      SELECT
        id,
        chatbot_id,
        name,
        email,
        phone,
        subject,
        message,
        image_url,
        status,
        priority,
        created_at,
        updated_at
      FROM tickets
      ${where}
      ${order}
    `

    // ---------- count by status ----------
    const counts = await sql`
      SELECT status, COUNT(*) AS count
      FROM tickets
      WHERE chatbot_id = ${chatbotId}
      GROUP BY status
    `
    const statusCounts = counts.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = Number(row.count)
      return acc
    }, {})

    return NextResponse.json({
      tickets,
      statusCounts,
      totalTickets: tickets.length,
    })
  } catch (err) {
    console.error("GET /tickets error:", err)
    return NextResponse.json({ error: "خطا در دریافت تیکت‌ها" }, { status: 500 })
  }
}
