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

const updateUserSchema = z.object({
  username: z.string().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد").optional(),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").optional().or(z.literal("")),
  full_name: z.string().optional(),
  email: z.string().email("ایمیل نامعتبر است").optional().or(z.literal("")),
  is_active: z.boolean().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const chatbotId = Number(params.id)
    const userId = Number(params.userId)
    if (isNaN(chatbotId) || isNaN(userId)) {
      return NextResponse.json({ error: "آیدی نامعتبر است" }, { status: 400 })
    }

    const body = await request.json()
    const validation = updateUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { username, password, full_name, email, is_active } = validation.data

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (username) {
      // Check for username conflict
      const existingUser = await sql`
        SELECT id FROM chatbot_admin_users 
        WHERE chatbot_id = ${chatbotId} AND username = ${username} AND id != ${userId}
      `
      if (existingUser.length > 0) {
        return NextResponse.json({ error: "این نام کاربری قبلاً استفاده شده است" }, { status: 409 })
      }
      updates.push(`username = $${paramIndex++}`)
      values.push(username)
    }
    if (password) {
      updates.push(`password_hash = $${paramIndex++}`)
      values.push(simpleHash(password))
    }
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`)
      values.push(full_name)
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`)
      values.push(email)
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      values.push(is_active)
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: "هیچ تغییری برای اعمال وجود ندارد" })
    }

    values.push(userId)
    const query = `UPDATE chatbot_admin_users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`

    await sql.unsafe(query, values)

    return NextResponse.json({ message: "کاربر با موفقیت بروزرسانی شد" })
  } catch (error) {
    console.error("Error updating admin user:", error)
    return NextResponse.json({ error: "خطا در بروزرسانی کاربر" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = Number(params.userId)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "آیدی کاربر نامعتبر است" }, { status: 400 })
    }

    await sql`DELETE FROM chatbot_admin_users WHERE id = ${userId}`

    return NextResponse.json({ message: "کاربر با موفقیت حذف شد" })
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return NextResponse.json({ error: "خطا در حذف کاربر" }, { status: 500 })
  }
}
