import { neon } from "@neondatabase/serverless"

// Lazy initialization to avoid build-time execution
let sqlInstance: ReturnType<typeof neon> | null = null

function getSql() {
  if (!sqlInstance) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    sqlInstance = neon(databaseUrl)
  }
  return sqlInstance
}

// Export the lazy SQL instance
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(target, prop) {
    const sqlInstance = getSql()
    const value = sqlInstance[prop as keyof typeof sqlInstance]
    if (typeof value === "function") {
      return value.bind(sqlInstance)
    }
    return value
  },
})

// Database helper functions
export async function getChatbot(id: number) {
  try {
    const result = await sql`
      SELECT * FROM chatbots WHERE id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return null
  }
}

export async function getAllChatbots() {
  try {
    const result = await sql`
      SELECT * FROM chatbots ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return []
  }
}

export async function createChatbot(data: any) {
  try {
    const result = await sql`
      INSERT INTO chatbots (
        name, primary_color, text_color, background_color, 
        chat_icon, position, margin_x, margin_y, 
        welcome_message, navigation_message, knowledge_base_text, 
        knowledge_base_url, store_url, ai_url, deepseek_api_key
      )
      VALUES (
        ${data.name}, ${data.primary_color || "#3B82F6"}, ${data.text_color || "#FFFFFF"}, 
        ${data.background_color || "#FFFFFF"}, ${data.chat_icon || "💬"}, 
        ${data.position || "bottom-right"}, ${data.margin_x || 20}, ${data.margin_y || 20},
        ${data.welcome_message || "سلام! چطور می‌توانم کمکتان کنم؟"}, 
        ${data.navigation_message || "لطفاً یکی از گزینه‌های زیر را انتخاب کنید:"}, 
        ${data.knowledge_base_text || ""}, ${data.knowledge_base_url || ""}, 
        ${data.store_url || ""}, ${data.ai_url || ""}, ${data.deepseek_api_key || ""}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating chatbot:", error)
    throw error
  }
}

export async function updateChatbot(id: number, data: any) {
  try {
    const result = await sql`
      UPDATE chatbots 
      SET 
        name = ${data.name},
        primary_color = ${data.primary_color},
        text_color = ${data.text_color},
        background_color = ${data.background_color},
        chat_icon = ${data.chat_icon},
        position = ${data.position},
        margin_x = ${data.margin_x},
        margin_y = ${data.margin_y},
        welcome_message = ${data.welcome_message},
        navigation_message = ${data.navigation_message},
        knowledge_base_text = ${data.knowledge_base_text},
        knowledge_base_url = ${data.knowledge_base_url},
        store_url = ${data.store_url},
        ai_url = ${data.ai_url},
        deepseek_api_key = ${data.deepseek_api_key},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return null
  }
}

export async function deleteChatbot(id: number) {
  try {
    const result = await sql`
      DELETE FROM chatbots WHERE id = ${id} RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return null
  }
}

export async function saveChatbotMessage(chatbotId: number, userMessage: string, botResponse: string, userIp: string) {
  try {
    const result = await sql`
      INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, timestamp)
      VALUES (${chatbotId}, ${userMessage}, ${botResponse}, ${userIp}, NOW())
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

export async function getChatbotMessages(chatbotId: number, limit = 50) {
  try {
    const result = await sql`
      SELECT * FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY timestamp DESC 
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error fetching messages:", error)
    return []
  }
}

export async function getChatbotStats(chatbotId: number) {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT user_ip) as unique_users,
        COUNT(CASE WHEN DATE(timestamp) = CURRENT_DATE THEN 1 END) as today_messages
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId}
    `
    return result[0] || { total_messages: 0, unique_users: 0, today_messages: 0 }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return { total_messages: 0, unique_users: 0, today_messages: 0 }
  }
}

export async function getChatbotTickets(chatbotId: number) {
  try {
    const result = await sql`
      SELECT * FROM tickets 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
}

export async function getChatbotFAQs(chatbotId: number) {
  try {
    const result = await sql`
      SELECT * FROM chatbot_faqs 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY position ASC
    `
    return result
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return []
  }
}

export async function syncChatbotFAQs(chatbotId: number, faqs: any[]) {
  try {
    // Delete existing FAQs
    await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`

    // Insert new FAQs
    const results = []
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i]
      const result = await sql`
        INSERT INTO chatbot_faqs (chatbot_id, question, answer, position)
        VALUES (${chatbotId}, ${faq.question}, ${faq.answer}, ${i})
        RETURNING *
      `
      results.push(result[0])
    }

    return results
  } catch (error) {
    console.error("Error syncing FAQs:", error)
    throw error
  }
}

