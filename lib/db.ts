import "dotenv/config"
import { Pool, type QueryResult } from "pg"
import { unstable_noStore as noStore } from "next/cache"

// Check if the DATABASE_URL is set, and throw an error if it's not.
// This ensures the application fails fast if the configuration is missing.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create a new pool instance. The pool manages multiple client connections
// and is the recommended way to interact with the database.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

/**
 * A helper function to query the database in a type-safe manner.
 * It also includes basic logging for executed queries.
 * @param text The SQL query string, which can include placeholders like $1, $2.
 * @param params An array of parameters to safely pass to the SQL query.
 * @returns A promise that resolves with the query result.
 */
export async function queryDB<T extends object>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const res = await pool.query<T>(text, params)
    const duration = Date.now() - start
    console.log("executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

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
  enable_product_suggestions?: boolean
  enable_next_suggestions?: boolean
  prompt_template?: string | null
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

// Helper function to check if database is available
function isDatabaseAvailable(): boolean {
  return process.env.DATABASE_URL && process.env.DATABASE_URL !== "postgresql://dummy:dummy@dummy:5432/dummy"
}

// --- DATABASE FUNCTIONS ---

// تست اتصال دیتابیس
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!isDatabaseAvailable()) {
    return { success: false, message: "Database URL not configured" }
  }

  try {
    const result = await queryDB<{ test: number }>("SELECT 1 as test")
    return { success: true, message: "اتصال به دیتابیس NEON موفق" }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, message: `خطا در اتصال: ${error}` }
  }
}

// Database Initialization
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  if (!isDatabaseAvailable()) {
    return { success: false, message: "Database URL not configured" }
  }

  try {
    console.log("Initializing NEON database tables...")
    await queryDB(`
      CREATE TABLE IF NOT EXISTS chatbots (
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
        stats_multiplier NUMERIC(5, 2) DEFAULT 1.0,
        enable_product_suggestions BOOLEAN DEFAULT TRUE,
        enable_next_suggestions BOOLEAN DEFAULT TRUE,
        prompt_template TEXT
      );
      CREATE TABLE IF NOT EXISTS chatbot_messages (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        user_message TEXT NOT NULL, 
        bot_response TEXT, 
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
        user_ip VARCHAR(50), 
        user_agent TEXT
      );
      CREATE TABLE IF NOT EXISTS chatbot_faqs (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        question TEXT NOT NULL, 
        answer TEXT, 
        emoji VARCHAR(10) DEFAULT '❓', 
        position INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS chatbot_products (
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
      );
      CREATE TABLE IF NOT EXISTS chatbot_options (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        label VARCHAR(255) NOT NULL, 
        emoji TEXT, 
        position INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS tickets (
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
      );
      CREATE TABLE IF NOT EXISTS ticket_responses (
        id SERIAL PRIMARY KEY, 
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE, 
        message TEXT NOT NULL, 
        is_admin BOOLEAN DEFAULT FALSE, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS chatbot_admin_users (
        id SERIAL PRIMARY KEY, 
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE, 
        username VARCHAR(255) NOT NULL UNIQUE, 
        password_hash VARCHAR(255) NOT NULL, 
        full_name VARCHAR(255), 
        email VARCHAR(255), 
        is_active BOOLEAN DEFAULT TRUE, 
        last_login TIMESTAMP WITH TIME ZONE, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
        id SERIAL PRIMARY KEY, 
        user_id INTEGER NOT NULL REFERENCES chatbot_admin_users(id) ON DELETE CASCADE, 
        session_token VARCHAR(255) NOT NULL UNIQUE, 
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log("NEON database tables initialized successfully")
    return { success: true, message: "دیتابیس NEON با موفقیت راه‌اندازی شد" }
  } catch (error) {
    console.error("NEON database initialization error:", error)
    return { success: false, message: `خطا در راه‌اندازی دیتابیس NEON: ${error}` }
  }
}

// Chatbot Functions
export async function getAllChatbots(): Promise<Chatbot[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<Chatbot>("SELECT * FROM chatbots ORDER BY created_at DESC")
    return result.rows
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return []
  }
}

export async function getChatbots(): Promise<Chatbot[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<Chatbot>(`
      SELECT 
        *,
        COALESCE(stats_multiplier, 1.0) as stats_multiplier,
        COALESCE(enable_product_suggestions, true) as enable_product_suggestions,
        COALESCE(enable_next_suggestions, true) as enable_next_suggestions
      FROM chatbots 
      ORDER BY created_at DESC
    `)
    return result.rows
  } catch (error: any) {
    // Auto-fix if columns are missing, then retry once
    if (error?.message?.includes("column") && error?.message?.includes("does not exist")) {
      console.warn("One or more columns missing – running auto-fix script…")
      await queryDB("ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS stats_multiplier NUMERIC(5,2) DEFAULT 1.0")
      await queryDB("ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS margin_x INTEGER DEFAULT 20")
      await queryDB("ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS margin_y INTEGER DEFAULT 20")
      await queryDB("ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS enable_product_suggestions BOOLEAN DEFAULT TRUE")
      await queryDB("ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS enable_next_suggestions BOOLEAN DEFAULT TRUE")
      await queryDB("ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS prompt_template TEXT")
      return getChatbots() // Retry the function
    }
    console.error("Error fetching chatbots from NEON:", error)
    throw new Error(`Failed to fetch chatbots: ${error}`)
  }
}

export async function getChatbot(id: number): Promise<Chatbot | null> {
  if (!isDatabaseAvailable()) {
    return null
  }

  try {
    const result = await queryDB<Chatbot>(
      `
      SELECT *, COALESCE(stats_multiplier, 1.0) as stats_multiplier, COALESCE(enable_product_suggestions, true) as enable_product_suggestions, COALESCE(enable_next_suggestions, true) as enable_next_suggestions FROM chatbots WHERE id = $1
    `,
      [id],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error fetching chatbot ${id}:`, error)
    return null
  }
}

