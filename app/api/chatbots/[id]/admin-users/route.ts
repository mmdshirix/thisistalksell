import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
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

const userSchema = z.object({
  username: z.string().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  full_name: z.string().optional(),
  email: z.string().email("ایمیل نامعتبر است").optional().or(z.literal("")),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    const users = await sql`
      SELECT id, username, full_name, email, is_active, last_login
      FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "خطا در دریافت لیست مدیران" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    const body = await request.json()
    const validation = userSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { username, password, full_name, email } = validation.data

    const existingUser = await sql`
      SELECT id FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId} AND username = ${username}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "این نام کاربری قبلاً برای این چت‌بات ثبت شده است" }, { status: 409 })
    }

    const passwordHash = simpleHash(password)

    const result = await sql`
      INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email)
      VALUES (${chatbotId}, ${username}, ${passwordHash}, ${full_name || null}, ${email || null})
      RETURNING id, username, full_name, email, is_active, last_login
    `

    return NextResponse.json(
      {
        user: result[0],
        message: "مدیر جدید با موفقیت ایجاد شد",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "خطا در ایجاد مدیر جدید" }, { status: 500 })
  }
}
