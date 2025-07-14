import { neon } from "@neondatabase/serverless"
import { unstable_noStore as noStore } from "next/cache"
import { prisma } from "./prisma"
import type { Prisma } from "@prisma/client"

const sql = neon(process.env.DATABASE_URL!)

/**
 * `sql` –  thin alias around `prisma.$queryRaw` (tagged-template style).
 * Usage: await sql`SELECT 1`
 */
export function prismaSql(strings: TemplateStringsArray, ...params: (string | number | Prisma.JsonValue)[]) {
  const full = strings.map((s, i) => s + (params[i] ?? "")).join("")
  return prisma.$queryRawUnsafe(full)
}

/**
 * `queryDB` – compatibility wrapper that mimics the previous pg-Pool
 * signature:  queryDB<T>(text[, params]) → Promise<{ rows: T[] }>
 */
export async function queryDB<T = any>(query: string, params: any[] = []): Promise<{ rows: T[] }> {
  const result = await prisma.$queryRawUnsafe<T[]>(query, ...params)
  return { rows: result || [] }
}

// Test database connection
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    return { success: true, message: "اتصال به دیتابیس PostgreSQL موفق" }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, message: `خطا در اتصال: ${error}` }
  }
}

/** used to run migrations or seed logic on start-up if desired */
export async function initializeDatabase() {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
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

export async function getChatbotFAQs(chatbotId: number) {
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
  chatbotId: number,
  faqs: Array<{
    question: string
    answer: string
    emoji?: string
  }>,
) {
  try {
    // Delete existing FAQs and create new ones in a transaction
    const result = await prisma.$transaction(async (tx) => {
      await tx.chatbotFAQ.deleteMany({
        where: { chatbotId },
      })

      const createdFAQs = await Promise.all(
        faqs.map((faq, index) =>
          tx.chatbotFAQ.create({
            data: {
              chatbotId,
              question: faq.question,
              answer: faq.answer,
              emoji: faq.emoji || "❓",
              position: index,
            },
          }),
        ),
      )

      return createdFAQs
    })

    return result
  } catch (error) {
    console.error("Error syncing chatbot FAQs:", error)
    throw new Error("Failed to sync FAQs.")
  }
}

export async function getChatbotProducts(chatbotId: number) {
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
  chatbotId: number,
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
    const result = await prisma.$transaction(async (tx) => {
      await tx.chatbotProduct.deleteMany({
        where: { chatbotId },
      })

      const createdProducts = await Promise.all(
        products.map((product, index) =>
          tx.chatbotProduct.create({
            data: {
              chatbotId,
              name: product.name,
              description: product.description,
              price: product.price,
              imageUrl: product.imageUrl,
              buttonText: product.buttonText || "خرید",
              secondaryText: product.secondaryText || "جزئیات",
              productUrl: product.productUrl,
              position: index,
            },
          }),
        ),
      )

      return createdProducts
    })

    return result
  } catch (error) {
    console.error("Error syncing chatbot products:", error)
    throw new Error("Failed to sync products.")
  }
}

export async function getChatbotOptions(chatbotId: number) {
  noStore()
  try {
    const options = await prisma.chatbotOption.findMany({
      where: { chatbotId },
      orderBy: { position: "asc" },
    })
    return options
  } catch (error) {
    console.error("Error fetching options:", error)
    throw new Error("Failed to fetch options.")
  }
}

export async function createChatbotOption(data: {
  chatbotId: number
  label: string
  emoji?: string
  position: number
}) {
  try {
    const option = await prisma.chatbotOption.create({
      data,
    })
    return option
  } catch (error) {
    console.error("Error creating chatbot option:", error)
    throw new Error("Failed to create chatbot option.")
  }
}

export async function deleteChatbotOption(id: number) {
  try {
    await prisma.chatbotOption.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error("Error deleting chatbot option:", error)
    return { success: false }
  }
}

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

// Analytics Functions
export async function getTotalMessageCount(chatbotId: number) {
  noStore()
  try {
    const count = await prisma.message.count({
      where: { chatbotId },
    })
    return count
  } catch (error) {
    console.error("Error getting total message count:", error)
    return 0
  }
}

export async function getUniqueUsersCount(chatbotId: number) {
  noStore()
  try {
    const result = await prisma.message.findMany({
      where: { chatbotId },
      select: { userIp: true },
      distinct: ["userIp"],
    })
    return result.length
  } catch (error) {
    console.error("Error getting unique users count:", error)
    return 0
  }
}

