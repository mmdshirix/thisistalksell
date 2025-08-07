import { prisma } from '@/lib/db'
import logger from '@/lib/logger'
import { z } from 'zod'

export const createChatbotSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  welcome_message: z.string().optional(),
  navigation_message: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  text_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  chat_icon: z.string().url('Invalid URL').optional(),
  position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']).optional(),
  store_url: z.string().url('Invalid URL').optional(),
  ai_url: z.string().url('Invalid URL').optional(),
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
  static async getAllChatbots(): Promise<ChatbotWithRelations[]> {
    try {
      const chatbots = await prisma.chatbots.findMany({
        include: {
          faqs: {
            select: {
              id: true,
              question: true,
              answer: true,
              emoji: true,
            },
            orderBy: { created_at: 'desc' },
          },
          products: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              image_url: true,
              product_url: true,
              button_text: true,
            },
            orderBy: { created_at: 'desc' },
          },
          _count: {
            select: {
              tickets: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })

      logger.info(`Retrieved ${chatbots.length} chatbots`)
      return chatbots
    } catch (error) {
      logger.error('Error fetching chatbots:', error)
      throw new Error('Failed to fetch chatbots')
    }
  }

  static async getChatbotById(id: number): Promise<ChatbotWithRelations | null> {
    try {
      const chatbot = await prisma.chatbots.findUnique({
        where: { id },
        include: {
          faqs: {
            select: {
              id: true,
              question: true,
              answer: true,
              emoji: true,
            },
            orderBy: { created_at: 'desc' },
          },
          products: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              image_url: true,
              product_url: true,
              button_text: true,
            },
            orderBy: { created_at: 'desc' },
          },
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      })

      if (chatbot) {
        logger.info(`Retrieved chatbot with ID: ${id}`)
      } else {
        logger.warn(`Chatbot not found with ID: ${id}`)
      }

      return chatbot
    } catch (error) {
      logger.error(`Error fetching chatbot ${id}:`, error)
      throw new Error('Failed to fetch chatbot')
    }
  }

  static async createChatbot(data: z.infer<typeof createChatbotSchema>) {
    try {
      const validatedData = createChatbotSchema.parse(data)
      
      const chatbot = await prisma.chatbots.create({
        data: {
          ...validatedData,
          stats_multiplier: 1.0,
        },
        include: {
          faqs: true,
          products: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      })

      logger.info(`Created new chatbot: ${chatbot.name} (ID: ${chatbot.id})`)
      return chatbot
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error creating chatbot:', error.errors)
        throw new Error('Invalid chatbot data')
      }
      logger.error('Error creating chatbot:', error)
      throw new Error('Failed to create chatbot')
    }
  }

  static async updateChatbot(id: number, data: z.infer<typeof updateChatbotSchema>) {
    try {
      const validatedData = updateChatbotSchema.parse(data)
      
      const chatbot = await prisma.chatbots.update({
        where: { id },
        data: validatedData,
        include: {
          faqs: true,
          products: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      })

      logger.info(`Updated chatbot: ${chatbot.name} (ID: ${chatbot.id})`)
      return chatbot
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error updating chatbot:', error.errors)
        throw new Error('Invalid chatbot data')
      }
      logger.error(`Error updating chatbot ${id}:`, error)
      throw new Error('Failed to update chatbot')
    }
  }

  static async deleteChatbot(id: number): Promise<void> {
    try {
      await prisma.chatbots.delete({
        where: { id },
      })

      logger.info(`Deleted chatbot with ID: ${id}`)
    } catch (error) {
      logger.error(`Error deleting chatbot ${id}:`, error)
      throw new Error('Failed to delete chatbot')
    }
  }

  static async getChatbotStats(id: number) {
    try {
      const [ticketCount, faqCount, productCount] = await Promise.all([
        prisma.tickets.count({ where: { chatbot_id: id } }),
        prisma.faqs.count({ where: { chatbot_id: id } }),
        prisma.products.count({ where: { chatbot_id: id } }),
      ])

      const stats = {
        tickets: ticketCount,
        faqs: faqCount,
        products: productCount,
      }

      logger.info(`Retrieved stats for chatbot ${id}:`, stats)
      return stats
    } catch (error) {
      logger.error(`Error fetching stats for chatbot ${id}:`, error)
      throw new Error('Failed to fetch chatbot stats')
    }
  }
}
