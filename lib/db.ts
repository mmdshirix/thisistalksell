import { Pool, type PoolClient } from "pg"
import { neon } from "@neondatabase/serverless"

// Global connection pool
let pool: Pool | null = null

// Initialize connection pool
function createPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

// Get database connection
export async function getDbConnection(): Promise<PoolClient> {
  const pool = createPool()
  return await pool.connect()
}

// Execute query with automatic connection management
export async function query(text: string, params?: any[]) {
  const client = await getDbConnection()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Create SQL connection function for Neon
function createSqlConnection() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(databaseUrl)
}

// Lazy SQL instance
let sqlInstance: ReturnType<typeof neon> | null = null

function getSql() {
  if (!sqlInstance) {
    sqlInstance = createSqlConnection()
  }
  return sqlInstance
}

// Export SQL function
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const sqlFn = getSql()
  return sqlFn(strings, ...values)
}

// Types
export interface Chatbot {
  id: number
  name: string
  description: string
  website_url: string
  primary_color: string
  secondary_color: string
  welcome_message: string
  position: string
  stats_multiplier: number
  created_at: Date
  updated_at: Date
}

export interface ChatbotFAQ {
  id: number
  chatbot_id: number
  question: string
  answer: string
  created_at: Date
}

export interface ChatbotProduct {
  id: number
  chatbot_id: number
  name: string
  description: string
  price: number | null
  image_url: string
  product_url: string
  created_at: Date
}

export interface ChatbotMessage {
  id: number
  chatbot_id: number
  user_message: string
  bot_response: string
  user_ip: string
  user_agent: string
  created_at: Date
}

export interface Ticket {
  id: number
  chatbot_id: number
  user_name: string
  user_phone: string
  user_email: string
  subject: string
  message: string
  status: string
  priority: string
  image_url: string
  created_at: Date
  updated_at: Date
}

export interface AdminUser {
  id: number
  chatbot_id: number
  username: string
  password_hash: string
  email: string
  role: string
  is_active: boolean
  created_at: Date
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const result = await query("SELECT NOW() as current_time")
    return {
      success: true,
      message: "اتصال به دیتابیس موفقیت‌آمیز بود",
      data: result.rows[0],
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      success: false,
      message: `خطا در اتصال به دیتابیس: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
    }
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create chatbots table
    await query(`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        website_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        stats_multiplier INTEGER DEFAULT 1,
        primary_color VARCHAR(7) DEFAULT '#3B82F6',
        secondary_color VARCHAR(7) DEFAULT '#1E40AF',
        position VARCHAR(20) DEFAULT 'bottom-right',
        welcome_message TEXT DEFAULT 'سلام! چطور می‌تونم کمکتون کنم؟'
      )
    `)

    // Create faqs table
    await query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create products table
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        image_url VARCHAR(500),
        product_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        user_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create tickets table
    await query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        user_name VARCHAR(255),
        user_phone VARCHAR(20),
        user_email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(10) DEFAULT 'medium',
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create admin_users table
    await query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    return {
      success: true,
      message: "دیتابیس با موفقیت راه‌اندازی شد",
    }
  } catch (error) {
    console.error("Database initialization error:", error)
    return {
      success: false,
      message: `خطا در راه‌اندازی دیتابیس: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
    }
  }
}

// Get database structure
export async function getDatabaseStructure(): Promise<any> {
  try {
    const result = await query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `)

    return {
      success: true,
      data: result.rows,
    }
  } catch (error) {
    console.error("Error getting database structure:", error)
    return {
      success: false,
      message: `Error getting database structure: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Close database connection
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// CRUD operations for chatbots
export async function getAllChatbots() {
  try {
    const chatbots = await sql`SELECT id, name, primary_color, created_at FROM chatbots ORDER BY created_at DESC`
    return { success: true, data: chatbots }
  } catch (error) {
    console.error("Database Error (getAllChatbots):", error)
    return { success: false, message: "Failed to fetch chatbots.", data: [] }
  }
}

export async function getChatbotById(id: number) {
  try {
    const result = await sql`SELECT * FROM chatbots WHERE id = ${id}`
    if (result.length === 0) {
      return { success: false, message: "Chatbot not found." }
    }
    return { success: true, data: result[0] }
  } catch (error) {
    console.error(`Database Error (getChatbotById: ${id}):`, error)
    return { success: false, message: "Failed to fetch chatbot." }
  }
}

export async function createChatbot(name: string) {
  try {
    const result = await sql`INSERT INTO chatbots (name) VALUES (${name}) RETURNING *`
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Database Error (createChatbot):", error)
    return { success: false, message: "Failed to create chatbot." }
  }
}

export async function updateChatbot(id: number, data: any) {
  try {
    // Remove id and undefined values
    const updateData = { ...data }
    delete updateData.id
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key])

    if (Object.keys(updateData).length === 0) {
      return { success: true, message: "No changes to update." }
    }

    const result = await sql`UPDATE chatbots SET ${sql(updateData)} WHERE id = ${id} RETURNING *`
    if (result.length === 0) {
      return { success: false, message: "Chatbot not found." }
    }
    return { success: true, data: result[0] }
  } catch (error) {
    console.error(`Database Error (updateChatbot: ${id}):`, error)
    return { success: false, message: "Failed to update chatbot." }
  }
}

