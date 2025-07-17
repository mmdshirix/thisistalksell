import { Pool, type QueryResult } from "pg"
import { unstable_noStore as noStore } from "next/cache"

// --- TYPE DEFINITIONS ---
export interface Chatbot {
  id: number
  name: string
  created_at: string
  updated_at: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  margin_x: number
  margin_y: number
  deepseek_api_key: string | null
  welcome_message: string
  navigation_message: string
  knowledge_base_text: string | null
  knowledge_base_url: string | null
  store_url: string | null
  ai_url: string | null
  stats_multiplier: number
}

export interface ChatbotMessage {
  id: number
  chatbot_id: number
  user_message: string
  bot_response: string | null
  timestamp: string
  user_ip: string | null
  user_agent: string | null
}

export interface ChatbotFAQ {
  id: number
  chatbot_id: number
  question: string
  answer: string | null
  emoji: string | null
  position: number
}

export interface ChatbotProduct {
  id: number
  chatbot_id: number
  name: string
  description: string | null
  image_url: string | null
  price: number | null
  position: number
  button_text: string
  secondary_text: string
  product_url: string | null
}

export interface ChatbotOption {
  id: number
  chatbot_id: number
  label: string
  emoji: string | null
  position: number
}

export interface Ticket {
  id: number
  chatbot_id: number
  name: string
  email: string
  phone: string | null
  user_ip: string | null
  user_agent: string | null
  subject: string
  message: string
  image_url: string | null
  status: "open" | "closed" | "pending" | "in_progress" | "resolved"
  priority: "low" | "normal" | "high"
  created_at: string
  updated_at: string
}

export interface TicketResponse {
  id: number
  ticket_id: number
  message: string
  is_admin: boolean
  created_at: string
}

export interface AdminUser {
  id: number
  chatbot_id: number
  username: string
  password_hash: string
  full_name: string | null
  email: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

interface SaveMessagePayload {
  chatbot_id: number
  user_message: string
  bot_response?: string | null
  user_ip?: string | null
  user_agent?: string | null
}

// --- LOGGING SYSTEM ---
class ConnectionLogger {
  private logs: { timestamp: Date; message: string; type: "INFO" | "ERROR" }[] = []
  private readonly maxSize = 100

  log(message: string) {
    if (this.logs.length >= this.maxSize) {
      this.logs.shift() // Remove the oldest log
    }
    const logEntry = { timestamp: new Date(), message, type: "INFO" as const }
    this.logs.push(logEntry)
    console.log(`[DB LOG] ${logEntry.timestamp.toISOString()}: ${message}`)
  }

  error(message: string, error?: any) {
    if (this.logs.length >= this.maxSize) {
      this.logs.shift()
    }
    const errorMessage = error ? `${message}: ${error.toString()}` : message
    const logEntry = { timestamp: new Date(), message: errorMessage, type: "ERROR" as const }
    this.logs.push(logEntry)
    console.error(`[DB ERROR] ${logEntry.timestamp.toISOString()}: ${errorMessage}`)
  }

  getLogs() {
    return [...this.logs].reverse() // Return a copy, newest first
  }
}

export const dbLogger = new ConnectionLogger()

// --- DATABASE CONNECTION ---
let pool: Pool | null = null

function getSSLConfig() {
  // Check if SSL should be disabled
  if (process.env.DB_SSL === "false" || process.env.DATABASE_SSL === "false") {
    return false
  }

  // For local development, typically no SSL
  if (process.env.NODE_ENV === "development") {
    return false
  }

  // For production, try SSL with flexible settings
  if (process.env.NODE_ENV === "production") {
    return { rejectUnauthorized: false }
  }

  return false
}

async function createPoolWithFallback() {
  if (!process.env.DATABASE_URL) {
    dbLogger.error("DATABASE_URL environment variable is not set.")
    return null
  }

  const baseConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  }

