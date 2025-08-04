import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const adminUsers = await sql`SELECT id, username FROM admin_users WHERE chatbot_id = ${chatbotId};`
    return NextResponse.json(adminUsers)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const { username, password } = await request.json()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== chatbotId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // In a real app, hash the password!
    const result = await sql`
      INSERT INTO admin_users (chatbot_id, username, password)
      VALUES (${chatbotId}, ${username}, ${password})
      RETURNING id;
    `
    return NextResponse.json({ message: "Admin user added", id: result[0].id })
  } catch (error) {
    console.error("Error adding admin user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