export async function deleteChatbot(id: number) {
  try {
    await sql`DELETE FROM chatbots WHERE id = ${id}`
    return { success: true, message: "Chatbot deleted successfully." }
  } catch (error) {
    console.error(`Database Error (deleteChatbot: ${id}):`, error)
    return { success: false, message: "Failed to delete chatbot." }
  }
}

// FAQ operations
export async function getChatbotFAQs(chatbotId: number) {
  try {
    const result = await query("SELECT * FROM faqs WHERE chatbot_id = $1 ORDER BY created_at DESC", [chatbotId])
    return {
      success: true,
      data: result.rows || [],
    }
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return {
      success: false,
      data: [],
      message: `خطا در دریافت سوالات متداول: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
    }
  }
}

export async function addChatbotFAQ(chatbotId: number, question: string, answer: string) {
  try {
    const result = await query(
      `
      INSERT INTO faqs (chatbot_id, question, answer)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [chatbotId, question, answer],
    )

    return {
      success: true,
      data: result.rows[0],
      message: "سوال متداول با موفقیت اضافه شد",
    }
  } catch (error) {
    console.error("Error adding FAQ:", error)
    return {
      success: false,
      message: `خطا در اضافه کردن سوال متداول: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
    }
  }
}

// Product operations
export async function getChatbotProducts(chatbotId: number) {
  try {
    const result = await query("SELECT * FROM products WHERE chatbot_id = $1 ORDER BY created_at DESC", [chatbotId])
    return {
      success: true,
      data: result.rows || [],
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      success: false,
      data: [],
      message: `خطا در دریافت محصولات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
    }
  }
}

export async function addChatbotProduct(
  chatbotId: number,
  data: {
    name: string
    description?: string
    price?: number
    image_url?: string
    product_url?: string
  },
) {
  try {
    const result = await query(
      `
      INSERT INTO products (chatbot_id, name, description, price, image_url, product_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [chatbotId, data.name, data.description, data.price, data.image_url, data.product_url],
    )

    return {
      success: true,
      data: result.rows[0],
      message: "محصول با موفقیت اضافه شد",
    }
  } catch (error) {
    console.error("Error adding product:", error)
    return {
      success: false,
      message: `خطا در اضافه کردن محصول: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
    }
  }
}

// Message operations
export async function saveChatMessage(chatbotId: number, userMessage: string, botResponse: string, userIp?: string) {
  try {
    const result = await query(
      `
      INSERT INTO messages (chatbot_id, user_message, bot_response, user_ip)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [chatbotId, userMessage, botResponse, userIp],
    )

    return {
      success: true,
      data: result.rows[0],
    }
  } catch (error) {
    console.error("Error saving message:", error)
    return {
      success: false,
      message: `خطا در ذخیره پیام: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
    }
  }
}

