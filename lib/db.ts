import { neon } from "@neondatabase/serverless"
import { unstable_noStore as noStore } from "next/cache"
import { prisma } from "./prisma"

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL!)

// Export sql for direct usage
export { sql }

/**
 * `queryDB` – compatibility wrapper that mimics the previous pg-Pool
 * signature:  queryDB<T>(text[, params]) → Promise<{ rows: T[] }>
 */
export async function queryDB<T = any>(query: string, params: any[] = []): Promise<{ rows: T[] }> {
  try {
    const result = await sql(query, ...params)
    return { rows: result as T[] }
  } catch (error) {
    console.error("Database query error:", error)
    return { rows: [] }
  }
}

// Test database connection
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await sql`SELECT 1`
    return { success: true, message: "اتصال به دیتابیس PostgreSQL موفق" }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, message: `خطا در اتصال: ${error}` }
  }
}

/** used to run migrations or seed logic on start-up if desired */
export async function initializeDatabase() {
  try {
    await sql`SELECT 1`
    return { success: true, message: "Database initialized successfully" }
  } catch (error) {
    console.error("Database initialization error:", error)
    return { success: false, message: `Database initialization failed: ${error}` }
  }
}

// Chatbot Functions
export async function getChatbots() {
  noStore()
  try {
    const chatbots = await sql`
      SELECT 
        id,
        name,
        description,
        website_url,
        business_type,
        primary_color,
        secondary_color,
        font_family,
        welcome_message,
        placeholder_text,
        position,
        size,
        is_active,
        stats_multiplier,
        created_at,
        updated_at
      FROM chatbots 
      ORDER BY created_at DESC
    `
    return chatbots
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch chatbots.")
  }
}

export async function getChatbot(id: string) {
  noStore()
  try {
    const chatbot = await sql`
      SELECT * FROM chatbots WHERE id = ${id}
    `
    return chatbot[0] || null
  } catch (error) {
    console.error(`Error fetching chatbot ${id}:`, error)
    throw new Error("Failed to fetch chatbot.")
  }
}

export async function getChatbotById(id: string) {
  return getChatbot(id)
}

export async function createChatbot(data: {
  name: string
  description?: string
  website_url?: string
  business_type?: string
}) {
  noStore()
  try {
    const chatbot = await sql`
      INSERT INTO chatbots (name, description, website_url, business_type)
      VALUES (${data.name}, ${data.description || null}, ${data.website_url || null}, ${data.business_type || null})
      RETURNING *
    `
    return chatbot[0]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to create chatbot.")
  }
}

export async function updateChatbot(
  id: string,
  data: Partial<{
    name: string
    description: string
    website_url: string
    business_type: string
    primary_color: string
    secondary_color: string
    font_family: string
    welcome_message: string
    placeholder_text: string
    position: string
    size: string
    is_active: boolean
    stats_multiplier: number
  }>,
) {
  noStore()
  try {
    const chatbot = await sql`
      UPDATE chatbots 
      SET 
        name = ${data.name},
        description = ${data.description || null},
        website_url = ${data.website_url || null},
        business_type = ${data.business_type || null},
        primary_color = ${data.primary_color || "#3B82F6"},
        secondary_color = ${data.secondary_color || "#1E40AF"},
        font_family = ${data.font_family || "Inter"},
        welcome_message = ${data.welcome_message || "سلام! چطور می‌تونم کمکتون کنم؟"},
        placeholder_text = ${data.placeholder_text || "پیام خود را بنویسید..."},
        position = ${data.position || "bottom-right"},
        size = ${data.size || "medium"},
        is_active = ${data.is_active !== undefined ? data.is_active : true},
        stats_multiplier = ${data.stats_multiplier || 1},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return chatbot[0]
  } catch (error) {
    console.error(`Error updating chatbot ${id}:`, error)
    throw new Error("Failed to update chatbot.")
  }
}

export async function deleteChatbot(id: string) {
  noStore()
  try {
    await sql`DELETE FROM chatbots WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to delete chatbot.")
  }
}

