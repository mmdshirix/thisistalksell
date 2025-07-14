import { PrismaClient } from "@prisma/client"
import { unstable_noStore as noStore } from "next/cache"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

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

// Chatbot Functions
export async function getChatbots() {
  noStore()
  try {
    const chatbots = await prisma.chatbot.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            messages: true,
            tickets: true,
            faqs: true,
            products: true,
          },
        },
      },
    })
    return chatbots
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    throw new Error(`Failed to fetch chatbots: ${error}`)
  }
}

export async function getChatbot(id: number) {
  noStore()
  try {
    const chatbot = await prisma.chatbot.findUnique({
      where: { id },
      include: {
        faqs: { orderBy: { position: "asc" } },
        products: { orderBy: { position: "asc" } },
        options: { orderBy: { position: "asc" } },
        _count: {
          select: {
            messages: true,
            tickets: true,
          },
        },
      },
    })
    return chatbot
  } catch (error) {
    console.error(`Error fetching chatbot ${id}:`, error)
    throw error
  }
}

export async function createChatbot(data: {
  name: string
  welcomeMessage?: string
  navigationMessage?: string
  primaryColor?: string
  textColor?: string
  backgroundColor?: string
  chatIcon?: string
  position?: string
  marginX?: number
  marginY?: number
  deepseekApiKey?: string | null
  knowledgeBaseText?: string | null
  knowledgeBaseUrl?: string | null
  storeUrl?: string | null
  aiUrl?: string | null
  statsMultiplier?: number
  enableProductSuggestions?: boolean
  enableNextSuggestions?: boolean
  promptTemplate?: string | null
}) {
  try {
    const chatbot = await prisma.chatbot.create({
      data: {
        name: data.name,
        welcomeMessage: data.welcomeMessage || "سلام! چطور می‌توانم به شما کمک کنم؟",
        navigationMessage: data.navigationMessage || "چه چیزی شما را به اینجا آورده است؟",
        primaryColor: data.primaryColor || "#14b8a6",
        textColor: data.textColor || "#ffffff",
        backgroundColor: data.backgroundColor || "#f3f4f6",
        chatIcon: data.chatIcon || "💬",
        position: data.position || "bottom-right",
        marginX: data.marginX || 20,
        marginY: data.marginY || 20,
        deepseekApiKey: data.deepseekApiKey,
        knowledgeBaseText: data.knowledgeBaseText,
        knowledgeBaseUrl: data.knowledgeBaseUrl,
        storeUrl: data.storeUrl,
        aiUrl: data.aiUrl,
        statsMultiplier: data.statsMultiplier || 1.0,
        enableProductSuggestions: data.enableProductSuggestions ?? true,
        enableNextSuggestions: data.enableNextSuggestions ?? true,
        promptTemplate: data.promptTemplate,
      },
    })
    return chatbot
  } catch (error) {
    console.error("Error creating chatbot:", error)
    throw new Error(`Failed to create chatbot: ${error}`)
  }
}

export async function updateChatbot(
  id: number,
  data: Partial<{
    name: string
    welcomeMessage: string
    navigationMessage: string
    primaryColor: string
    textColor: string
    backgroundColor: string
    chatIcon: string
    position: string
    marginX: number
    marginY: number
    deepseekApiKey: string | null
    knowledgeBaseText: string | null
    knowledgeBaseUrl: string | null
    storeUrl: string | null
    aiUrl: string | null
    statsMultiplier: number
    enableProductSuggestions: boolean
    enableNextSuggestions: boolean
    promptTemplate: string | null
  }>,
) {
  try {
    const chatbot = await prisma.chatbot.update({
      where: { id },
      data,
    })
    return chatbot
  } catch (error) {
    console.error(`Error updating chatbot ${id}:`, error)
    throw error
  }
}

export async function deleteChatbot(id: number) {
  try {
    await prisma.chatbot.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error(`Error deleting chatbot ${id}:`, error)
    return false
  }
}

// Message Functions
export async function getChatbotMessages(chatbotId: number) {
  noStore()
  try {
    const messages = await prisma.chatbotMessage.findMany({
      where: { chatbotId },
      orderBy: { timestamp: "desc" },
      take: 100,
    })
    return messages
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw error
  }
}

