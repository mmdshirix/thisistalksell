import { getSql } from "@/lib/db"
import logger from "@/lib/logger"
import { z } from "zod"

export const createChatbotSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  welcome_message: z.string().optional(),
  navigation_message: z.string().optional(),
  primary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
  text_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
  background_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
  chat_icon: z.string().optional(),
  position: z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]).optional(),
  store_url: z.string().url("Invalid URL").optional(),
  ai_url: z.string().url("Invalid URL").optional(),
})

export const updateChatbotSchema = createChatbotSchema.partial()

export interface ChatbotWithRelations {
  id: number
  name: string
  welcome_message: string | null
  navigation_message: string | null
  primary_color: string | null
  text_color: string | null
  background_color: string | null
  chat_icon: string | null
  position: string | null
  store_url: string | null
  ai_url: string | null
  stats_multiplier: number
  created_at: Date
  updated_at: Date
  faqs: Array<{
    id: number
    question: string
    answer: string
    emoji: string | null
  }>
  products: Array<{
    id: number
    name: string
    description: string | null
    price: number | null
    image_url: string | null
    product_url: string | null
    button_text: string | null
  }>
  _count: {
    tickets: number
  }
}

export class ChatbotService {
  private static sql = getSql()

  static async getAllChatbots(): Promise<ChatbotWithRelations[]> {
    try {
      const chatbotsResult = await this.sql`
        SELECT 
          id, name, welcome_message, navigation_message,
          primary_color, text_color, background_color, chat_icon,
          position, store_url, ai_url, stats_multiplier,
          created_at, updated_at
        FROM chatbots 
        ORDER BY created_at DESC
      `

      const chatbots = []
      for (const chatbot of chatbotsResult.rows) {
        // Get FAQs for this chatbot
        const faqsResult = await this.sql`
          SELECT id, question, answer, emoji
          FROM chatbot_faqs 
          WHERE chatbot_id = ${chatbot.id}
          ORDER BY position ASC
        `

        // Get products for this chatbot
        const productsResult = await this.sql`
          SELECT id, name, description, price, image_url, product_url, button_text
          FROM chatbot_products 
          WHERE chatbot_id = ${chatbot.id}
          ORDER BY position ASC
        `

        // Get ticket count for this chatbot
        const ticketCountResult = await this.sql`
          SELECT COUNT(*) as count
          FROM tickets 
          WHERE chatbot_id = ${chatbot.id}
        `

        chatbots.push({
          ...chatbot,
          faqs: faqsResult.rows,
          products: productsResult.rows,
          _count: {
            tickets: Number.parseInt(ticketCountResult.rows[0].count),
          },
        })
      }

      logger.info(`Retrieved ${chatbots.length} chatbots`)
      return chatbots
    } catch (error) {
      logger.error("Error fetching chatbots:", error)
      throw new Error("Failed to fetch chatbots")
    }
  }

  static async getChatbotById(id: number): Promise<ChatbotWithRelations | null> {
    try {
      const chatbotResult = await this.sql`
        SELECT 
          id, name, welcome_message, navigation_message,
          primary_color, text_color, background_color, chat_icon,
          position, store_url, ai_url, stats_multiplier,
          created_at, updated_at
        FROM chatbots 
        WHERE id = ${id}
      `

      if (chatbotResult.rows.length === 0) {
        logger.warn(`Chatbot not found with ID: ${id}`)
        return null
      }

      const chatbot = chatbotResult.rows[0]

      // Get FAQs for this chatbot
      const faqsResult = await this.sql`
        SELECT id, question, answer, emoji
        FROM chatbot_faqs 
        WHERE chatbot_id = ${id}
        ORDER BY position ASC
      `

      // Get products for this chatbot
      const productsResult = await this.sql`
        SELECT id, name, description, price, image_url, product_url, button_text
        FROM chatbot_products 
        WHERE chatbot_id = ${id}
        ORDER BY position ASC
      `

      // Get ticket count for this chatbot
      const ticketCountResult = await this.sql`
        SELECT COUNT(*) as count
        FROM tickets 
        WHERE chatbot_id = ${id}
      `

      const result = {
        ...chatbot,
        faqs: faqsResult.rows,
        products: productsResult.rows,
        _count: {
          tickets: Number.parseInt(ticketCountResult.rows[0].count),
        },
      }

      logger.info(`Retrieved chatbot with ID: ${id}`)
      return result
    } catch (error) {
      logger.error(`Error fetching chatbot ${id}:`, error)
      throw new Error("Failed to fetch chatbot")
    }
  }