export async function getChatbotProducts(chatbotId: number) {
  try {
    const result = await sql`
      SELECT * FROM chatbot_products 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY position ASC
    `
    return result
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function syncChatbotProducts(chatbotId: number, products: any[]) {
  try {
    // Delete existing products
    await sql`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`

    // Insert new products
    const results = []
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const result = await sql`
        INSERT INTO chatbot_products (chatbot_id, name, description, price, image_url, product_url, position)
        VALUES (${chatbotId}, ${product.name}, ${product.description}, ${product.price}, ${product.image_url}, ${product.product_url}, ${i})
        RETURNING *
      `
      results.push(result[0])
    }

    return results
  } catch (error) {
    console.error("Error syncing products:", error)
    throw error
  }
}

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

export async function createChatbotOption(data: any) {
  try {
    const result = await sql`
      INSERT INTO chatbot_options (chatbot_id, label, emoji, position)
      VALUES (${data.chatbot_id}, ${data.label}, ${data.emoji}, ${data.position})
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
    const result = await sql`
      DELETE FROM chatbot_options WHERE id = ${id} RETURNING *
    `
    return result.length > 0
  } catch (error) {
    console.error("Error deleting option:", error)
    return false
  }
}

export async function getStatsMultiplier(chatbotId: number) {
  try {
    const result = await sql`
      SELECT COALESCE(stats_multiplier, 1.0) as multiplier 
      FROM chatbots 
      WHERE id = ${chatbotId}
    `
    return Number(result[0]?.multiplier || 1.0)
  } catch (error) {
    console.error("Error fetching stats multiplier:", error)
    return 1.0
  }
}

export async function updateStatsMultiplier(chatbotId: number, multiplier: number) {
  try {
    const result = await sql`
      UPDATE chatbots 
      SET stats_multiplier = ${multiplier}, updated_at = NOW()
      WHERE id = ${chatbotId}
      RETURNING *
    `
    return result.length > 0
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return false
  }
}

export async function getTotalMessageCount(chatbotId: number) {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
    `
    return Number(result[0]?.count || 0)
  } catch (error) {
    console.error("Error fetching message count:", error)
    return 0
  }
}

export async function getUniqueUsersCount(chatbotId: number) {
  try {
    const result = await sql`
      SELECT COUNT(DISTINCT user_ip) as count FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
    `
    return Number(result[0]?.count || 0)
  } catch (error) {
    console.error("Error fetching unique users count:", error)
    return 0
  }
}

export async function getMessageCountByDay(chatbotId: number, days: number) {
  try {
    const result = await sql`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
      AND timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `
    return result
  } catch (error) {
    console.error("Error fetching daily message count:", error)
    return []
  }
}

export async function getTopUserQuestions(chatbotId: number, limit: number) {
  try {
    const result = await sql`
      SELECT 
        user_message as question,
        COUNT(*) as count
      FROM chatbot_messages 
      WHERE chatbot_id = ${chatbotId} 
      AND user_message IS NOT NULL 
      AND LENGTH(user_message) > 5
      GROUP BY user_message
      ORDER BY count DESC
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error fetching top questions:", error)
    return []
  }
}

// Admin user functions
export async function getAdminUserByUsername(chatbotId: number, username: string) {
  try {
    const result = await sql`
      SELECT * FROM chatbot_admin_users 
      WHERE chatbot_id = ${chatbotId} AND username = ${username} AND is_active = true
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching admin user:", error)
    return null
  }
}

export async function updateAdminUserLastLogin(userId: number) {
  try {
    await sql`
      UPDATE chatbot_admin_users 
      SET last_login = NOW() 
      WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error("Error updating last login:", error)
    return false
  }
}

// Ticket functions
export async function updateTicketStatus(ticketId: number, status: string) {
  try {
    const result = await sql`
      UPDATE tickets 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${ticketId}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return null
  }
}

export async function addTicketResponse(ticketId: number, message: string, isAdmin: boolean) {
  try {
    const result = await sql`
      INSERT INTO ticket_responses (ticket_id, message, is_admin)
      VALUES (${ticketId}, ${message}, ${isAdmin})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error adding ticket response:", error)
    throw error
  }
}
