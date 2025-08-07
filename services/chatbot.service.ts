import { getSql } from '@/lib/db'
import logger from '@/lib/logger'

export interface Chatbot {
  id: string
  name: string
  description?: string
  model: string
  temperature: number
  max_tokens: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
  show_product_suggestions: boolean
  show_faq_suggestions: boolean
  show_quick_options: boolean
  show_ticket_form: boolean
  created_at: Date
  updated_at: Date
}

export class ChatbotService {
  private sql = getSql()

  async getAllChatbots(): Promise<Chatbot[]> {
    try {
      const chatbots = await this.sql`
        SELECT * FROM chatbots 
        ORDER BY created_at DESC
      `
      return chatbots as Chatbot[]
    } catch (error) {
      logger.error('Error fetching chatbots:', error)
      throw new Error('Failed to fetch chatbots')
    }
  }

  async getChatbotById(id: string): Promise<Chatbot | null> {
    try {
      const chatbots = await this.sql`
        SELECT * FROM chatbots 
        WHERE id = ${id}
      `
      return chatbots[0] as Chatbot || null
    } catch (error) {
      logger.error('Error fetching chatbot:', error)
      throw new Error('Failed to fetch chatbot')
    }
  }

  async createChatbot(data: Partial<Chatbot>): Promise<Chatbot> {
    try {
      const chatbots = await this.sql`
        INSERT INTO chatbots (
          name, description, model, temperature, max_tokens, 
          top_p, frequency_penalty, presence_penalty,
          show_product_suggestions, show_faq_suggestions, 
          show_quick_options, show_ticket_form
        ) VALUES (
          ${data.name}, ${data.description}, ${data.model || 'gpt-4o'}, 
          ${data.temperature || 0.7}, ${data.max_tokens || 500},
          ${data.top_p || 1}, ${data.frequency_penalty || 0}, 
          ${data.presence_penalty || 0}, ${data.show_product_suggestions || false},
          ${data.show_faq_suggestions || false}, ${data.show_quick_options || false},
          ${data.show_ticket_form || false}
        ) RETURNING *
      `
      return chatbots[0] as Chatbot
    } catch (error) {
      logger.error('Error creating chatbot:', error)
      throw new Error('Failed to create chatbot')
    }
  }

  async updateChatbot(id: string, data: Partial<Chatbot>): Promise<Chatbot> {
    try {
      const chatbots = await this.sql`
        UPDATE chatbots SET
          name = COALESCE(${data.name}, name),
          description = COALESCE(${data.description}, description),
          model = COALESCE(${data.model}, model),
          temperature = COALESCE(${data.temperature}, temperature),
          max_tokens = COALESCE(${data.max_tokens}, max_tokens),
          top_p = COALESCE(${data.top_p}, top_p),
          frequency_penalty = COALESCE(${data.frequency_penalty}, frequency_penalty),
          presence_penalty = COALESCE(${data.presence_penalty}, presence_penalty),
          show_product_suggestions = COALESCE(${data.show_product_suggestions}, show_product_suggestions),
          show_faq_suggestions = COALESCE(${data.show_faq_suggestions}, show_faq_suggestions),
          show_quick_options = COALESCE(${data.show_quick_options}, show_quick_options),
          show_ticket_form = COALESCE(${data.show_ticket_form}, show_ticket_form),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return chatbots[0] as Chatbot
    } catch (error) {
      logger.error('Error updating chatbot:', error)
      throw new Error('Failed to update chatbot')
    }
  }

  async deleteChatbot(id: string): Promise<boolean> {
    try {
      await this.sql`DELETE FROM chatbots WHERE id = ${id}`
      return true
    } catch (error) {
      logger.error('Error deleting chatbot:', error)
      throw new Error('Failed to delete chatbot')
    }
  }
}
