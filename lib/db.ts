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

// Export SQL function
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const sqlFn = getSql()
  return sqlFn(strings, ...values)
}

// Types
export interface Chatbot {
  id: number
  name: string
  welcome_message: string
  navigation_message: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  margin_x: number
  margin_y: number
  deepseek_api_key: string | null
  knowledge_base_text: string | null
  knowledge_base_url: string | null
  store_url: string | null
  ai_url: string | null
  stats_multiplier: number
  created_at: Date
  updated_at: Date
}

export interface ChatbotFAQ {
  id: number
  chatbot_id: number
  question: string
  answer: string
  emoji: string
  position: number
  created_at: Date
}

export interface ChatbotProduct {
  id: number
  chatbot_id: number
  name: string
  description: string
  price: number | null
  image_url: string | null
  button_text: string
  secondary_text: string
  product_url: string | null
  position: number
  created_at: Date
}

export interface ChatbotMessage {
  id: number
  chatbot_id: number
  user_message: string
  bot_response: string
  user_ip: string
  user_agent: string
  timestamp: Date
}

export interface ChatbotOption {
  id: number
  chatbot_id: number
  label: string
  emoji: string | null
  position: number
}

export interface AdminUser {
  id: number
  chatbot_id: number
  username: string
  password_hash: string
  full_name: string
  email: string | null
  role: "admin" | "viewer"
  is_active: boolean
  created_at: Date
  last_login: Date | null
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

// Database test function
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    console.log("Testing database connection...")
    const result = await sql`SELECT NOW() as now, version() as version`
    console.log("Database connection test successful.")
    return {
      success: true,
      message: "اتصال به دیتابیس PostgreSQL موفق",
      data: result[0],
    }
  } catch (error: any) {
    console.error("Database connection test failed.", error)
    return {
      success: false,
      message: `خطا در اتصال: ${error.message}`,
    }
  }
}

