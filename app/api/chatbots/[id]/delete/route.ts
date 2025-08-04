import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== chatbotId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await sql`DELETE FROM chatbots WHERE id = ${chatbotId};`
    return NextResponse.json({ message: "Chatbot deleted successfully" })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
