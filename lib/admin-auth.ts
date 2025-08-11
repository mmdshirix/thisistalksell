import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import { sql } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface AdminUser {
  id: number
  chatbot_id: number
  username: string
  full_name: string | null
  email: string | null
  is_active: boolean
  last_login: string | null
}

export interface AdminTokenPayload {
  userId: number
  chatbotId: number
  username: string
  iat?: number
  exp?: number
}

// Simple hash function (for development - use bcrypt in production)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// Generate admin token
export function generateAdminToken(user: AdminUser): string {
  const payload: AdminTokenPayload = {
    userId: user.id,
    chatbotId: user.chatbot_id,
    username: user.username,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
    issuer: "chatbot-admin",
    audience: "chatbot-admin-panel",
  })
}

// Verify admin token
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "chatbot-admin",
      audience: "chatbot-admin-panel",
    }) as AdminTokenPayload

    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Create admin user
export async function createAdminUser(data: {
  chatbot_id: number
  username: string
  password: string
  full_name?: string
  email?: string
}): Promise<AdminUser> {
  const passwordHash = await bcryptjs.hash(data.password, 10)

  try {
    const result = await sql`
      INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email)
      VALUES (${data.chatbot_id}, ${data.username}, ${passwordHash}, ${data.full_name || null}, ${data.email || null})
      RETURNING id, chatbot_id, username, full_name, email, is_active, last_login
    `

    return result.rows[0] as AdminUser
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw new Error("Failed to create admin user")
  }
}

// Authenticate admin user
export async function authenticateAdmin(
  chatbotId: number,
  username: string,
  password: string,
): Promise<AdminUser | null> {
  try {
    const result = await sql`
      SELECT id, chatbot_id, username, password_hash, full_name, email, is_active, last_login
      FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId} AND username = ${username} AND is_active = true
    `

    if (result.rows.length === 0) return null

    const user = result.rows[0]

    const isValidPassword = await bcryptjs.compare(password, user.password_hash)
    if (!isValidPassword) return null

    // Update last login
    await sql`
      UPDATE chatbot_admin_users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `

    return {
      id: user.id,
      chatbot_id: user.chatbot_id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      is_active: user.is_active,
      last_login: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error authenticating admin:", error)
    return null
  }
}

// Get admin users for chatbot
export async function getAdminUsers(chatbotId: number): Promise<AdminUser[]> {
  try {
    const result = await sql`
      SELECT id, chatbot_id, username, full_name, email, is_active, last_login
      FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
    `

    return result.rows as AdminUser[]
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return []
  }
}

// Update admin user
export async function updateAdminUser(
  id: number,
  data: Partial<{
    username: string
    password: string
    full_name: string
    email: string
    is_active: boolean
  }>,
): Promise<boolean> {
  try {
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.username) {
      updates.push(`username = $${paramIndex}`)
      values.push(data.username)
      paramIndex++
    }

    if (data.password) {
      const passwordHash = await bcryptjs.hash(data.password, 10)
      updates.push(`password_hash = $${paramIndex}`)
      values.push(passwordHash)
      paramIndex++
    }

    if (data.full_name !== undefined) {
      updates.push(`full_name = $${paramIndex}`)
      values.push(data.full_name)
      paramIndex++
    }

    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex}`)
      values.push(data.email)
      paramIndex++
    }

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`)
      values.push(data.is_active)
      paramIndex++
    }

    if (updates.length === 0) return false

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `UPDATE chatbot_admin_users SET ${updates.join(", ")} WHERE id = $${paramIndex}`

    await sql.query(query, values)
    return true
  } catch (error) {
    console.error("Error updating admin user:", error)
    return false
  }
}

// Delete admin user
export async function deleteAdminUser(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM chatbot_admin_users WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return false
  }
}

// Get current admin user from token
export async function getCurrentAdminUser(token?: string): Promise<AdminUser | null> {
  if (!token) return null

  const decoded = verifyAdminToken(token)
  if (!decoded) return null

  try {
    const result = await sql`
      SELECT id, chatbot_id, username, full_name, email, is_active, last_login
      FROM chatbot_admin_users 
      WHERE id = ${decoded.userId} AND is_active = true
    `

    return result.rows.length > 0 ? (result.rows[0] as AdminUser) : null
  } catch (error) {
    console.error("Error getting current admin user:", error)
    return null
  }
}

// Refresh admin token
export async function refreshAdminToken(oldToken: string): Promise<string | null> {
  const decoded = verifyAdminToken(oldToken)
  if (!decoded) return null

  const user = await getCurrentAdminUser(oldToken)
  if (!user) return null

  return generateAdminToken(user)
}