// Ticket operations
export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">) {
  try {
    const result = await query(
      `
      INSERT INTO tickets (
        chatbot_id, user_name, user_phone, user_email, subject, message, 
        image_url, status, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        ticket.chatbot_id,
        ticket.user_name,
        ticket.user_phone,
        ticket.user_email,
        ticket.subject,
        ticket.message,
        ticket.image_url,
        ticket.status,
        ticket.priority,
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error creating ticket:", error)
    throw error
  }
}

export async function getTicketById(ticketId: number) {
  try {
    const result = await query("SELECT * FROM tickets WHERE id = $1", [ticketId])
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting ticket:", error)
    return null
  }
}

export async function getChatbotTickets(chatbotId: number) {
  try {
    const result = await query("SELECT * FROM tickets WHERE chatbot_id = $1 ORDER BY created_at DESC", [chatbotId])
    return result.rows
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
}

export async function updateTicketStatus(ticketId: number, status: string): Promise<void> {
  try {
    await query("UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [status, ticketId])
  } catch (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }
}

export async function getTicketResponses(ticketId: number) {
  try {
    const result = await query("SELECT * FROM ticket_responses WHERE ticket_id = $1 ORDER BY created_at ASC", [
      ticketId,
    ])
    return result.rows
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    return []
  }
}

export async function addTicketResponse(ticketId: number, response: string, isAdmin = false): Promise<void> {
  try {
    await query("INSERT INTO ticket_responses (ticket_id, message, is_admin) VALUES ($1, $2, $3)", [
      ticketId,
      response,
      isAdmin,
    ])
  } catch (error) {
    console.error("Error adding ticket response:", error)
    throw error
  }
}

// Admin user operations
export async function getChatbotAdminUsers(chatbotId: number) {
  try {
    const result = await query(
      "SELECT id, chatbot_id, username, email, role, is_active, created_at FROM admin_users WHERE chatbot_id = $1 ORDER BY created_at DESC",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return []
  }
}

export async function createAdminUser(adminUser: Omit<AdminUser, "id" | "created_at">) {
  try {
    const result = await query(
      "INSERT INTO admin_users (chatbot_id, username, password_hash, email, role, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, chatbot_id, username, email, role, is_active, created_at",
      [
        adminUser.chatbot_id,
        adminUser.username,
        adminUser.password_hash,
        adminUser.email,
        adminUser.role,
        adminUser.is_active,
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw new Error(`Failed to create admin user: ${error}`)
  }
}

export async function updateAdminUser(id: number, updates: Partial<AdminUser>) {
  const fields = Object.keys(updates).filter((key) => key !== "id")
  if (fields.length === 0) return null

  try {
    const setClauses = fields.map((field, index) => `${field} = $${index + 2}`).join(", ")
    const params = [id, ...fields.map((field) => updates[field as keyof typeof updates])]

    const result = await query(
      `UPDATE admin_users SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, chatbot_id, username, email, role, is_active, created_at`,
      params,
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Error updating admin user:", error)
    return null
  }
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  try {
    await query("DELETE FROM admin_users WHERE id = $1", [id])
    return true
  } catch (error) {
    console.error(`Error deleting admin user ${id}:`, error)
    return false
  }
}

export async function getAdminUserByUsername(chatbotId: number, username: string) {
  try {
    const result = await query("SELECT * FROM admin_users WHERE chatbot_id = $1 AND username = $2", [
      chatbotId,
      username,
    ])
    return result.rows[0] || null
  } catch (error) {
    console.error("Error fetching admin user by username:", error)
    return null
  }
}

export async function updateAdminUserLastLogin(id: number): Promise<void> {
  try {
    await query("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [id])
  } catch (error) {
    console.error("Error updating admin user last login:", error)
  }
}

// Get chatbot statistics
export async function getChatbotStats(chatbotId: number) {
  try {
    const messagesResult = await query("SELECT COUNT(*) as count FROM messages WHERE chatbot_id = $1", [chatbotId])
    const ticketsResult = await query("SELECT COUNT(*) as count FROM tickets WHERE chatbot_id = $1", [chatbotId])

    return {
      success: true,
      data: {
        totalMessages: Number.parseInt(messagesResult.rows[0].count),
        totalTickets: Number.parseInt(ticketsResult.rows[0].count),
      },
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      success: false,
      message: `خطا در دریافت آمار: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
    }
  }
}

// Widget settings operations
export async function getWidgetSettings(id: number) {
  try {
    const result = await sql`
      SELECT 
        id, name, welcome_message, navigation_message, primary_color, 
        text_color, background_color, chat_icon, position, margin_x, margin_y
      FROM chatbots WHERE id = ${id}`

    if (result.length === 0) return { success: false }

    const faqs = await sql`SELECT question, answer, emoji FROM faqs WHERE chatbot_id = ${id} ORDER BY position`
    const products =
      await sql`SELECT name, description, price, image_url, product_url, button_text, secondary_text FROM products WHERE chatbot_id = ${id} ORDER BY position`

    return {
      success: true,
      data: {
        settings: result[0],
        faqs,
        products,
      },
    }
  } catch (error) {
    console.error(`Database Error (getWidgetSettings: ${id}):`, error)
    return { success: false }
  }
}
