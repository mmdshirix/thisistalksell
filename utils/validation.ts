import { z } from 'zod'

export const chatbotSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  model: z.string().default('gpt-4o'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().min(1).max(4000).default(500),
  top_p: z.number().min(0).max(1).default(1),
  frequency_penalty: z.number().min(-2).max(2).default(0),
  presence_penalty: z.number().min(-2).max(2).default(0),
  show_product_suggestions: z.boolean().default(false),
  show_faq_suggestions: z.boolean().default(false),
  show_quick_options: z.boolean().default(false),
  show_ticket_form: z.boolean().default(false)
})

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export const ticketSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z.string().min(10, 'Phone number too short').max(20, 'Phone number too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  chatbot_id: z.string().min(1, 'Chatbot ID is required')
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  chatbot_id: z.string().min(1, 'Chatbot ID is required')
})

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Validation failed' }
  }
}
