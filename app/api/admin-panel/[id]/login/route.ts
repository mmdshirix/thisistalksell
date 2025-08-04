import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { generateAdminToken } from "@/lib/admin-auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const { username, password } = await request.json()

  try {
    // In a real application, hash and compare passwords securely
    const user = await sql`
      SELECT id, username, password
      FROM admin_users
      WHERE chatbot_id = ${chatbotId} AND username = ${username};
    `

    if (user.length === 0 || user[0].password !== password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = generateAdminToken(user[0].id, chatbotId)
    return NextResponse.json({ message: "Login successful", token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
