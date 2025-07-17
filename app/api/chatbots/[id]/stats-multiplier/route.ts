import { type NextRequest, NextResponse } from "next/server"
import { getStatsMultiplier, updateStatsMultiplier } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const multiplier = await getStatsMultiplier(id)
    return NextResponse.json({ multiplier })
  } catch (error) {
    console.error("Error fetching stats multiplier:", error)
    return NextResponse.json({ error: "Failed to fetch stats multiplier" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const body = await request.json()
    const multiplier = Number.parseFloat(body.multiplier)

    if (isNaN(multiplier) || multiplier < 0) {
      return NextResponse.json({ error: "Invalid multiplier value" }, { status: 400 })
    }

    const success = await updateStatsMultiplier(id, multiplier)

    if (!success) {
      return NextResponse.json({ error: "Failed to update stats multiplier" }, { status: 500 })
    }

    return NextResponse.json({ multiplier })
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return NextResponse.json({ error: "Failed to update stats multiplier" }, { status: 500 })
  }
}
