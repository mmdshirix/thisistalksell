import { Pool, type PoolClient } from "pg"
import { neon } from "@neondatabase/serverless"

// Global connection pool
let pool: Pool | null = null

// Initialize connection pool
function initializePool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: false, // Disable SSL for local/development
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
    })
  }
  return pool
}

// Get database connection
export async function getDb(): Promise<PoolClient> {
  const pool = initializePool()
  return await pool.connect()
}

// Execute query with automatic connection management
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getDb()
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
  placeholder_text: string
  position: string
  size: string
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
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Testing database connection...")
    const result = await query("SELECT NOW() as current_time, version() as version")
    console.log("Database connection successful:", result.rows[0])
    return {
      success: true,
      message: `Database connected successfully at ${result.rows[0].current_time}`,
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔄 Initializing database...")

    // Create chatbots table
    await query(`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        website_url VARCHAR(500),
        primary_color VARCHAR(7) DEFAULT '#3B82F6',
        secondary_color VARCHAR(7) DEFAULT '#1E40AF',
        welcome_message TEXT DEFAULT 'سلام! چطور می‌تونم کمکتون کنم؟',
        placeholder_text VARCHAR(255) DEFAULT 'پیام خود را بنویسید...',
        position VARCHAR(20) DEFAULT 'bottom-right',
        size VARCHAR(20) DEFAULT 'medium',
        stats_multiplier INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Created chatbots table")

    // Create messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        user_ip VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Created messages table")

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
    console.log("✅ Created faqs table")

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
    console.log("✅ Created products table")

    // Create tickets table
    await query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        user_name VARCHAR(255) NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        user_email VARCHAR(255),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Created tickets table")

    // Create admin_users table
    await query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chatbot_id, username)
      )
    `)
    console.log("✅ Created admin_users table")

    console.log("🎉 Database initialization completed successfully!")
    return {
      success: true,
      message: "Database initialized successfully",
    }
  } catch (error) {
    console.error("Database initialization error:", error)
    return {
      success: false,
      message: `Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
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
export async function createChatbot(data: Partial<Chatbot>) {
  try {
    const result = await query(
      `
      INSERT INTO chatbots (
        name, description, website_url, primary_color, secondary_color, 
        welcome_message, placeholder_text, position, size, stats_multiplier
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
      [
        data.name || "چت‌بات جدید",
        data.description || "",
        data.website_url || "",
        data.primary_color || "#3B82F6",
        data.secondary_color || "#1E40AF",
        data.welcome_message || "سلام! چطور می‌تونم کمکتون کنم؟",
        data.placeholder_text || "پیام خود را بنویسید...",
        data.position || "bottom-right",
        data.size || "medium",
        data.stats_multiplier || 1,
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error creating chatbot:", error)
    throw error
  }
}

export async function getChatbot(id: number) {
  try {
    const result = await query("SELECT * FROM chatbots WHERE id = $1", [id])
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting chatbot:", error)
    throw error
  }
}

export async function getChatbotById(id: number) {
  return getChatbot(id)
}

export async function getAllChatbots() {
  try {
    const result = await query("SELECT * FROM chatbots ORDER BY created_at DESC")
    return result.rows
  } catch (error) {
    console.error("Error getting all chatbots:", error)
    throw error
  }
}

export async function getChatbots() {
  return getAllChatbots()
}

export async function updateChatbot(id: number, data: Partial<Chatbot>) {
  try {
    const result = await query(
      `
      UPDATE chatbots SET
        name = $2,
        description = $3,
        website_url = $4,
        primary_color = $5,
        secondary_color = $6,
        welcome_message = $7,
        placeholder_text = $8,
        position = $9,
        size = $10,
        stats_multiplier = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
      [
        id,
        data.name,
        data.description,
        data.website_url,
        data.primary_color,
        data.secondary_color,
        data.welcome_message,
        data.placeholder_text,
        data.position,
        data.size,
        data.stats_multiplier,
      ],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Error updating chatbot:", error)
    throw error
  }
}

export async function deleteChatbot(id: number) {
  try {
    const result = await query("DELETE FROM chatbots WHERE id = $1 RETURNING *", [id])
    return result.rows[0] || null
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    throw error
  }
}

// FAQ operations
export async function getChatbotFAQs(chatbotId: number) {
  try {
    const result = await query("SELECT * FROM faqs WHERE chatbot_id = $1 ORDER BY created_at ASC", [chatbotId])
    return result.rows
  } catch (error) {
    console.error("Error getting chatbot FAQs:", error)
    throw error
  }
}

export async function getFAQsByChatbotId(chatbotId: number) {
  return getChatbotFAQs(chatbotId)
}

export async function syncChatbotFAQs(chatbotId: number, faqs: Partial<ChatbotFAQ>[]) {
  try {
    // Delete existing FAQs
    await query("DELETE FROM faqs WHERE chatbot_id = $1", [chatbotId])

    // Insert new FAQs
    if (faqs.length > 0) {
      for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i]
        await query("INSERT INTO faqs (chatbot_id, question, answer) VALUES ($1, $2, $3)", [
          chatbotId,
          faq.question || "",
          faq.answer || "",
        ])
      }
    }

    return await getChatbotFAQs(chatbotId)
  } catch (error) {
    console.error("Error syncing chatbot FAQs:", error)
    throw error
  }
}

// Product operations
export async function getChatbotProducts(chatbotId: number) {
  try {
    const result = await query("SELECT * FROM products WHERE chatbot_id = $1 ORDER BY created_at ASC", [chatbotId])
    return result.rows
  } catch (error) {
    console.error("Error getting chatbot products:", error)
    throw error
  }
}

export async function getProductsByChatbotId(chatbotId: number) {
  return getChatbotProducts(chatbotId)
}

export async function syncChatbotProducts(chatbotId: number, products: Partial<ChatbotProduct>[]) {
  try {
    // Delete existing products
    await query("DELETE FROM products WHERE chatbot_id = $1", [chatbotId])

    // Insert new products
    if (products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        await query(
          "INSERT INTO products (chatbot_id, name, description, price, image_url, product_url) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            chatbotId,
            product.name || "",
            product.description || "",
            product.price || null,
            product.image_url || null,
            product.product_url || null,
          ],
        )
      }
    }

    return await getChatbotProducts(chatbotId)
  } catch (error) {
    console.error("Error syncing chatbot products:", error)
    throw error
  }
}

// Message operations
export async function saveChatbotMessage(
  chatbotId: number,
  userMessage: string,
  botResponse: string,
  userIp: string,
  userAgent: string,
) {
  try {
    const result = await query(
      "INSERT INTO messages (chatbot_id, user_message, bot_response, user_ip, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [chatbotId, userMessage, botResponse, userIp, userAgent],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error saving chatbot message:", error)
    throw error
  }
}

export async function saveMessage(payload: {
  chatbot_id: number
  user_message: string
  bot_response?: string | null
  user_ip?: string | null
  user_agent?: string | null
}) {
  try {
    const result = await query(
      "INSERT INTO messages (chatbot_id, user_message, bot_response, user_ip, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        payload.chatbot_id,
        payload.user_message,
        payload.bot_response || "",
        payload.user_ip || "",
        payload.user_agent || "",
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

export async function getChatbotMessages(chatbotId: number, limit = 100) {
  try {
    const result = await query("SELECT * FROM messages WHERE chatbot_id = $1 ORDER BY created_at DESC LIMIT $2", [
      chatbotId,
      limit,
    ])
    return result.rows
  } catch (error) {
    console.error("Error getting chatbot messages:", error)
    return []
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
