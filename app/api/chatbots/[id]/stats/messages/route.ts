import { type NextRequest, NextResponse } from "next/server"
import { getTotalMessageCount, getMessageCountByDay, getMessageCountByWeek, getMessageCountByMonth } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "total"
    const days = Number.parseInt(searchParams.get("days") || "7")
    const weeks = Number.parseInt(searchParams.get("weeks") || "4")
    const months = Number.parseInt(searchParams.get("months") || "6")

    let data

    switch (period) {
      case "day":
        data = await getMessageCountByDay(id, days)
        break
      case "week":
        data = await getMessageCountByWeek(id, weeks)
        break
      case "month":
        data = await getMessageCountByMonth(id, months)
        break
      case "total":
      default:
        data = await getTotalMessageCount(id)
        break
    }

    return NextResponse.json({ data, period })
  } catch (error) {
    console.error("Error fetching message stats:", error)
    return NextResponse.json({ error: "Failed to fetch message stats" }, { status: 500 })
  }
}
