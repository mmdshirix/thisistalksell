import { neon } from '@neondatabase/serverless'
import { logger } from './logger'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    logger.info('Database connection successful')
    return result
  } catch (error) {
    logger.error('Database connection failed:', error)
    throw error
  }
}

// Helper function to execute queries with error handling
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql(query, params)
    return result
  } catch (error) {
    logger.error('Query execution failed:', { query, params, error })
    throw error
  }
}

// Database initialization
export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id),
        content TEXT NOT NULL,
        is_user BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    logger.info('Database initialized successfully')
  } catch (error) {
    logger.error('Database initialization failed:', error)
    throw error
  }
}

// --- TYPE DEFINITIONS ---
export interface Chatbot {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  chatbot_id: number
  content: string
  is_user: boolean
  created_at: string
}

export interface FAQ {
  id: number
  chatbot_id: number
  question: string
  answer: string
  created_at: string
}

export interface Product {
  id: number
  chatbot_id: number
  name: string
  description: string | null
  price: number | null
  created_at: string
}

// --- DATABASE FUNCTIONS ---

// Get all chatbots
export async function getAllChatbots() {
  try {
    const result = await sql`SELECT * FROM chatbots ORDER BY created_at DESC`
    return result.rows
  } catch (error) {
    logger.error("Error fetching chatbots:", error)
    return []
  }
}

// Get chatbot by ID
export async function getChatbotById(id: number) {
  try {
    const result = await sql`SELECT * FROM chatbots WHERE id = ${id}`
    return result.rows[0] || null
  } catch (error) {
    logger.error(`Error fetching chatbot ${id}:`, error)
    return null
  }
}

// Create new chatbot
export async function createChatbot(data: {
  name: string
  description?: string
}) {
  try {
    if (!data.name || data.name.trim() === "") {
      throw new Error("Chatbot name is required")
    }
    
    const result = await sql`
      INSERT INTO chatbots (name, description, created_at, updated_at)
      VALUES (${data.name.trim()}, ${data.description || null}, NOW(), NOW())
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    logger.error("Error creating chatbot:", error)
    throw new Error(`Failed to create chatbot: ${error}`)
  }
}

// Update chatbot
export async function updateChatbot(id: number, data: any) {
  try {
    const result = await sql`
      UPDATE chatbots
      SET
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result.rows[0] || null
  } catch (error) {
    logger.error(`Error updating chatbot ${id}:`, error)
    return null
  }
}

// Delete chatbot
export async function deleteChatbot(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM chatbots WHERE id = ${id}`
    return true
  } catch (error) {
    logger.error(`Error deleting chatbot ${id}:`, error)
    return false
  }
}

// Message Functions
export async function getChatbotMessages(chatbotId: number): Promise<any[]> {
  try {
    const result = await sql`SELECT * FROM messages WHERE chatbot_id = ${chatbotId} ORDER BY created_at DESC LIMIT 100`
    return result.rows
  } catch (error) {
    logger.error("Error fetching messages from NEON:", error)
    return []
  }
}

export async function saveMessage(chatbotId: number, content: string, isUser: boolean) {
  try {
    const result = await sql`
      INSERT INTO messages (chatbot_id, content, is_user, created_at)
      VALUES (${chatbotId}, ${content}, ${isUser}, NOW())
      RETURNING id
    `
    return result.rows[0]?.id
  } catch (error) {
    logger.error("Error saving message:", error)
    throw error
  }
}

export const createMessage = saveMessage

// FAQ Functions
export async function getChatbotFAQs(chatbotId: number): Promise<any[]> {
  try {
    const result = await sql`SELECT * FROM faqs WHERE chatbot_id = ${chatbotId} ORDER BY id ASC`
    return result.rows
  } catch (error) {
    logger.error(`Error fetching FAQs for chatbot ${chatbotId}:`, error)
    throw error
  }
}

export async function syncChatbotFAQs(chatbotId: number, faqs: any[]): Promise<any[]> {
  try {
    // Delete existing FAQs
    await sql`DELETE FROM faqs WHERE chatbot_id = ${chatbotId}`

    const savedFAQs: any[] = []

    // Insert new FAQs
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i]
      const result = await sql`
        INSERT INTO faqs (chatbot_id, question, answer, created_at)
        VALUES (${chatbotId}, ${faq.question}, ${faq.answer}, NOW())
        RETURNING *
      `
      if (result.rows[0]) {
        savedFAQs.push(result.rows[0])
      }
    }

    return savedFAQs
  } catch (error) {
    logger.error("Error syncing chatbot FAQs:", error)
    throw error
  }
}

// Product Functions
export async function getChatbotProducts(chatbotId: number): Promise<any[]> {
  try {
    const result = await sql`SELECT * FROM products WHERE chatbot_id = ${chatbotId} ORDER BY id ASC`
    return result.rows
  } catch (error) {
    logger.error(`Error fetching products for chatbot ${chatbotId}:`, error)
    throw error
  }
}

export async function syncChatbotProducts(chatbotId: number, products: any[]): Promise<any[]> {
  try {
    // Delete existing products
    await sql`DELETE FROM products WHERE chatbot_id = ${chatbotId}`

    const savedProducts: any[] = []

    // Insert new products
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const result = await sql`
        INSERT INTO products (chatbot_id, name, description, price, created_at)
        VALUES (${chatbotId}, ${product.name}, ${product.description || null}, ${product.price || null}, NOW())
        RETURNING *
      `
      if (result.rows[0]) {
        savedProducts.push(result.rows[0])
      }
    }

    return savedProducts
  } catch (error) {
    logger.error("Error syncing chatbot products:", error)
    throw error
  }
}
