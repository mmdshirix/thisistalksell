import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { z } from "zod"

// Simple hash function (for development only, use bcrypt in production)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// Generate a secure session token
function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    const body = await request.json()
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "نام کاربری و رمز عبور الزامی است" }, { status: 400 })
    }

    const { username, password } = validation.data

    // 1. Find user
    const users = await sql`
      SELECT id, password_hash FROM chatbot_admin_users
      WHERE chatbot_id = ${chatbotId} AND username = ${username} AND is_active = TRUE
    `
    if (users.length === 0) {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است" }, { status: 401 })
    }
    const user = users[0]

    // 2. Check password
    const passwordHash = simpleHash(password)
    if (user.password_hash !== passwordHash) {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است" }, { status: 401 })
    }

    // 3. Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    await sql`
      INSERT INTO chatbot_admin_sessions (user_id, session_token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `

    // 4. Set cookie
    cookies().set(`auth_token_${chatbotId}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    })

    // 5. Update last_login
    await sql`UPDATE chatbot_admin_users SET last_login = NOW() WHERE id = ${user.id}`

    return NextResponse.json({ message: "ورود با موفقیت انجام شد" })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
  }
}