export async function saveMessage(data: {
  chatbotId: number
  userMessage: string
  botResponse?: string | null
  userIp?: string | null
  userAgent?: string | null
}) {
  try {
    const message = await prisma.chatbotMessage.create({
      data: {
        chatbotId: data.chatbotId,
        userMessage: data.userMessage,
        botResponse: data.botResponse,
        userIp: data.userIp,
        userAgent: data.userAgent,
      },
    })
    return message
  } catch (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

// FAQ Functions
export async function getChatbotFAQs(chatbotId: number) {
  noStore()
  try {
    const faqs = await prisma.chatbotFAQ.findMany({
      where: { chatbotId },
      orderBy: { position: "asc" },
    })
    return faqs
  } catch (error) {
    console.error(`Error fetching FAQs for chatbot ${chatbotId}:`, error)
    throw error
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
    throw error
  }
}

// Product Functions
export async function getChatbotProducts(chatbotId: number) {
  noStore()
  try {
    const products = await prisma.chatbotProduct.findMany({
      where: { chatbotId },
      orderBy: { position: "asc" },
    })
    return products
  } catch (error) {
    console.error(`Error fetching products for chatbot ${chatbotId}:`, error)
    throw error
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
    throw error
  }
}

// Option Functions
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
    throw error
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
    throw error
  }
}

export async function deleteChatbotOption(id: number) {
  try {
    await prisma.chatbotOption.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error("Error deleting chatbot option:", error)
    return false
  }
}

// Ticket Functions
export async function createTicket(data: {
  chatbotId: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  imageUrl?: string
  userIp?: string
  userAgent?: string
}) {
  noStore()
  try {
    const ticket = await prisma.ticket.create({
      data: {
        chatbotId: data.chatbotId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        imageUrl: data.imageUrl,
        userIp: data.userIp,
        userAgent: data.userAgent,
      },
    })
    return ticket
  } catch (error) {
    console.error("Error creating ticket:", error)
    throw error
  }
}

export async function getTicketById(ticketId: number) {
  noStore()
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        responses: {
          orderBy: { createdAt: "asc" },
        },
        chatbot: {
          select: { name: true },
        },
      },
    })
    return ticket
  } catch (error) {
    console.error("Error getting ticket:", error)
    throw error
  }
}

export async function getChatbotTickets(chatbotId: number) {
  noStore()
  try {
    const tickets = await prisma.ticket.findMany({
      where: { chatbotId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    })
    return tickets
  } catch (error) {
    console.error("Error fetching tickets:", error)
    throw error
  }
}

export async function updateTicketStatus(
  ticketId: number,
  status: "OPEN" | "CLOSED" | "PENDING" | "IN_PROGRESS" | "RESOLVED",
) {
  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    })
  } catch (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }
}

export async function getTicketResponses(ticketId: number) {
  noStore()
  try {
    const responses = await prisma.ticketResponse.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
    })
    return responses
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    throw error
  }
}

export async function addTicketResponse(ticketId: number, message: string, isAdmin = false) {
  try {
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId,
        message,
        isAdmin,
      },
    })
    return response
  } catch (error) {
    console.error("Error adding ticket response:", error)
    throw error
  }
}

// Analytics Functions
export async function getTotalMessageCount(chatbotId: number) {
  noStore()
  try {
    const count = await prisma.chatbotMessage.count({
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
    const result = await prisma.chatbotMessage.findMany({
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

    const messages = await prisma.chatbotMessage.findMany({
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

export async function getTopUserQuestions(chatbotId: number, limit = 10) {
  noStore()
  try {
    const messages = await prisma.chatbotMessage.findMany({
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
        if (question.length > 5) {
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
    throw error
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
    console.error("Error creating admin user:", error)
    throw new Error(`Failed to create admin user: ${error}`)
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
    console.error("Error fetching admin user by username:", error)
    throw error
  }
}

export async function updateAdminUserLastLogin(id: number) {
  try {
    await prisma.chatbotAdminUser.update({
      where: { id },
      data: { lastLogin: new Date() },
    })
  } catch (error) {
    console.error("Error updating admin user last login:", error)
    throw error
  }
}

// Legacy function aliases for backward compatibility
export const getAllChatbots = getChatbots
export const getChatbotById = getChatbot
export const createMessage = saveMessage
export const getFAQsByChatbotId = getChatbotFAQs
export const getProductsByChatbotId = getChatbotProducts

// Stats multiplier functions
export async function updateStatsMultiplier(chatbotId: number, multiplier: number) {
  try {
    await prisma.chatbot.update({
      where: { id: chatbotId },
      data: { statsMultiplier: multiplier },
    })
    return true
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return false
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
