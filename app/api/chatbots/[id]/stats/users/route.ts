import { type NextRequest, NextResponse } from "next/server"
import { getUniqueUsersCount, getAverageMessagesPerUser } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const uniqueUsers = await getUniqueUsersCount(id)
    const averageMessages = await getAverageMessagesPerUser(id)

    return NextResponse.json({
      uniqueUsers,
      averageMessages,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}
