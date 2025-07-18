import { Pool } from "pg"
import { neon } from "@neondatabase/serverless"

// Create SQL connection function
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

// Create a singleton pool instance
let pool: Pool | null = null

function createPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const client = createPool()
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
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
  created_at: Date
  updated_at: Date
  appearance: any
  stats_multiplier: number
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
  role: string
  created_at: Date
}

// Database test function
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    console.log("Testing database connection...")
    const result = await query("SELECT NOW() as current_time")
    console.log("Database connection test successful.")
    return {
      success: true,
      message: "Database connection successful",
      data: result.rows[0],
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Database initialization
export async function initializeDatabase() {
  try {
    console.log("🔄 Starting complete database reset...")

    // Step 1: Drop all tables in correct order (reverse of creation)
    const dropTables = [
      "DROP TABLE IF EXISTS admin_users CASCADE",
      "DROP TABLE IF EXISTS tickets CASCADE",
      "DROP TABLE IF EXISTS messages CASCADE",
      "DROP TABLE IF EXISTS products CASCADE",
      "DROP TABLE IF EXISTS faqs CASCADE",
      "DROP TABLE IF EXISTS chatbots CASCADE",
    ]

    for (const dropQuery of dropTables) {
      await sql([dropQuery] as any)
      console.log(`✅ Executed: ${dropQuery}`)
    }

    // Step 2: Create all tables with correct structure
    console.log("🔄 Creating tables...")

    // Create chatbots table
    await query(`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        website_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        appearance JSONB DEFAULT '{}',
        stats_multiplier INTEGER DEFAULT 1
      )
    `)

    console.log("✅ Created chatbots table")

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

    console.log("✅ Created messages table")

    // Create tickets table
    await query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        user_name VARCHAR(255),
        user_phone VARCHAR(50),
        user_email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'medium',
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
        username VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
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

export async function getDatabaseStructure() {
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
    console.error("Get database structure error:", error)
    return {
      success: false,
      message: `Failed to get database structure: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// CRUD operations for chatbots
export async function createChatbot(data: Partial<Chatbot>) {
  try {
    const result = await sql`
      INSERT INTO chatbots (
        name, description, website_url, appearance, stats_multiplier
      ) VALUES (
        ${data.name || "چت‌بات جدید"},
        ${data.description || ""},
        ${data.website_url || ""},
        ${data.appearance || "{}"},
        ${data.stats_multiplier || 1}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating chatbot:", error)
    throw error
  }
}

export async function getChatbot(id: number) {
  try {
    const result = await sql`SELECT * FROM chatbots WHERE id = ${id}`
    return result[0] || null
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
    const result = await sql`SELECT * FROM chatbots ORDER BY created_at DESC`
    return result
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
    const result = await sql`
      UPDATE chatbots SET
        name = ${data.name},
        description = ${data.description},
        website_url = ${data.website_url},
        appearance = ${data.appearance},
        stats_multiplier = ${data.stats_multiplier},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating chatbot:", error)
    throw error
  }
}

export async function deleteChatbot(id: number) {
  try {
    const result = await sql`DELETE FROM chatbots WHERE id = ${id} RETURNING *`
    return result[0] || null
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    throw error
  }
}

// FAQ operations
export async function getChatbotFAQs(chatbotId: number) {
  try {
    const result = await sql`
      SELECT * FROM faqs 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY created_at ASC
    `
    return result
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
    await sql`DELETE FROM faqs WHERE chatbot_id = ${chatbotId}`

    // Insert new FAQs
    if (faqs.length > 0) {
      for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i]
        await sql`
          INSERT INTO faqs (chatbot_id, question, answer)
          VALUES (${chatbotId}, ${faq.question || ""}, ${faq.answer || ""})
        `
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
    const result = await sql`
      SELECT * FROM products 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY created_at ASC
    `
    return result
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
    await sql`DELETE FROM products WHERE chatbot_id = ${chatbotId}`

    // Insert new products
    if (products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        await sql`
          INSERT INTO products (
            chatbot_id, name, description, price, image_url, product_url
          )
          VALUES (
            ${chatbotId}, ${product.name || ""}, ${product.description || ""}, 
            ${product.price || null}, ${product.image_url || null},
            ${product.product_url || null}
          )
        `
      }
    }

    return await getChatbotProducts(chatbotId)
  } catch (error) {
    console.error("Error syncing chatbot products:", error)
    throw error
  }
}

// Message operations
export async function saveChatbotMessage(chatbotId: number, userMessage: string, botResponse: string, userIp: string) {
  try {
    const result = await sql`
      INSERT INTO messages (chatbot_id, user_message, bot_response, user_ip)
      VALUES (${chatbotId}, ${userMessage}, ${botResponse}, ${userIp})
      RETURNING *
    `
    return result[0]
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
}) {
  try {
    const result = await sql`
      INSERT INTO messages (chatbot_id, user_message, bot_response, user_ip)
      VALUES (${payload.chatbot_id}, ${payload.user_message}, ${payload.bot_response || ""}, ${payload.user_ip || ""})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

export async function getChatbotMessages(chatbotId: number, limit = 100) {
  try {
    const result = await sql`
      SELECT * FROM messages 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error getting chatbot messages:", error)
    throw error
  }
}

// Ticket operations
export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">) {
  try {
    const result = await sql`
      INSERT INTO tickets (
        chatbot_id, user_name, user_phone, user_email, subject, message, 
        image_url, status, priority
      )
      VALUES (
        ${ticket.chatbot_id}, ${ticket.user_name}, ${ticket.user_phone}, ${ticket.user_email}, 
        ${ticket.subject}, ${ticket.message}, ${ticket.image_url}, 
        ${ticket.status}, ${ticket.priority}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating ticket:", error)
    throw error
  }
}

export async function getTicketById(ticketId: number) {
  try {
    const result = await sql`SELECT * FROM tickets WHERE id = ${ticketId}`
    return result[0] || null
  } catch (error) {
    console.error("Error getting ticket:", error)
    throw error
  }
}

export async function getChatbotTickets(chatbotId: number) {
  try {
    const result = await sql`SELECT * FROM tickets WHERE chatbot_id = ${chatbotId} ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
}

export async function updateTicketStatus(ticketId: number, status: string): Promise<void> {
  try {
    await sql`UPDATE tickets SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${ticketId}`
  } catch (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }
}

export async function getTicketResponses(ticketId: number) {
  try {
    const result = await sql`
      SELECT * FROM ticket_responses 
      WHERE ticket_id = ${ticketId} 
      ORDER BY created_at ASC
    `
    return result
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    return []
  }
}

export async function addTicketResponse(ticketId: number, response: string, isAdmin = false): Promise<void> {
  try {
    await sql`
      INSERT INTO ticket_responses (ticket_id, message, is_admin) 
      VALUES (${ticketId}, ${response}, ${isAdmin})
    `
  } catch (error) {
    console.error("Error adding ticket response:", error)
    throw error
  }
}

// Admin user operations
export async function getChatbotAdminUsers(chatbotId: number) {
  try {
    const result = await sql`
      SELECT id, chatbot_id, username, role, created_at 
      FROM admin_users 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return []
  }
}

export async function createAdminUser(adminUser: Omit<AdminUser, "id" | "created_at">) {
  try {
    const result = await sql`
      INSERT INTO admin_users (chatbot_id, username, password_hash, role) 
      VALUES (${adminUser.chatbot_id}, ${adminUser.username}, ${adminUser.password_hash}, ${adminUser.role}) 
      RETURNING id, chatbot_id, username, role, created_at
    `
    return result[0]
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw new Error(`Failed to create admin user: ${error}`)
  }
}

export async function updateAdminUser(id: number, updates: Partial<AdminUser>) {
  const fields = Object.keys(updates).filter((key) => key !== "id")
  if (fields.length === 0) return null

  try {
    // Build dynamic update query
    const setClauses = fields.map((field, index) => `${field} = $${index + 2}`).join(", ")
    const params = [id, ...fields.map((field) => updates[field as keyof typeof updates])]

    const result = await sql`
      UPDATE admin_users
      SET ${sql.unsafe(setClauses)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, chatbot_id, username, role, created_at
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating admin user:", error)
    return null
  }
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM admin_users WHERE id = ${id}`
    return true
  } catch (error) {
    console.error(`Error deleting admin user ${id}:`, error)
    return false
  }
}

export async function getAdminUserByUsername(chatbotId: number, username: string) {
  try {
    const result = await sql`
      SELECT * FROM admin_users 
      WHERE chatbot_id = ${chatbotId} AND username = ${username}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching admin user by username:", error)
    return null
  }
}

export async function updateAdminUserLastLogin(id: number): Promise<void> {
  try {
    await sql`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ${id}`
  } catch (error) {
    console.error("Error updating admin user last login:", error)
  }
}