  // First try with SSL configuration
  try {
    const sslConfig = getSSLConfig()
    dbLogger.log(`Attempting database connection with SSL: ${JSON.stringify(sslConfig)}`)

    const poolWithSSL = new Pool({
      ...baseConfig,
      ssl: sslConfig,
    })

    // Test the connection
    const client = await poolWithSSL.connect()
    await client.query("SELECT NOW()")
    client.release()

    dbLogger.log("Database connection successful with SSL configuration")
    return poolWithSSL
  } catch (sslError) {
    dbLogger.log(`SSL connection failed: ${sslError.message}. Trying without SSL...`)

    // If SSL fails, try without SSL
    try {
      const poolWithoutSSL = new Pool({
        ...baseConfig,
        ssl: false,
      })

      // Test the connection
      const client = await poolWithoutSSL.connect()
      await client.query("SELECT NOW()")
      client.release()

      dbLogger.log("Database connection successful without SSL")
      return poolWithoutSSL
    } catch (noSslError) {
      dbLogger.error("Database connection failed both with and without SSL", noSslError)
      return null
    }
  }
}

function initializePool() {
  if (pool) {
    return pool
  }

  // We'll create the pool asynchronously when first needed
  return null
}

async function getPool() {
  if (pool) {
    return pool
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.")
  }

  try {
    pool = await createPoolWithFallback()

    if (pool) {
      pool.on("connect", () => {
        dbLogger.log("New client connected to the database")
      })

      pool.on("error", (err) => {
        dbLogger.error("Database pool error", err)
        // Reset pool on error so it can be recreated
        pool = null
      })

      dbLogger.log("Database pool initialized successfully")
    }

    return pool
  } catch (error) {
    dbLogger.error("Failed to initialize database pool", error)
    pool = null
    throw error
  }
}

// Helper function to execute queries
async function executeQuery(text: string, params: any[] = []): Promise<any[]> {
  const currentPool = await getPool()

  if (!currentPool) {
    throw new Error("Database connection not available")
  }

  const start = Date.now()
  try {
    const res = await currentPool.query(text, params)
    const duration = Date.now() - start
    dbLogger.log(`Query executed: ${duration}ms, rows: ${res.rowCount}`)
    return res.rows
  } catch (error) {
    dbLogger.error(`Query failed: ${text.substring(0, 100)}...`, error)
    throw error
  }
}

// Legacy query function for compatibility
async function query<T>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  const currentPool = await getPool()

  if (!currentPool) {
    throw new Error("Database connection not available")
  }

  const start = Date.now()
  try {
    const res = await currentPool.query<T>(text, params)
    const duration = Date.now() - start
    dbLogger.log(`Query executed: ${duration}ms, rows: ${res.rowCount}`)
    return res
  } catch (error) {
    dbLogger.error(`Query failed: ${text.substring(0, 100)}...`, error)
    throw error
  }
}

// SQL Template Literal Function
export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  let queryText = strings[0]
  const params: any[] = []

  for (let i = 0; i < values.length; i++) {
    params.push(values[i])
    queryText += `$${params.length}${strings[i + 1]}`
  }

  return executeQuery(queryText, params)
}

sql.unsafe = (queryText: string, params: any[] = []): Promise<any[]> => executeQuery(queryText, params)

// --- DATABASE FUNCTIONS ---