// Database initialization
export async function initializeDatabase() {
  try {
    console.log("🔄 Starting complete database reset...")

    // Step 1: Drop all tables in correct order (reverse of creation)
    const dropTables = [
      "DROP TABLE IF EXISTS chatbot_admin_sessions CASCADE",
      "DROP TABLE IF EXISTS ticket_responses CASCADE",
      "DROP TABLE IF EXISTS tickets CASCADE",
      "DROP TABLE IF EXISTS chatbot_admin_users CASCADE",
      "DROP TABLE IF EXISTS chatbot_options CASCADE",
      "DROP TABLE IF EXISTS chatbot_messages CASCADE",
      "DROP TABLE IF EXISTS chatbot_products CASCADE",
      "DROP TABLE IF EXISTS chatbot_faqs CASCADE",
      "DROP TABLE IF EXISTS chatbots CASCADE",
    ]

    for (const dropQuery of dropTables) {
      await sql([dropQuery] as any)
      console.log(`✅ Executed: ${dropQuery}`)
    }

    // Step 2: Create all tables with correct structure
    console.log("🔄 Creating tables...")

    // Create chatbots table
    await sql`
      CREATE TABLE chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        welcome_message TEXT DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟',
        navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟',
        primary_color VARCHAR(7) DEFAULT '#14b8a6',
        text_color VARCHAR(7) DEFAULT '#ffffff',
        background_color VARCHAR(7) DEFAULT '#f3f4f6',
        chat_icon VARCHAR(10) DEFAULT '💬',
        position VARCHAR(20) DEFAULT 'bottom-right',
        margin_x INTEGER DEFAULT 20,
        margin_y INTEGER DEFAULT 20,
        deepseek_api_key TEXT,
        knowledge_base_text TEXT,
        knowledge_base_url TEXT,
        store_url TEXT,
        ai_url TEXT,
        stats_multiplier DECIMAL(3,1) DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Created chatbots table")

    // Create chatbot_faqs table
    await sql`
      CREATE TABLE chatbot_faqs (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        emoji VARCHAR(10) DEFAULT '❓',
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chatbot_faqs_chatbot_id 
          FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
      )
    `
    console.log("✅ Created chatbot_faqs table")

    // Create chatbot_products table
    await sql`
      CREATE TABLE chatbot_products (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        image_url TEXT,
        button_text VARCHAR(50) DEFAULT 'خرید',
        secondary_text VARCHAR(50) DEFAULT 'جزئیات',
        product_url TEXT,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chatbot_products_chatbot_id 
          FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
      )
    `
    console.log("✅ Created chatbot_products table")

    // Create chatbot_messages table
    await sql`
      CREATE TABLE chatbot_messages (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        user_ip VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chatbot_messages_chatbot_id 
          FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
      )
    `
    console.log("✅ Created chatbot_messages table")

    // Create chatbot_options table
    await sql`
      CREATE TABLE chatbot_options (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        label VARCHAR(255) NOT NULL,
        emoji TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT fk_chatbot_options_chatbot_id 
          FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
      )
    `
    console.log("✅ Created chatbot_options table")

    // Create chatbot_admin_users table
    await sql`
      CREATE TABLE chatbot_admin_users (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        username VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(20) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chatbot_admin_users_chatbot_id 
          FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE,
        UNIQUE(chatbot_id, username)
      )
    `
    console.log("✅ Created chatbot_admin_users table")

    // Create chatbot_admin_sessions table
    await sql`
      CREATE TABLE chatbot_admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chatbot_admin_sessions_user_id 
          FOREIGN KEY (user_id) REFERENCES chatbot_admin_users(id) ON DELETE CASCADE
      )
    `
    console.log("✅ Created chatbot_admin_sessions table")

    // Create tickets table
    await sql`
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        user_ip VARCHAR(45),
        user_agent TEXT,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(10) DEFAULT 'normal',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_tickets_chatbot_id 
          FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
      )
    `
    console.log("✅ Created tickets table")

    // Create ticket_responses table
    await sql`
      CREATE TABLE ticket_responses (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ticket_responses_ticket_id 
          FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      )
    `
    console.log("✅ Created ticket_responses table")

    // Step 3: Create indexes for better performance
    await sql`CREATE INDEX idx_chatbot_faqs_chatbot_id ON chatbot_faqs(chatbot_id)`
    await sql`CREATE INDEX idx_chatbot_products_chatbot_id ON chatbot_products(chatbot_id)`
    await sql`CREATE INDEX idx_chatbot_messages_chatbot_id ON chatbot_messages(chatbot_id)`
    await sql`CREATE INDEX idx_chatbot_options_chatbot_id ON chatbot_options(chatbot_id)`
    await sql`CREATE INDEX idx_chatbot_admin_users_chatbot_id ON chatbot_admin_users(chatbot_id)`
    await sql`CREATE INDEX idx_tickets_chatbot_id ON tickets(chatbot_id)`
    await sql`CREATE INDEX idx_chatbot_messages_timestamp ON chatbot_messages(timestamp)`
    await sql`CREATE INDEX idx_tickets_status ON tickets(status)`
    await sql`CREATE INDEX idx_admin_sessions_token ON chatbot_admin_sessions(session_token)`
    console.log("✅ Created indexes")

    console.log("🎉 Database initialization completed successfully!")
    return { success: true, message: "دیتابیس با موفقیت راه‌اندازی شد" }
  } catch (error: any) {
    console.error("❌ Database initialization failed:", error)
    throw error
  }
}

// CRUD operations for chatbots
export async function createChatbot(data: Partial<Chatbot>) {
  try {
    const result = await sql`
      INSERT INTO chatbots (
        name, welcome_message, navigation_message, primary_color, 
        text_color, background_color, chat_icon, position, 
        margin_x, margin_y, deepseek_api_key, knowledge_base_text,
        knowledge_base_url, store_url, ai_url, stats_multiplier
      ) VALUES (
        ${data.name || "چت‌بات جدید"},
        ${data.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟"},
        ${data.navigation_message || "چه چیزی شما را به اینجا آورده است؟"},
        ${data.primary_color || "#14b8a6"},
        ${data.text_color || "#ffffff"},
        ${data.background_color || "#f3f4f6"},
        ${data.chat_icon || "💬"},
        ${data.position || "bottom-right"},
        ${data.margin_x || 20},
        ${data.margin_y || 20},
        ${data.deepseek_api_key || null},
        ${data.knowledge_base_text || null},
        ${data.knowledge_base_url || null},
        ${data.store_url || null},
        ${data.ai_url || null},
        ${data.stats_multiplier || 1.0}
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
        welcome_message = ${data.welcome_message},
        navigation_message = ${data.navigation_message},
        primary_color = ${data.primary_color},
        text_color = ${data.text_color},
        background_color = ${data.background_color},
        chat_icon = ${data.chat_icon},
        position = ${data.position},
        margin_x = ${data.margin_x},
        margin_y = ${data.margin_y},
        deepseek_api_key = ${data.deepseek_api_key},
        knowledge_base_text = ${data.knowledge_base_text},
        knowledge_base_url = ${data.knowledge_base_url},
        store_url = ${data.store_url},
        ai_url = ${data.ai_url},
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
      SELECT * FROM chatbot_faqs 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY position ASC, id ASC
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
    await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`

    // Insert new FAQs
    if (faqs.length > 0) {
      for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i]
        await sql`
          INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
          VALUES (${chatbotId}, ${faq.question || ""}, ${faq.answer || ""}, ${faq.emoji || "❓"}, ${faq.position || i})
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
      SELECT * FROM chatbot_products 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY position ASC, id ASC
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
    await sql`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`

    // Insert new products
    if (products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        await sql`
          INSERT INTO chatbot_products (
            chatbot_id, name, description, price, image_url, 
            button_text, secondary_text, product_url, position
          )
          VALUES (
            ${chatbotId}, ${product.name || ""}, ${product.description || ""}, 
            ${product.price || null}, ${product.image_url || null},
            ${product.button_text || "خرید"}, ${product.secondary_text || "جزئیات"}, 
            ${product.product_url || null}, ${product.position || i}
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
      INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip)
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
  user_agent?: string | null
}) {
  try {
    const result = await sql`
      INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent)
      VALUES (${payload.chatbot_id}, ${payload.user_message}, ${payload.bot_response || ""}, ${payload.user_ip || ""}, ${payload.user_agent || ""})
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
      SELECT * FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY timestamp DESC 
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error getting chatbot messages:", error)
    throw error
  }
}

