import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id } = params

  try {
    const result = await sql`SELECT id FROM chatbots WHERE id = ${id};`
    if (result.length > 0) {
      return NextResponse.json({ exists: true })
    } else {
      return NextResponse.json({ exists: false }, { status: 404 })
    }
  } catch (error) {
    console.error("Error checking chatbot existence:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