export async function testDatabaseConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    dbLogger.log("Testing database connection...")
    const currentPool = await getPool()

    if (!currentPool) {
      return { success: false, message: "اتصال به دیتابیس در دسترس نیست" }
    }

    const result = await query("SELECT NOW() as now, version() as version")
    dbLogger.log("Database connection test successful.")
    return {
      success: true,
      message: "اتصال به دیتابیس PostgreSQL موفق",
      data: result.rows[0],
    }
  } catch (error: any) {
    dbLogger.error("Database connection test failed.", error)
    return {
      success: false,
      message: `خطا در اتصال: ${error.message}`,
    }
  }
}

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const currentPool = await getPool()
    if (!currentPool) {
      return { success: false, message: "اتصال به دیتابیس در دسترس نیست" }
    }

    dbLogger.log("Initializing database tables...")

    // Create tables in correct order to avoid foreign key issues
    const queries = [
      // 1. Create chatbots table first (no dependencies)
      `CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        primary_color VARCHAR(50) DEFAULT '#14b8a6',
        text_color VARCHAR(50) DEFAULT '#ffffff',
        background_color VARCHAR(50) DEFAULT '#f3f4f6',
        chat_icon TEXT DEFAULT '💬',
        position VARCHAR(50) DEFAULT 'bottom-right',
        margin_x INTEGER DEFAULT 20,
        margin_y INTEGER DEFAULT 20,
        deepseek_api_key TEXT,
        welcome_message TEXT DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟',
        navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟',
        knowledge_base_text TEXT,
        knowledge_base_url TEXT,
        store_url TEXT,
        ai_url TEXT,
        stats_multiplier NUMERIC(5, 2) DEFAULT 1.0
      )`,

      // 2. Create dependent tables
      `CREATE TABLE IF NOT EXISTS chatbot_messages (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        user_message TEXT NOT NULL,
        bot_response TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_ip VARCHAR(50),
        user_agent TEXT
      )`,

      `CREATE TABLE IF NOT EXISTS chatbot_faqs (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT,
        emoji VARCHAR(10) DEFAULT '❓',
        position INTEGER DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS chatbot_products (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        price DECIMAL(10, 2),
        position INTEGER DEFAULT 0,
        button_text VARCHAR(100) DEFAULT 'خرید',
        secondary_text VARCHAR(100) DEFAULT 'جزئیات',
        product_url TEXT
      )`,

      `CREATE TABLE IF NOT EXISTS chatbot_options (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        label VARCHAR(255) NOT NULL,
        emoji TEXT,
        position INTEGER NOT NULL DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        user_ip VARCHAR(50),
        user_agent TEXT,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        image_url TEXT,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'normal',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS ticket_responses (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS chatbot_admin_users (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        username VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES chatbot_admin_users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_chatbot_id ON chatbot_faqs(chatbot_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chatbot_products_chatbot_id ON chatbot_products(chatbot_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chatbot_options_chatbot_id ON chatbot_options(chatbot_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chatbot_messages_chatbot_id ON chatbot_messages(chatbot_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chatbot_messages_timestamp ON chatbot_messages(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_tickets_chatbot_id ON tickets(chatbot_id)`,
      `CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket_id ON ticket_responses(ticket_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chatbot_admin_users_chatbot_id ON chatbot_admin_users(chatbot_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chatbot_admin_users_username ON chatbot_admin_users(username)`,
      `CREATE INDEX IF NOT EXISTS idx_chatbot_admin_sessions_user_id ON chatbot_admin_sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chatbot_admin_sessions_token ON chatbot_admin_sessions(session_token)`,
    ]

    // Execute queries one by one
    for (const queryText of queries) {
      try {
        await query(queryText)
        dbLogger.log(`Successfully executed: ${queryText.substring(0, 50)}...`)
      } catch (error) {
        dbLogger.error(`Failed to execute query: ${queryText.substring(0, 50)}...`, error)
        throw error
      }
    }

    dbLogger.log("Database tables initialized successfully")
    return { success: true, message: "دیتابیس PostgreSQL با موفقیت راه‌اندازی شد" }
  } catch (error: any) {
    dbLogger.error("Database initialization error:", error)
    return { success: false, message: `خطا در راه‌اندازی دیتابیس: ${error.message}` }
  }
}

// Chatbot Functions
export async function getAllChatbots(): Promise<Chatbot[]> {
  try {
    const result = await query<Chatbot>("SELECT * FROM chatbots ORDER BY created_at DESC")
    return result.rows
  } catch (error) {
    dbLogger.error("Error fetching chatbots:", error)
    return []
  }
}

export async function getChatbots(): Promise<Chatbot[]> {
  return getAllChatbots()
}

