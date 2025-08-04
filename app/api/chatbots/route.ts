import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const sql = getSql()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    // In a real app, you might want to filter chatbots by the admin user's ID
    // For now, we'll just check if the token is valid.
    verifyAdminToken(token)

    const chatbots = await sql`SELECT id, name, description, created_at FROM chatbots ORDER BY created_at DESC;`
    return NextResponse.json(chatbots)
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const sql = getSql()
  const { name, description } = await request.json()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    verifyAdminToken(token) // Ensure the user is authenticated

    const result = await sql`
      INSERT INTO chatbots (name, description)
      VALUES (${name}, ${description})
      RETURNING id;
    `
    return NextResponse.json({ message: "Chatbot created", id: result[0].id })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