  static async createChatbot(data: z.infer<typeof createChatbotSchema>) {
    try {
      const validatedData = createChatbotSchema.parse(data)

      const chatbotResult = await this.sql`
        INSERT INTO chatbots (
          name, welcome_message, navigation_message,
          primary_color, text_color, background_color, chat_icon,
          position, store_url, ai_url, stats_multiplier,
          created_at, updated_at
        ) VALUES (
          ${validatedData.name},
          ${validatedData.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟"},
          ${validatedData.navigation_message || "چه چیزی شما را به اینجا آورده است؟"},
          ${validatedData.primary_color || "#14b8a6"},
          ${validatedData.text_color || "#ffffff"},
          ${validatedData.background_color || "#f3f4f6"},
          ${validatedData.chat_icon || "💬"},
          ${validatedData.position || "bottom-right"},
          ${validatedData.store_url || null},
          ${validatedData.ai_url || null},
          1.0,
          NOW(),
          NOW()
        )
        RETURNING *
      `

      const chatbot = chatbotResult.rows[0]

      logger.info(`Created new chatbot: ${chatbot.name} (ID: ${chatbot.id})`)
      return {
        ...chatbot,
        faqs: [],
        products: [],
        _count: { tickets: 0 },
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Validation error creating chatbot:", error.errors)
        throw new Error("Invalid chatbot data")
      }
      logger.error("Error creating chatbot:", error)
      throw new Error("Failed to create chatbot")
    }
  }

  static async updateChatbot(id: number, data: z.infer<typeof updateChatbotSchema>) {
    try {
      const validatedData = updateChatbotSchema.parse(data)

      const updateFields = []
      const updateValues = []
      let paramIndex = 1

      Object.entries(validatedData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`)
          updateValues.push(value)
          paramIndex++
        }
      })

      if (updateFields.length === 0) {
        throw new Error("No fields to update")
      }

      updateFields.push(`updated_at = $${paramIndex}`)
      updateValues.push(new Date())
      updateValues.push(id) // for WHERE clause

      const query = `
        UPDATE chatbots 
        SET ${updateFields.join(", ")}
        WHERE id = $${paramIndex + 1}
        RETURNING *
      `

      const chatbotResult = await this.sql.query(query, updateValues)
      const chatbot = chatbotResult.rows[0]

      logger.info(`Updated chatbot: ${chatbot.name} (ID: ${chatbot.id})`)
      return chatbot
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Validation error updating chatbot:", error.errors)
        throw new Error("Invalid chatbot data")
      }
      logger.error(`Error updating chatbot ${id}:`, error)
      throw new Error("Failed to update chatbot")
    }
  }

  static async deleteChatbot(id: number): Promise<void> {
    try {
      await this.sql`DELETE FROM chatbots WHERE id = ${id}`
      logger.info(`Deleted chatbot with ID: ${id}`)
    } catch (error) {
      logger.error(`Error deleting chatbot ${id}:`, error)
      throw new Error("Failed to delete chatbot")
    }
  }

  static async getChatbotStats(id: number) {
    try {
      const ticketCountResult = await this.sql`
        SELECT COUNT(*) as count FROM tickets WHERE chatbot_id = ${id}
      `
      const faqCountResult = await this.sql`
        SELECT COUNT(*) as count FROM chatbot_faqs WHERE chatbot_id = ${id}
      `
      const productCountResult = await this.sql`
        SELECT COUNT(*) as count FROM chatbot_products WHERE chatbot_id = ${id}
      `

      const stats = {
        tickets: Number.parseInt(ticketCountResult.rows[0].count),
        faqs: Number.parseInt(faqCountResult.rows[0].count),
        products: Number.parseInt(productCountResult.rows[0].count),
      }

      logger.info(`Retrieved stats for chatbot ${id}:`, stats)
      return stats
    } catch (error) {
      logger.error(`Error fetching stats for chatbot ${id}:`, error)
      throw new Error("Failed to fetch chatbot stats")
    }
  }
}