// Message Functions
export async function getMessages(chatbotId: string, limit = 100) {
  noStore()
  try {
    const messages = await sql`
      SELECT * FROM messages 
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return messages
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch messages.")
  }
}

export async function createMessage(data: {
  chatbot_id: string
  user_id?: string
  content: string
  is_user: boolean
  session_id?: string
}) {
  noStore()
  try {
    const message = await sql`
      INSERT INTO messages (chatbot_id, user_id, content, is_user, session_id)
      VALUES (${data.chatbot_id}, ${data.user_id || null}, ${data.content}, ${data.is_user}, ${data.session_id || null})
      RETURNING *
    `
    return message[0]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to create message.")
  }
}

export async function saveMessage(data: {
  chatbotId: string
  userMessage: string
  botResponse?: string | null
  userIp?: string | null
  userAgent?: string | null
  userId?: string | null
}) {
  try {
    const message = await sql`
      INSERT INTO messages (chatbot_id, user_id, content, is_user)
      VALUES (${data.chatbotId}, ${data.userId || null}, ${data.userMessage}, true)
      RETURNING *
    `
    return message[0]
  } catch (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

// FAQ Functions
export async function getChatbotFAQs(chatbotId: string) {
  noStore()
  try {
    const faqs = await sql`
      SELECT * FROM faqs 
      WHERE chatbot_id = ${chatbotId} AND is_active = true
      ORDER BY order_index ASC, created_at ASC
    `
    return faqs
  } catch (error) {
    console.error(`Error fetching FAQs for chatbot ${chatbotId}:`, error)
    throw new Error("Failed to fetch FAQs.")
  }
}

export async function syncChatbotFAQs(
  chatbotId: string,
  faqs: Array<{
    question: string
    answer: string
    emoji?: string
  }>,
) {
  try {
    // Delete existing FAQs
    await sql`DELETE FROM faqs WHERE chatbot_id = ${chatbotId}`

    // Insert new FAQs
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i]
      await sql`
        INSERT INTO faqs (chatbot_id, question, answer, order_index)
        VALUES (${chatbotId}, ${faq.question}, ${faq.answer}, ${i})
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing chatbot FAQs:", error)
    throw new Error("Failed to sync FAQs.")
  }
}

// Product Functions
export async function getChatbotProducts(chatbotId: string) {
  noStore()
  try {
    const products = await sql`
      SELECT * FROM products 
      WHERE chatbot_id = ${chatbotId} AND is_active = true
      ORDER BY order_index ASC, created_at ASC
    `
    return products
  } catch (error) {
    console.error(`Error fetching products for chatbot ${chatbotId}:`, error)
    throw new Error("Failed to fetch products.")
  }
}

export async function syncChatbotProducts(
  chatbotId: string,
  products: Array<{
    name: string
    description?: string
    price?: number
    imageUrl?: string
    buttonText?: string
    secondaryText?: string
    productUrl?: string
  }>,
) {
  try {
    // Delete existing products
    await sql`DELETE FROM products WHERE chatbot_id = ${chatbotId}`

    // Insert new products
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      await sql`
        INSERT INTO products (chatbot_id, name, description, price, image_url, order_index)
        VALUES (${chatbotId}, ${product.name}, ${product.description || null}, ${product.price || null}, ${product.imageUrl || null}, ${i})
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing chatbot products:", error)
    throw new Error("Failed to sync products.")
  }
}

// Ticket Functions
export async function getTickets(chatbotId: string) {
  noStore()
  try {
    const tickets = await sql`
      SELECT 
        t.*,
        u.name as user_name,
        u.phone as user_phone,
        u.email as user_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.chatbot_id = ${chatbotId}
      ORDER BY t.created_at DESC
    `
    return tickets
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch tickets.")
  }
}

export async function getChatbotTickets(chatbotId: string) {
  return getTickets(chatbotId)
}

export async function createTicket(data: {
  chatbot_id: string
  user_id?: string
  title: string
  description: string
  priority?: string
  image_url?: string
}) {
  noStore()
  try {
    const ticket = await sql`
      INSERT INTO tickets (chatbot_id, user_id, title, description, priority, image_url)
      VALUES (${data.chatbot_id}, ${data.user_id || null}, ${data.title}, ${data.description}, ${data.priority || "medium"}, ${data.image_url || null})
      RETURNING *
    `
    return ticket[0]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to create ticket.")
  }
}

export async function getTicketById(ticketId: string) {
  noStore()
  try {
    const ticket = await sql`
      SELECT 
        t.*,
        u.name as user_name,
        u.phone as user_phone,
        u.email as user_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ${ticketId}
    `
    return ticket[0] || null
  } catch (error) {
    console.error("Error getting ticket:", error)
    throw error
  }
}

export async function getTicketResponses(ticketId: string) {
  noStore()
  try {
    const responses = await sql`
      SELECT * FROM ticket_responses 
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `
    return responses
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    throw error
  }
}

export async function addTicketResponse(ticketId: string, message: string, isAdmin = false) {
  try {
    const response = await sql`
      INSERT INTO ticket_responses (ticket_id, content, is_admin)
      VALUES (${ticketId}, ${message}, ${isAdmin})
      RETURNING *
    `
    return response[0]
  } catch (error) {
    console.error("Error adding ticket response:", error)
    throw error
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: "OPEN" | "CLOSED" | "PENDING" | "IN_PROGRESS" | "RESOLVED",
) {
  try {
    await sql`
      UPDATE tickets 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${ticketId}
    `
    return { success: true }
  } catch (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }
}

// Analytics Functions
export async function getTotalMessageCount(chatbotId: string) {
  noStore()
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM messages WHERE chatbot_id = ${chatbotId}
    `
    return Number(result[0]?.count || 0)
  } catch (error) {
    console.error("Error getting total message count:", error)
    return 0
  }
}