export async function getMessageCountByDay(chatbotId: number, days = 7) {
  noStore()
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const messages = await prisma.message.findMany({
      where: {
        chatbotId,
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        timestamp: true,
      },
    })

    // Group by date
    const grouped = messages.reduce(
      (acc, message) => {
        const date = message.timestamp.toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }))
  } catch (error) {
    console.error("Error getting message count by day:", error)
    return []
  }
}

export async function getMessageCountByWeek(chatbotId: number) {
  return prisma.$queryRawUnsafe<{ week: string; count: number }[]>(
    `
    SELECT DATE_TRUNC('week', "timestamp")::text as week,
           COUNT(*) as count
    FROM "messages"
    WHERE "chatbot_id" = $1
    GROUP BY week
    ORDER BY week;
  `,
    chatbotId,
  )
}

export async function getMessageCountByMonth(chatbotId: number) {
  return prisma.$queryRawUnsafe<{ month: string; count: number }[]>(
    `
    SELECT DATE_TRUNC('month', "timestamp")::text as month,
           COUNT(*) as count
    FROM "messages"
    WHERE "chatbot_id" = $1
    GROUP BY month
    ORDER BY month;
  `,
    chatbotId,
  )
}

export async function getAverageMessagesPerUser(chatbotId: number) {
  const result = await prisma.$queryRawUnsafe<{ avg: number }[]>(
    `
    SELECT AVG(cnt)::numeric as avg
    FROM (
      SELECT COUNT(*) as cnt
      FROM "messages"
      WHERE "chatbot_id" = $1
      GROUP BY "user_ip"
    ) sub;
  `,
    chatbotId,
  )

  return Number(result[0]?.avg || 0)
}

export async function getTopUserQuestions(chatbotId: number, limit = 10) {
  noStore()
  try {
    const messages = await prisma.message.findMany({
      where: {
        chatbotId,
        userMessage: {
          not: {
            equals: "",
          },
        },
      },
      select: {
        userMessage: true,
      },
    })

    // Count occurrences
    const questionCounts = messages.reduce(
      (acc, message) => {
        const question = message.userMessage
        if (question && question.length > 5) {
          acc[question] = (acc[question] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    // Sort and limit
    return Object.entries(questionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([question, count]) => ({
        question,
        count,
      }))
  } catch (error) {
    console.error("Error getting top user questions:", error)
    return []
  }
}

// Admin User Functions
export async function getChatbotAdminUsers(chatbotId: number) {
  noStore()
  try {
    const adminUsers = await prisma.chatbotAdminUser.findMany({
      where: { chatbotId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        chatbotId: true,
        username: true,
        fullName: true,
        email: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return adminUsers
  } catch (error) {
    console.error("Error fetching admin users:", error)
    throw new Error("Failed to fetch admin users.")
  }
}

export async function createAdminUser(data: {
  chatbotId: number
  username: string
  passwordHash: string
  fullName?: string
  email?: string
  isActive?: boolean
}) {
  try {
    const adminUser = await prisma.chatbotAdminUser.create({
      data,
      select: {
        id: true,
        chatbotId: true,
        username: true,
        fullName: true,
        email: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return adminUser
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to create admin user.")
  }
}

export async function getAdminUserByUsername(chatbotId: number, username: string) {
  noStore()
  try {
    const adminUser = await prisma.chatbotAdminUser.findFirst({
      where: {
        chatbotId,
        username,
        isActive: true,
      },
    })
    return adminUser
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch admin user by username.")
  }
}

export async function updateAdminUserLastLogin(id: number) {
  try {
    await prisma.chatbotAdminUser.update({
      where: { id },
      data: { lastLogin: new Date() },
    })
    return { success: true }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to update admin user last login.")
  }
}

// Legacy function aliases for backward compatibility
export const getAllChatbots = getChatbots
export const getChatbotByIdLegacy = getChatbot
export const createMessageLegacy = createMessage
export const getFAQsByChatbotIdLegacy = getChatbotFAQs
export const getProductsByChatbotIdLegacy = getChatbotProducts

// Stats multiplier functions
export async function updateStatsMultiplier(chatbotId: number, multiplier: number) {
  try {
    await prisma.chatbot.update({
      where: { id: chatbotId },
      data: { statsMultiplier: multiplier },
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return { success: false }
  }
}

export async function getStatsMultiplier(chatbotId: number) {
  noStore()
  try {
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      select: { statsMultiplier: true },
    })
    return chatbot?.statsMultiplier ? Number(chatbot.statsMultiplier) : 1.0
  } catch (error) {
    console.error("Error getting stats multiplier:", error)
    return 1.0
  }
}

export { prisma }
export default prisma