export async function getChatbot(id: number): Promise<Chatbot | null> {
  try {
    const result = await query<Chatbot>(
      "SELECT *, COALESCE(stats_multiplier, 1.0) as stats_multiplier FROM chatbots WHERE id = $1",
      [id],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    dbLogger.error(`Error fetching chatbot ${id}:`, error)
    return null
  }
}

export async function getChatbotById(id: number): Promise<Chatbot | null> {
  noStore()
  return getChatbot(id)
}

export async function createChatbot(data: {
  name: string
  welcome_message?: string
  navigation_message?: string
  primary_color?: string
  text_color?: string
  background_color?: string
  chat_icon?: string
  position?: string
  margin_x?: number
  margin_y?: number
  deepseek_api_key?: string
  knowledge_base_text?: string
  knowledge_base_url?: string
  store_url?: string
  ai_url?: string
  stats_multiplier?: number
}): Promise<Chatbot> {
  try {
    if (!data.name || data.name.trim() === "") {
      throw new Error("نام چت‌بات الزامی است")
    }

    const insertQuery = `
      INSERT INTO chatbots (
        name, welcome_message, navigation_message, primary_color, text_color, 
        background_color, chat_icon, position, margin_x, margin_y, deepseek_api_key, 
        knowledge_base_text, knowledge_base_url, store_url, ai_url, stats_multiplier, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING *
    `

    const params = [
      data.name.trim(),
      data.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
      data.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
      data.primary_color || "#14b8a6",
      data.text_color || "#ffffff",
      data.background_color || "#f3f4f6",
      data.chat_icon || "💬",
      data.position || "bottom-right",
      data.margin_x || 20,
      data.margin_y || 20,
      data.deepseek_api_key || null,
      data.knowledge_base_text || null,
      data.knowledge_base_url || null,
      data.store_url || null,
      data.ai_url || null,
      data.stats_multiplier || 1.0,
    ]

    const result = await query<Chatbot>(insertQuery, params)
    return result.rows[0]
  } catch (error) {
    dbLogger.error("Error creating chatbot:", error)
    throw new Error(`Failed to create chatbot: ${error}`)
  }
}

export async function updateChatbot(id: number, data: Partial<Chatbot>): Promise<Chatbot | null> {
  const fields = Object.keys(data).filter((key) => key !== "id")
  if (fields.length === 0) return getChatbot(id)

  const setClauses = fields.map((field, index) => `"${field}" = $${index + 2}`).join(", ")
  const params = fields.map((field) => data[field as keyof typeof data])

  const updateQuery = `
    UPDATE chatbots
    SET ${setClauses}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `

  try {
    const result = await query<Chatbot>(updateQuery, [id, ...params])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    dbLogger.error(`Error updating chatbot ${id}:`, error)
    return null
  }
}

export async function deleteChatbot(id: number): Promise<boolean> {
  try {
    await query("DELETE FROM chatbots WHERE id = $1", [id])
    return true
  } catch (error) {
    dbLogger.error(`Error deleting chatbot ${id}:`, error)
    return false
  }
}

// Message Functions
export async function getChatbotMessages(chatbotId: number): Promise<ChatbotMessage[]> {
  try {
    const result = await query<ChatbotMessage>(
      "SELECT * FROM chatbot_messages WHERE chatbot_id = $1 ORDER BY timestamp DESC LIMIT 100",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    dbLogger.error("Error fetching messages:", error)
    return []
  }
}

export async function saveMessage(payload: SaveMessagePayload) {
  const { chatbot_id, user_message, bot_response, user_ip, user_agent } = payload
  const insertQuery = `
    INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent, timestamp)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id
  `

  try {
    const result = await query(insertQuery, [
      chatbot_id,
      user_message,
      bot_response || null,
      user_ip || null,
      user_agent || null,
    ])
    return result.rows[0]?.id
  } catch (error) {
    dbLogger.error("Error saving message:", error)
    throw error
  }
}

export const createMessage = saveMessage

// FAQ Functions
export async function getChatbotFAQs(chatbotId: number): Promise<ChatbotFAQ[]> {
  try {
    const result = await query<ChatbotFAQ>("SELECT * FROM chatbot_faqs WHERE chatbot_id = $1 ORDER BY position ASC", [
      chatbotId,
    ])
    return result.rows
  } catch (error) {
    dbLogger.error(`Error fetching FAQs for chatbot ${chatbotId}:`, error)
    return []
  }
}

export async function getFAQsByChatbotId(chatbotId: number): Promise<ChatbotFAQ[]> {
  noStore()
  return getChatbotFAQs(chatbotId)
}

export async function syncChatbotFAQs(chatbotId: number, faqs: any[]): Promise<ChatbotFAQ[]> {
  try {
    // Delete existing FAQs
    await query("DELETE FROM chatbot_faqs WHERE chatbot_id = $1", [chatbotId])

    const savedFAQs: ChatbotFAQ[] = []

    // Insert new FAQs
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i]
      const result = await query<ChatbotFAQ>(
        "INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [chatbotId, faq.question, faq.answer, faq.emoji || "❓", i],
      )
      if (result.rows[0]) {
        savedFAQs.push(result.rows[0])
      }
    }

    return savedFAQs
  } catch (error) {
    dbLogger.error("Error syncing chatbot FAQs:", error)
    throw error
  }
}