export async function createChatbot(
  data: Partial<Omit<Chatbot, "id" | "created_at" | "updated_at">>,
): Promise<Chatbot> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  try {
    if (!data.name || data.name.trim() === "") {
      throw new Error("نام چت‌بات الزامی است")
    }
    const result = await queryDB<Chatbot>(
      `
      INSERT INTO chatbots (
        name, welcome_message, navigation_message, primary_color, text_color, background_color, chat_icon, position, margin_x, margin_y, deepseek_api_key, knowledge_base_text, knowledge_base_url, store_url, ai_url, stats_multiplier, enable_product_suggestions, enable_next_suggestions, prompt_template, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
      ) RETURNING *
    `,
      [
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
        data.enable_product_suggestions ?? true,
        data.enable_next_suggestions ?? true,
        data.prompt_template || null,
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error creating chatbot in NEON:", error)
    throw new Error(`Failed to create chatbot: ${error}`)
  }
}

export async function updateChatbot(id: number, data: Partial<Chatbot>): Promise<Chatbot | null> {
  if (!isDatabaseAvailable()) {
    return null
  }

  try {
    const result = await queryDB<Chatbot>(
      `
      UPDATE chatbots
      SET
        name = COALESCE($1, name),
        primary_color = COALESCE($2, primary_color),
        text_color = COALESCE($3, text_color),
        background_color = COALESCE($4, background_color),
        chat_icon = COALESCE($5, chat_icon),
        position = COALESCE($6, position),
        margin_x = COALESCE($7, margin_x),
        margin_y = COALESCE($8, margin_y),
        welcome_message = COALESCE($9, welcome_message),
        navigation_message = COALESCE($10, navigation_message),
        knowledge_base_text = COALESCE($11, knowledge_base_text),
        knowledge_base_url = COALESCE($12, knowledge_base_url),
        store_url = COALESCE($13, store_url),
        ai_url = COALESCE($14, ai_url),
        stats_multiplier = COALESCE($15, stats_multiplier),
        enable_product_suggestions = COALESCE($16, enable_product_suggestions),
        enable_next_suggestions = COALESCE($17, enable_next_suggestions),
        prompt_template = COALESCE($18, prompt_template),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *
    `,
      [
        data.name,
        data.primary_color,
        data.text_color,
        data.background_color,
        data.chat_icon,
        data.position,
        data.margin_x,
        data.margin_y,
        data.welcome_message,
        data.navigation_message,
        data.knowledge_base_text,
        data.knowledge_base_url,
        data.store_url,
        data.ai_url,
        data.stats_multiplier,
        data.enable_product_suggestions,
        data.enable_next_suggestions,
        data.prompt_template,
        id,
      ],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error updating chatbot ${id}:`, error)
    return null
  }
}

export async function deleteChatbot(id: number): Promise<boolean> {
  if (!isDatabaseAvailable()) {
    return false
  }

  try {
    await queryDB("DELETE FROM chatbots WHERE id = $1", [id])
    return true
  } catch (error) {
    console.error(`Error deleting chatbot ${id} from NEON:`, error)
    return false
  }
}

// Message Functions
export async function getChatbotMessages(chatbotId: number): Promise<ChatbotMessage[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<ChatbotMessage>(
      "SELECT * FROM chatbot_messages WHERE chatbot_id = $1 ORDER BY timestamp DESC LIMIT 100",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching messages from NEON:", error)
    return []
  }
}

export async function saveMessage(payload: SaveMessagePayload) {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  const { chatbot_id, user_message, bot_response, user_ip, user_agent } = payload
  try {
    const result = await queryDB<{ id: number }>(
      `
      INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent, timestamp)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `,
      [chatbot_id, user_message, bot_response || null, user_ip || null, user_agent || null],
    )
    return result.rows[0]?.id
  } catch (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

export const createMessage = saveMessage

// FAQ Functions
export async function getChatbotFAQs(chatbotId: number): Promise<ChatbotFAQ[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<ChatbotFAQ>("SELECT * FROM chatbot_faqs WHERE chatbot_id = $1 ORDER BY position ASC", [
      chatbotId,
    ])
    return result.rows
  } catch (error) {
    console.error(`Error fetching FAQs for chatbot ${chatbotId}:`, error)
    return []
  }
}

export async function syncChatbotFAQs(chatbotId: number, faqs: any[]): Promise<ChatbotFAQ[]> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  try {
    // Delete existing FAQs
    await queryDB("DELETE FROM chatbot_faqs WHERE chatbot_id = $1", [chatbotId])

    const savedFAQs: ChatbotFAQ[] = []

    // Insert new FAQs
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i]
      const result = await queryDB<ChatbotFAQ>(
        `
        INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
        [chatbotId, faq.question, faq.answer, faq.emoji || "❓", i],
      )
      if (result.rows[0]) {
        savedFAQs.push(result.rows[0])
      }
    }

    return savedFAQs
  } catch (error) {
    console.error("Error syncing chatbot FAQs:", error)
    throw error
  }
}

