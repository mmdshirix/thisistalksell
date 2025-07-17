import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

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
  created_at: Date
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
  user_name: string
  user_phone: string
  user_email: string | null
  subject: string
  message: string
  status: "open" | "in_progress" | "closed"
  priority: "low" | "medium" | "high"
  image_url: string | null
  created_at: Date
  updated_at: Date
}

// Database initialization
export async function initializeDatabase() {
  try {
    console.log("🔄 Starting complete database reset...")

    // Step 1: Drop all tables in correct order (reverse of creation)
    const dropTables = [
      "DROP TABLE IF EXISTS ticket_responses CASCADE",
      "DROP TABLE IF EXISTS tickets CASCADE",
      "DROP TABLE IF EXISTS chatbot_admin_users CASCADE",
      "DROP TABLE IF EXISTS chatbot_messages CASCADE",
      "DROP TABLE IF EXISTS chatbot_products CASCADE",
      "DROP TABLE IF EXISTS chatbot_faqs CASCADE",
      "DROP TABLE IF EXISTS chatbots CASCADE",
    ]

    for (const dropQuery of dropTables) {
      await sql`${dropQuery}`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chatbot_messages_chatbot_id 
          FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
      )
    `
    console.log("✅ Created chatbot_messages table")

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
        CONSTRAINT fk_chatbot_admin_users_chatbot_id 
          FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE,
        UNIQUE(chatbot_id, username)
      )
    `
    console.log("✅ Created chatbot_admin_users table")

    // Create tickets table
    await sql`
      CREATE TABLE tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        user_email VARCHAR(255),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(10) DEFAULT 'medium',
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
        responder_name VARCHAR(100) NOT NULL,
        response_text TEXT NOT NULL,
        is_admin_response BOOLEAN DEFAULT false,
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
    await sql`CREATE INDEX idx_chatbot_admin_users_chatbot_id ON chatbot_admin_users(chatbot_id)`
    await sql`CREATE INDEX idx_tickets_chatbot_id ON tickets(chatbot_id)`
    await sql`CREATE INDEX idx_ticket_responses_ticket_id ON ticket_responses(ticket_id)`
    console.log("✅ Created indexes")

    console.log("🎉 Database initialization completed successfully!")
    return { success: true, message: "دیتابیس با موفقیت راه‌اندازی شد" }
  } catch (error) {
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

export async function getAllChatbots() {
  try {
    const result = await sql`SELECT * FROM chatbots ORDER BY created_at DESC`
    return result
  } catch (error) {
    console.error("Error getting all chatbots:", error)
    throw error
  }
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

export async function syncChatbotFAQs(chatbotId: number, faqs: Partial<ChatbotFAQ>[]) {
  try {
    // Delete existing FAQs
    await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`

    // Insert new FAQs
    if (faqs.length > 0) {
      const values = faqs.map((faq, index) => [
        chatbotId,
        faq.question || "",
        faq.answer || "",
        faq.emoji || "❓",
        faq.position || index,
      ])

      for (const [chatbot_id, question, answer, emoji, position] of values) {
        await sql`
          INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
          VALUES (${chatbot_id}, ${question}, ${answer}, ${emoji}, ${position})
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

export async function syncChatbotProducts(chatbotId: number, products: Partial<ChatbotProduct>[]) {
  try {
    // Delete existing products
    await sql`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`

    // Insert new products
    if (products.length > 0) {
      const values = products.map((product, index) => [
        chatbotId,
        product.name || "",
        product.description || "",
        product.price || null,
        product.image_url || null,
        product.button_text || "خرید",
        product.secondary_text || "جزئیات",
        product.product_url || null,
        product.position || index,
      ])

      for (const [
        chatbot_id,
        name,
        description,
        price,
        image_url,
        button_text,
        secondary_text,
        product_url,
        position,
      ] of values) {
        await sql`
          INSERT INTO chatbot_products (
            chatbot_id, name, description, price, image_url, 
            button_text, secondary_text, product_url, position
          )
          VALUES (
            ${chatbot_id}, ${name}, ${description}, ${price}, ${image_url},
            ${button_text}, ${secondary_text}, ${product_url}, ${position}
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

export async function getChatbotMessages(chatbotId: number, limit = 100) {
  try {
    const result = await sql`
      SELECT * FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error getting chatbot messages:", error)
    throw error
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