// Product Functions
export async function getChatbotProducts(chatbotId: number): Promise<ChatbotProduct[]> {
  try {
    const result = await query<ChatbotProduct>(
      "SELECT * FROM chatbot_products WHERE chatbot_id = $1 ORDER BY position ASC",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    dbLogger.error(`Error fetching products for chatbot ${chatbotId}:`, error)
    return []
  }
}

export async function getProductsByChatbotId(chatbotId: number): Promise<ChatbotProduct[]> {
  noStore()
  return getChatbotProducts(chatbotId)
}

export async function syncChatbotProducts(chatbotId: number, products: any[]): Promise<ChatbotProduct[]> {
  try {
    // Delete existing products
    await query("DELETE FROM chatbot_products WHERE chatbot_id = $1", [chatbotId])

    const savedProducts: ChatbotProduct[] = []

    // Insert new products
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const result = await query<ChatbotProduct>(
        `
        INSERT INTO chatbot_products (
          chatbot_id, name, description, price, image_url, 
          button_text, secondary_text, product_url, position
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `,
        [
          chatbotId,
          product.name,
          product.description || null,
          product.price || null,
          product.image_url || null,
          product.button_text || "خرید",
          product.secondary_text || "جزئیات",
          product.product_url || null,
          i,
        ],
      )
      if (result.rows[0]) {
        savedProducts.push(result.rows[0])
      }
    }

    return savedProducts
  } catch (error) {
    dbLogger.error("Error syncing chatbot products:", error)
    throw error
  }
}

// Option Functions
export async function getChatbotOptions(chatbotId: number): Promise<ChatbotOption[]> {
  try {
    const result = await query<ChatbotOption>(
      "SELECT * FROM chatbot_options WHERE chatbot_id = $1 ORDER BY position ASC",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    dbLogger.error("Error fetching options:", error)
    return []
  }
}

export async function createChatbotOption(option: Omit<ChatbotOption, "id">): Promise<ChatbotOption> {
  const result = await query<ChatbotOption>(
    "INSERT INTO chatbot_options (chatbot_id, label, emoji, position) VALUES ($1, $2, $3, $4) RETURNING *",
    [option.chatbot_id, option.label, option.emoji, option.position],
  )
  return result.rows[0]
}

export async function deleteChatbotOption(id: number): Promise<boolean> {
  try {
    await query("DELETE FROM chatbot_options WHERE id = $1", [id])
    return true
  } catch (error) {
    dbLogger.error(`Error deleting chatbot option ${id}:`, error)
    return false
  }
}

// Ticket Functions
export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
  noStore()
  const insertQuery = `
    INSERT INTO tickets (
      chatbot_id, name, email, phone, subject, message, 
      image_url, status, priority, user_ip, user_agent, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING *
  `
  const params = [
    ticket.chatbot_id,
    ticket.name,
    ticket.email,
    ticket.phone,
    ticket.subject,
    ticket.message,
    ticket.image_url,
    ticket.status,
    ticket.priority,
    ticket.user_ip,
    ticket.user_agent,
  ]
  try {
    const result = await query<Ticket>(insertQuery, params)
    return result.rows[0]
  } catch (error) {
    dbLogger.error("Error creating ticket:", error)
    throw error
  }
}

export async function getTicketById(ticketId: number): Promise<Ticket | null> {
  try {
    const result = await query<Ticket>("SELECT * FROM tickets WHERE id = $1", [ticketId])
    return result.rows[0] || null
  } catch (error) {
    dbLogger.error("Error getting ticket:", error)
    throw error
  }
}