// Options operations
export async function getChatbotOptions(chatbotId: number) {
  try {
    const result = await sql`
      SELECT * FROM chatbot_options 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY position ASC
    `
    return result
  } catch (error) {
    console.error("Error fetching options:", error)
    return []
  }
}

export async function createChatbotOption(option: Omit<ChatbotOption, "id">) {
  try {
    const result = await sql`
      INSERT INTO chatbot_options (chatbot_id, label, emoji, position) 
      VALUES (${option.chatbot_id}, ${option.label}, ${option.emoji}, ${option.position}) 
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating option:", error)
    throw error
  }
}

export async function deleteChatbotOption(id: number) {
  try {
    await sql`DELETE FROM chatbot_options WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting chatbot option:", error)
    return false
  }
}

// Stats operations
export async function getChatbotStats(chatbotId: number) {
  try {
    const [messageCount, uniqueUsers] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM chatbot_messages WHERE chatbot_id = ${chatbotId}`,
      sql`SELECT COUNT(DISTINCT user_ip) as count FROM chatbot_messages WHERE chatbot_id = ${chatbotId}`,
    ])

    const chatbot = await getChatbot(chatbotId)
    const multiplier = chatbot?.stats_multiplier || 1.0

    return {
      totalMessages: Math.round(Number(messageCount[0].count) * multiplier),
      uniqueUsers: Math.round(Number(uniqueUsers[0].count) * multiplier),
      multiplier: multiplier,
    }
  } catch (error) {
    console.error("Error getting chatbot stats:", error)
    throw error
  }
}

export async function getTotalMessageCount(chatbotId: number): Promise<number> {
  try {
    const result = await sql`SELECT COUNT(*) as total FROM chatbot_messages WHERE chatbot_id = ${chatbotId}`
    return Number(result[0]?.total) || 0
  } catch (error) {
    console.error("Error getting total message count:", error)
    return 0
  }
}

export async function getUniqueUsersCount(chatbotId: number): Promise<number> {
  try {
    const result =
      await sql`SELECT COUNT(DISTINCT user_ip) as unique_users FROM chatbot_messages WHERE chatbot_id = ${chatbotId}`
    return Number(result[0]?.unique_users) || 0
  } catch (error) {
    console.error("Error getting unique users count:", error)
    return 0
  }
}

export async function getAverageMessagesPerUser(chatbotId: number): Promise<number> {
  try {
    const result = await sql`
      SELECT ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_ip), 2) as avg_messages 
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
    `
    return Number(result[0]?.avg_messages) || 0
  } catch (error) {
    console.error("Error getting average messages per user:", error)
    return 0
  }
}

export async function getMessageCountByDay(chatbotId: number, days = 7): Promise<{ date: string; count: number }[]> {
  try {
    const result = await sql`
      SELECT DATE(timestamp)::text as date, COUNT(*) as count 
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${days} days' 
      GROUP BY DATE(timestamp) 
      ORDER BY date DESC
    `
    return result.map((row) => ({ date: row.date, count: Number(row.count) }))
  } catch (error) {
    console.error("Error getting message count by day:", error)
    return []
  }
}

export async function getMessageCountByWeek(chatbotId: number, weeks = 4): Promise<{ week: string; count: number }[]> {
  try {
    const result = await sql`
      SELECT DATE_TRUNC('week', timestamp)::text as week, COUNT(*) as count 
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${weeks} weeks' 
      GROUP BY DATE_TRUNC('week', timestamp) 
      ORDER BY week DESC
    `
    return result.map((row) => ({ week: row.week, count: Number(row.count) }))
  } catch (error) {
    console.error("Error getting message count by week:", error)
    return []
  }
}

export async function getMessageCountByMonth(
  chatbotId: number,
  months = 6,
): Promise<{ month: string; count: number }[]> {
  try {
    const result = await sql`
      SELECT DATE_TRUNC('month', timestamp)::text as month, COUNT(*) as count 
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${months} months' 
      GROUP BY DATE_TRUNC('month', timestamp) 
      ORDER BY month DESC
    `
    return result.map((row) => ({ month: row.month, count: Number(row.count) }))
  } catch (error) {
    console.error("Error getting message count by month:", error)
    return []
  }
}

export async function getTopUserQuestions(
  chatbotId: number,
  limit = 10,
): Promise<{ question: string; count: number }[]> {
  try {
    const result = await sql`
      SELECT user_message as question, COUNT(*) as count 
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} AND LENGTH(user_message) > 5 
      GROUP BY user_message 
      ORDER BY count DESC 
      LIMIT ${limit}
    `
    return result.map((row) => ({ question: row.question, count: Number(row.count) }))
  } catch (error) {
    console.error("Error getting top user questions:", error)
    return []
  }
}

// Stats multiplier operations
export async function getStatsMultiplier(chatbotId: number): Promise<number> {
  try {
    const result = await sql`SELECT COALESCE(stats_multiplier, 1.0) as multiplier FROM chatbots WHERE id = ${chatbotId}`
    return Number(result[0]?.multiplier) || 1.0
  } catch (error) {
    console.error("Error getting stats multiplier:", error)
    return 1.0
  }
}

export async function updateStatsMultiplier(chatbotId: number, multiplier: number): Promise<boolean> {
  try {
    await sql`UPDATE chatbots SET stats_multiplier = ${multiplier} WHERE id = ${chatbotId}`
    return true
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return false
  }
}

// Ticket operations
export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">) {
  try {
    const result = await sql`
      INSERT INTO tickets (
        chatbot_id, name, email, phone, subject, message, 
        image_url, status, priority, user_ip, user_agent
      )
      VALUES (
        ${ticket.chatbot_id}, ${ticket.name}, ${ticket.email}, ${ticket.phone}, 
        ${ticket.subject}, ${ticket.message}, ${ticket.image_url}, 
        ${ticket.status}, ${ticket.priority}, ${ticket.user_ip}, ${ticket.user_agent}
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
      SELECT id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at 
      FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return []
  }
}

export async function createAdminUser(adminUser: Omit<AdminUser, "id" | "created_at" | "last_login">) {
  try {
    const result = await sql`
      INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active) 
      VALUES (${adminUser.chatbot_id}, ${adminUser.username}, ${adminUser.password_hash}, ${adminUser.full_name}, ${adminUser.email}, ${adminUser.is_active}) 
      RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
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
      UPDATE chatbot_admin_users
      SET ${sql.unsafe(setClauses)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating admin user:", error)
    return null
  }
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM chatbot_admin_users WHERE id = ${id}`
    return true
  } catch (error) {
    console.error(`Error deleting admin user ${id}:`, error)
    return false
  }
}

export async function getAdminUserByUsername(chatbotId: number, username: string) {
  try {
    const result = await sql`
      SELECT * FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId} AND username = ${username} AND is_active = true
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching admin user by username:", error)
    return null
  }
}

export async function updateAdminUserLastLogin(id: number): Promise<void> {
  try {
    await sql`UPDATE chatbot_admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ${id}`
  } catch (error) {
    console.error("Error updating admin user last login:", error)
  }
}