// Product Functions
export async function getChatbotProducts(chatbotId: number): Promise<ChatbotProduct[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<ChatbotProduct>(
      "SELECT * FROM chatbot_products WHERE chatbot_id = $1 ORDER BY position ASC",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error(`Error fetching products for chatbot ${chatbotId}:`, error)
    return []
  }
}

export async function syncChatbotProducts(chatbotId: number, products: any[]): Promise<ChatbotProduct[]> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  try {
    // Delete existing products
    await queryDB("DELETE FROM chatbot_products WHERE chatbot_id = $1", [chatbotId])

    const savedProducts: ChatbotProduct[] = []

    // Insert new products
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const result = await queryDB<ChatbotProduct>(
        `
        INSERT INTO chatbot_products (
          chatbot_id, name, description, price, image_url, 
          button_text, secondary_text, product_url, position
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
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
    console.error("Error syncing chatbot products:", error)
    throw error
  }
}

// Option Functions
export async function getChatbotOptions(chatbotId: number): Promise<ChatbotOption[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<ChatbotOption>(
      "SELECT * FROM chatbot_options WHERE chatbot_id = $1 ORDER BY position ASC",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching options from NEON:", error)
    return []
  }
}

export async function createChatbotOption(option: Omit<ChatbotOption, "id">): Promise<ChatbotOption> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  const result = await queryDB<ChatbotOption>(
    `
    INSERT INTO chatbot_options (chatbot_id, label, emoji, position) VALUES ($1, $2, $3, $4) RETURNING *
  `,
    [option.chatbot_id, option.label, option.emoji, option.position],
  )
  return result.rows[0]
}

export async function deleteChatbotOption(id: number): Promise<boolean> {
  if (!isDatabaseAvailable()) {
    return false
  }

  await queryDB("DELETE FROM chatbot_options WHERE id = $1", [id])
  return true
}

// Ticket Functions
export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
  noStore()
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  try {
    const result = await queryDB<Ticket>(
      `
      INSERT INTO tickets (
        chatbot_id, name, email, phone, subject, message, 
        image_url, status, priority, user_ip, user_agent, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      )
      RETURNING *
    `,
      [
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
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error creating ticket:", error)
    throw error
  }
}

export async function getTicketById(ticketId: number): Promise<Ticket | null> {
  if (!isDatabaseAvailable()) {
    return null
  }

  try {
    const result = await queryDB<Ticket>("SELECT * FROM tickets WHERE id = $1", [ticketId])
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting ticket:", error)
    throw error
  }
}

export async function getChatbotTickets(chatbotId: number): Promise<Ticket[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<Ticket>("SELECT * FROM tickets WHERE chatbot_id = $1 ORDER BY created_at DESC", [
      chatbotId,
    ])
    return result.rows
  } catch (error) {
    console.error("Error fetching tickets from NEON:", error)
    return []
  }
}

export async function updateTicketStatus(ticketId: number, status: string): Promise<void> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  try {
    await queryDB("UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2", [status, ticketId])
  } catch (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }
}

export async function getTicketResponses(ticketId: number): Promise<TicketResponse[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<TicketResponse>(
      "SELECT * FROM ticket_responses WHERE ticket_id = $1 ORDER BY created_at ASC",
      [ticketId],
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    return []
  }
}

export async function addTicketResponse(ticketId: number, response: string, isAdmin = false): Promise<void> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  try {
    await queryDB(
      "INSERT INTO ticket_responses (ticket_id, message, is_admin, created_at) VALUES ($1, $2, $3, NOW())",
      [ticketId, response, isAdmin],
    )
  } catch (error) {
    console.error("Error adding ticket response:", error)
    throw error
  }
}

// Analytics Functions
export async function getTotalMessageCount(chatbotId: number): Promise<number> {
  if (!isDatabaseAvailable()) {
    return 0
  }

  try {
    const result = await queryDB<{ total: number }>(
      "SELECT COUNT(*) as total FROM chatbot_messages WHERE chatbot_id = $1",
      [chatbotId],
    )
    return result.rows[0]?.total || 0
  } catch (error) {
    console.error("Error getting total message count:", error)
    return 0
  }
}

export async function getUniqueUsersCount(chatbotId: number): Promise<number> {
  if (!isDatabaseAvailable()) {
    return 0
  }

  try {
    const result = await queryDB<{ unique_users: number }>(
      "SELECT COUNT(DISTINCT user_ip) as unique_users FROM chatbot_messages WHERE chatbot_id = $1",
      [chatbotId],
    )
    return result.rows[0]?.unique_users || 0
  } catch (error) {
    console.error("Error getting unique users count:", error)
    return 0
  }
}

export async function getAverageMessagesPerUser(chatbotId: number): Promise<number> {
  if (!isDatabaseAvailable()) {
    return 0
  }

  try {
    const result = await queryDB<{ avg_messages: number }>(
      `
      SELECT 
        ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_ip), 2) as avg_messages
      FROM chatbot_messages 
      WHERE chatbot_id = $1
    `,
      [chatbotId],
    )
    return result.rows[0]?.avg_messages || 0
  } catch (error) {
    console.error("Error getting average messages per user:", error)
    return 0
  }
}

export async function getMessageCountByDay(chatbotId: number, days = 7): Promise<{ date: string; count: number }[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<{ date: string; count: number }>(
      `
      SELECT 
        DATE(timestamp)::text as date,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = $1 
        AND timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `,
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error("Error getting message count by day:", error)
    return []
  }
}

export async function getMessageCountByWeek(chatbotId: number, weeks = 4): Promise<{ week: string; count: number }[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<{ week: string; count: number }>(
      `
      SELECT 
        DATE_TRUNC('week', timestamp)::text as week,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = $1 
        AND timestamp >= NOW() - INTERVAL '${weeks} weeks'
      GROUP BY DATE_TRUNC('week', timestamp)
      ORDER BY week DESC
    `,
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error("Error getting message count by week:", error)
    return []
  }
}

export async function getMessageCountByMonth(
  chatbotId: number,
  months = 6,
): Promise<{ month: string; count: number }[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<{ month: string; count: number }>(
      `
      SELECT 
        DATE_TRUNC('month', timestamp)::text as month,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = $1 
        AND timestamp >= NOW() - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', timestamp)
      ORDER BY month DESC
    `,
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error("Error getting message count by month:", error)
    return []
  }
}

export async function getTopUserQuestions(
  chatbotId: number,
  limit = 10,
): Promise<{ question: string; count: number }[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<{ question: string; count: number }>(
      `
      SELECT 
        user_message as question,
        COUNT(*) as frequency
      FROM chatbot_messages 
      WHERE chatbot_id = $1
        AND LENGTH(user_message) > 5
      GROUP BY user_message
      ORDER BY frequency DESC
      LIMIT $2
    `,
      [chatbotId, limit],
    )
    return result.rows
  } catch (error) {
    console.error("Error getting top user questions:", error)
    return []
  }
}

// Admin User Functions
export async function getChatbotAdminUsers(chatbotId: number): Promise<AdminUser[]> {
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<AdminUser>(
      `
      SELECT id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
      FROM chatbot_admin_users
      WHERE chatbot_id = $1
      ORDER BY created_at DESC
    `,
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return []
  }
}

export async function createAdminUser(
  adminUser: Omit<AdminUser, "id" | "created_at" | "updated_at">,
): Promise<AdminUser> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }

  try {
    const result = await queryDB<AdminUser>(
      `
      INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
    `,
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
    console.error("Error creating admin user:", error)
    throw new Error(`Failed to create admin user: ${error}`)
  }
}

export async function updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser | null> {
  if (!isDatabaseAvailable()) {
    return null
  }

  try {
    const result = await queryDB<AdminUser>(
      `
      UPDATE chatbot_admin_users
      SET
        username = COALESCE($1, username),
        password_hash = COALESCE($2, password_hash),
        full_name = COALESCE($3, full_name),
        email = COALESCE($4, email),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
    `,
      [updates.username, updates.password_hash, updates.full_name, updates.email, updates.is_active, id],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error("Error updating admin user:", error)
    return null
  }
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  if (!isDatabaseAvailable()) {
    return false
  }

  try {
    await queryDB("DELETE FROM chatbot_admin_users WHERE id = $1", [id])
    return true
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return false
  }
}

export async function getAdminUserByUsername(chatbotId: number, username: string): Promise<AdminUser | null> {
  if (!isDatabaseAvailable()) {
    return null
  }

  try {
    const result = await queryDB<AdminUser>(
      `
      SELECT * FROM chatbot_admin_users
      WHERE chatbot_id = $1 AND username = $2 AND is_active = true
    `,
      [chatbotId, username],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error("Error fetching admin user by username:", error)
    return null
  }
}

export async function updateAdminUserLastLogin(id: number): Promise<void> {
  if (!isDatabaseAvailable()) {
    return
  }

  try {
    await queryDB("UPDATE chatbot_admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [id])
  } catch (error) {
    console.error("Error updating admin user last login:", error)
  }
}

// Stats Multiplier Functions
export async function updateStatsMultiplier(chatbotId: number, multiplier: number): Promise<boolean> {
  if (!isDatabaseAvailable()) {
    return false
  }

  try {
    await queryDB("UPDATE chatbots SET stats_multiplier = $1 WHERE id = $2", [multiplier, chatbotId])
    return true
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return false
  }
}

export async function getStatsMultiplier(chatbotId: number): Promise<number> {
  if (!isDatabaseAvailable()) {
    return 1.0
  }

  try {
    const result = await queryDB<{ multiplier: number }>(
      "SELECT COALESCE(stats_multiplier, 1.0) as multiplier FROM chatbots WHERE id = $1",
      [chatbotId],
    )
    return result.rows.length > 0 ? Number(result.rows[0].multiplier) : 1.0
  } catch (error) {
    console.error("Error getting stats multiplier:", error)
    return 1.0
  }
}

// Additional Functions
export async function getChatbotById(id: number) {
  noStore()
  if (!isDatabaseAvailable()) {
    return null
  }

  try {
    const result = await queryDB<Chatbot>("SELECT * FROM chatbots WHERE id = $1", [id])
    return result.rows[0]
  } catch (error) {
    console.error("Error fetching chatbot by ID:", error)
    throw error
  }
}

export async function getFAQsByChatbotId(chatbotId: number) {
  noStore()
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<ChatbotFAQ>("SELECT * FROM chatbot_faqs WHERE chatbot_id = $1 ORDER BY id ASC", [
      chatbotId,
    ])
    return result.rows
  } catch (error) {
    console.error("Error fetching FAQs by chatbot ID:", error)
    throw error
  }
}

export async function getProductsByChatbotId(chatbotId: number) {
  noStore()
  if (!isDatabaseAvailable()) {
    return []
  }

  try {
    const result = await queryDB<ChatbotProduct>(
      "SELECT * FROM chatbot_products WHERE chatbot_id = $1 ORDER BY id ASC",
      [chatbotId],
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching products by chatbot ID:", error)
    throw error
  }
}