export async function getChatbotTickets(chatbotId: number): Promise<Ticket[]> {
  try {
    const result = await query<Ticket>("SELECT * FROM tickets WHERE chatbot_id = $1 ORDER BY created_at DESC", [
      chatbotId,
    ])
    return result.rows
  } catch (error) {
    dbLogger.error("Error fetching tickets:", error)
    return []
  }
}

export async function updateTicketStatus(ticketId: number, status: string): Promise<void> {
  try {
    await query("UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2", [status, ticketId])
  } catch (error) {
    dbLogger.error("Error updating ticket status:", error)
    throw error
  }
}

export async function getTicketResponses(ticketId: number): Promise<TicketResponse[]> {
  try {
    const result = await query<TicketResponse>(
      "SELECT * FROM ticket_responses WHERE ticket_id = $1 ORDER BY created_at ASC",
      [ticketId],
    )
    return result.rows
  } catch (error) {
    dbLogger.error("Error fetching ticket responses:", error)
    return []
  }
}

export async function addTicketResponse(ticketId: number, response: string, isAdmin = false): Promise<void> {
  try {
    await query("INSERT INTO ticket_responses (ticket_id, message, is_admin, created_at) VALUES ($1, $2, $3, NOW())", [
      ticketId,
      response,
      isAdmin,
    ])
  } catch (error) {
    dbLogger.error("Error adding ticket response:", error)
    throw error
  }
}

// Analytics Functions
export async function getTotalMessageCount(chatbotId: number): Promise<number> {
  try {
    const result = await query<{ total: number }>(
      "SELECT COUNT(*) as total FROM chatbot_messages WHERE chatbot_id = $1",
      [chatbotId],
    )
    return result.rows[0]?.total || 0
  } catch (error) {
    dbLogger.error("Error getting total message count:", error)
    return 0
  }
}

export async function getUniqueUsersCount(chatbotId: number): Promise<number> {
  try {
    const result = await query<{ unique_users: number }>(
      "SELECT COUNT(DISTINCT user_ip) as unique_users FROM chatbot_messages WHERE chatbot_id = $1",
      [chatbotId],
    )
    return result.rows[0]?.unique_users || 0
  } catch (error) {
    dbLogger.error("Error getting unique users count:", error)
    return 0
  }
}

export async function getAverageMessagesPerUser(chatbotId: number): Promise<number> {
  try {
    const result = await query<{ avg_messages: number }>(
      "SELECT ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_ip), 2) as avg_messages FROM chatbot_messages WHERE chatbot_id = $1",
      [chatbotId],
    )
    return result.rows[0]?.avg_messages || 0
  } catch (error) {
    dbLogger.error("Error getting average messages per user:", error)
    return 0
  }
}