export async function getUniqueUsersCount(chatbotId: string) {
  noStore()
  try {
    const result = await sql`
      SELECT COUNT(DISTINCT user_id) as count FROM messages 
      WHERE chatbot_id = ${chatbotId} AND user_id IS NOT NULL
    `
    return Number(result[0]?.count || 0)
  } catch (error) {
    console.error("Error getting unique users count:", error)
    return 0
  }
}

export async function getMessageCountByDay(chatbotId: string, days = 7) {
  noStore()
  try {
    const result = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM messages 
      WHERE chatbot_id = ${chatbotId} 
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `
    return result.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }))
  } catch (error) {
    console.error("Error getting message count by day:", error)
    return []
  }
}

export async function getMessageCountByWeek(chatbotId: string) {
  try {
    const result = await sql`
      SELECT 
        DATE_TRUNC('week', created_at)::text as week,
        COUNT(*) as count
      FROM messages
      WHERE chatbot_id = ${chatbotId}
      GROUP BY week
      ORDER BY week
    `
    return result.map((row) => ({
      week: row.week,
      count: Number(row.count),
    }))
  } catch (error) {
    console.error("Error getting message count by week:", error)
    return []
  }
}

export async function getMessageCountByMonth(chatbotId: string) {
  try {
    const result = await sql`
      SELECT 
        DATE_TRUNC('month', created_at)::text as month,
        COUNT(*) as count
      FROM messages
      WHERE chatbot_id = ${chatbotId}
      GROUP BY month
      ORDER BY month
    `
    return result.map((row) => ({
      month: row.month,
      count: Number(row.count),
    }))
  } catch (error) {
    console.error("Error getting message count by month:", error)
    return []
  }
}

export async function getAverageMessagesPerUser(chatbotId: string) {
  try {
    const result = await sql`
      SELECT AVG(cnt)::numeric as avg
      FROM (
        SELECT COUNT(*) as cnt
        FROM messages
        WHERE chatbot_id = ${chatbotId}
        GROUP BY user_id
      ) sub
    `
    return Number(result[0]?.avg || 0)
  } catch (error) {
    console.error("Error getting average messages per user:", error)
    return 0
  }
}

export async function getTopUserQuestions(chatbotId: string, limit = 10) {
  noStore()
  try {
    const result = await sql`
      SELECT 
        content as question,
        COUNT(*) as count
      FROM messages
      WHERE chatbot_id = ${chatbotId} 
        AND is_user = true 
        AND LENGTH(content) > 5
      GROUP BY content
      ORDER BY count DESC
      LIMIT ${limit}
    `
    return result.map((row) => ({
      question: row.question,
      count: Number(row.count),
    }))
  } catch (error) {
    console.error("Error getting top user questions:", error)
    return []
  }
}

// Admin User Functions
export async function getChatbotAdminUsers(chatbotId: string) {
  noStore()
  try {
    const adminUsers = await sql`
      SELECT 
        id,
        chatbot_id,
        username,
        role,
        is_active,
        created_at,
        updated_at
      FROM admin_users
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
    `
    return adminUsers
  } catch (error) {
    console.error("Error fetching admin users:", error)
    throw new Error("Failed to fetch admin users.")
  }
}

export async function createAdminUser(data: {
  chatbot_id: string
  username: string
  password: string
  role?: string
}) {
  try {
    const adminUser = await sql`
      INSERT INTO admin_users (chatbot_id, username, password, role)
      VALUES (${data.chatbot_id}, ${data.username}, ${data.password}, ${data.role || "admin"})
      RETURNING id, chatbot_id, username, role, is_active, created_at, updated_at
    `
    return adminUser[0]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to create admin user.")
  }
}

export async function getAdminUserByUsername(chatbotId: string, username: string) {
  noStore()
  try {
    const adminUser = await sql`
      SELECT * FROM admin_users
      WHERE chatbot_id = ${chatbotId} AND username = ${username} AND is_active = true
    `
    return adminUser[0] || null
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch admin user by username.")
  }
}

export async function updateAdminUserLastLogin(id: string) {
  try {
    await sql`
      UPDATE admin_users 
      SET updated_at = NOW()
      WHERE id = ${id}
    `
    return { success: true }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to update admin user last login.")
  }
}

// Legacy function aliases for backward compatibility
export const getAllChatbots = getChatbots
export const createMessageLegacy = createMessage
export const getFAQsByChatbotIdLegacy = getChatbotFAQs
export const getProductsByChatbotIdLegacy = getChatbotProducts

// Stats multiplier functions
export async function updateStatsMultiplier(chatbotId: string, multiplier: number) {
  try {
    await sql`
      UPDATE chatbots 
      SET stats_multiplier = ${multiplier}, updated_at = NOW()
      WHERE id = ${chatbotId}
    `
    return { success: true }
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return { success: false }
  }
}

export async function getStatsMultiplier(chatbotId: string) {
  noStore()
  try {
    const result = await sql`
      SELECT stats_multiplier FROM chatbots WHERE id = ${chatbotId}
    `
    return Number(result[0]?.stats_multiplier || 1.0)
  } catch (error) {
    console.error("Error getting stats multiplier:", error)
    return 1.0
  }
}

export { prisma }
export default prisma