export async function getMessageCountByDay(chatbotId: number, days = 7): Promise<{ date: string; count: number }[]> {
  try {
    const result = await query<{ date: string; count: number }>(
      `SELECT DATE(timestamp)::text as date, COUNT(*) as count FROM chatbot_messages WHERE chatbot_id = $1 AND timestamp >= NOW() - INTERVAL '${days} days' GROUP BY DATE(timestamp) ORDER BY date DESC`,
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    dbLogger.error("Error getting message count by day:", error)
    return []
  }
}

export async function getMessageCountByWeek(chatbotId: number, weeks = 4): Promise<{ week: string; count: number }[]> {
  try {
    const result = await query<{ week: string; count: number }>(
      `SELECT DATE_TRUNC('week', timestamp)::text as week, COUNT(*) as count FROM chatbot_messages WHERE chatbot_id = $1 AND timestamp >= NOW() - INTERVAL '${weeks} weeks' GROUP BY DATE_TRUNC('week', timestamp) ORDER BY week DESC`,
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    dbLogger.error("Error getting message count by week:", error)
    return []
  }
}

export async function getMessageCountByMonth(
  chatbotId: number,
  months = 6,
): Promise<{ month: string; count: number }[]> {
  try {
    const result = await query<{ month: string; count: number }>(
      `SELECT DATE_TRUNC('month', timestamp)::text as month, COUNT(*) as count FROM chatbot_messages WHERE chatbot_id = $1 AND timestamp >= NOW() - INTERVAL '${months} months' GROUP BY DATE_TRUNC('month', timestamp) ORDER BY month DESC`,
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    dbLogger.error("Error getting message count by month:", error)
    return []
  }
}

export async function getTopUserQuestions(
  chatbotId: number,
  limit = 10,
): Promise<{ question: string; count: number }[]> {
  try {
    const result = await query<{ question: string; count: number }>(
      "SELECT user_message as question, COUNT(*) as frequency FROM chatbot_messages WHERE chatbot_id = $1 AND LENGTH(user_message) > 5 GROUP BY user_message ORDER BY frequency DESC LIMIT $2",
      [chatbotId, limit],
    )
    return result.rows
  } catch (error) {
    dbLogger.error("Error getting top user questions:", error)
    return []
  }
}

// Admin User Functions
export async function getChatbotAdminUsers(chatbotId: number): Promise<AdminUser[]> {
  try {
    const result = await query<AdminUser>(
      "SELECT id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at FROM chatbot_admin_users WHERE chatbot_id = $1 ORDER BY created_at DESC",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    dbLogger.error("Error fetching admin users:", error)
    return []
  }
}

export async function createAdminUser(
  adminUser: Omit<AdminUser, "id" | "created_at" | "updated_at">,
): Promise<AdminUser> {
  try {
    const result = await query<AdminUser>(
      "INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at",
      [
        adminUser.chatbot_id,
        adminUser.username,
        adminUser.password_hash,
        adminUser.full_name,
        adminUser.email,
        adminUser.is_active,
      ],
    )
    return result.rows[0]
  } catch (error) {
    dbLogger.error("Error creating admin user:", error)
    throw new Error(`Failed to create admin user: ${error}`)
  }
}

export async function updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser | null> {
  const fields = Object.keys(updates).filter((key) => key !== "id")
  if (fields.length === 0) return null

  const setClauses = fields.map((field, index) => `"${field}" = $${index + 2}`).join(", ")
  const params = fields.map((field) => updates[field as keyof typeof updates])

  const updateQuery = `
    UPDATE chatbot_admin_users
    SET ${setClauses}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
  `
  try {
    const result = await query<AdminUser>(updateQuery, [id, ...params])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    dbLogger.error("Error updating admin user:", error)
    return null
  }
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  try {
    await query("DELETE FROM chatbot_admin_users WHERE id = $1", [id])
    return true
  } catch (error) {
    dbLogger.error(`Error deleting admin user ${id}:`, error)
    return false
  }
}

export async function getAdminUserByUsername(chatbotId: number, username: string): Promise<AdminUser | null> {
  try {
    const result = await query<AdminUser>(
      "SELECT * FROM chatbot_admin_users WHERE chatbot_id = $1 AND username = $2 AND is_active = true",
      [chatbotId, username],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    dbLogger.error("Error fetching admin user by username:", error)
    return null
  }
}

export async function updateAdminUserLastLogin(id: number): Promise<void> {
  try {
    await query("UPDATE chatbot_admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [id])
  } catch (error) {
    dbLogger.error("Error updating admin user last login:", error)
  }
}

// Stats Multiplier Functions
export async function updateStatsMultiplier(chatbotId: number, multiplier: number): Promise<boolean> {
  try {
    await query("UPDATE chatbots SET stats_multiplier = $1 WHERE id = $2", [multiplier, chatbotId])
    return true
  } catch (error) {
    dbLogger.error("Error updating stats multiplier:", error)
    return false
  }
}

export async function getStatsMultiplier(chatbotId: number): Promise<number> {
  try {
    const result = await query<{ multiplier: number }>(
      "SELECT COALESCE(stats_multiplier, 1.0) as multiplier FROM chatbots WHERE id = $1",
      [chatbotId],
    )
    return result.rows.length > 0 ? Number(result.rows[0].multiplier) : 1.0
  } catch (error) {
    dbLogger.error("Error getting stats multiplier:", error)
    return 1.0
  }
}
