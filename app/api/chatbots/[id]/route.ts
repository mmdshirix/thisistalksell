import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "public, max-age=300",
  }

  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400, headers: corsHeaders })
    }

    // اطمینان از وجود جداول
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS chatbots (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          primary_color VARCHAR(7) DEFAULT '#0D9488',
          text_color VARCHAR(7) DEFAULT '#FFFFFF',
          background_color VARCHAR(7) DEFAULT '#F9FAFB',
          chat_icon VARCHAR(10) DEFAULT '💬',
          position VARCHAR(20) DEFAULT 'bottom-right',
          margin_x INTEGER DEFAULT 20,
          margin_y INTEGER DEFAULT 20,
          welcome_message TEXT DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟',
          navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟',
          knowledge_base_text TEXT,
          knowledge_base_url TEXT,
          store_url TEXT,
          ai_url TEXT,
          stats_multiplier DECIMAL(3,2) DEFAULT 1.0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS chatbot_faqs (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          emoji VARCHAR(10) DEFAULT '❓',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS chatbot_products (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          image_url TEXT,
          product_url TEXT,
          button_text VARCHAR(100) DEFAULT 'خرید',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    } catch (setupError) {
      console.warn("Error setting up tables:", setupError)
    }

    // دریافت اطلاعات چت‌بات
    const chatbots = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbots.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404, headers: corsHeaders })
    }

    const chatbot = chatbots[0]

    // دریافت FAQs و محصولات
    const [faqs, products] = await Promise.all([
      sql`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY id`,
      sql`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY id`,
    ])

    const response = {
      success: true,
      chatbot: {
        id: chatbot.id,
        name: chatbot.name || "چت‌بات",
        primary_color: chatbot.primary_color || "#0D9488",
        text_color: chatbot.text_color || "#FFFFFF",
        background_color: chatbot.background_color || "#F9FAFB",
        chat_icon: chatbot.chat_icon || "💬",
        position: chatbot.position || "bottom-right",
        margin_x: chatbot.margin_x || 20,
        margin_y: chatbot.margin_y || 20,
        welcome_message: chatbot.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
        navigation_message: chatbot.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
        knowledge_base_text: chatbot.knowledge_base_text,
        knowledge_base_url: chatbot.knowledge_base_url,
        store_url: chatbot.store_url,
        ai_url: chatbot.ai_url,
        stats_multiplier: chatbot.stats_multiplier || 1.0,
      },
      faqs: faqs || [],
      products: products || [],
    }

    return NextResponse.json(response, { headers: corsHeaders })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400, headers: corsHeaders })
    }

    const body = await request.json()
    const {
      name,
      welcome_message,
      navigation_message,
      primary_color,
      text_color,
      background_color,
      chat_icon,
      position,
      margin_x,
      margin_y,
      store_url,
      ai_url,
    } = body

    const result = await sql`
      UPDATE chatbots 
      SET 
        name = ${name},
        welcome_message = ${welcome_message},
        navigation_message = ${navigation_message},
        primary_color = ${primary_color},
        text_color = ${text_color},
        background_color = ${background_color},
        chat_icon = ${chat_icon},
        position = ${position},
        margin_x = ${margin_x},
        margin_y = ${margin_y},
        store_url = ${store_url},
        ai_url = ${ai_url},
        updated_at = NOW()
      WHERE id = ${chatbotId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404, headers: corsHeaders })
    }

    return NextResponse.json(
      {
        success: true,
        chatbot: result[0],
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400, headers: corsHeaders })
    }

    const result = await sql`
      DELETE FROM chatbots WHERE id = ${chatbotId} RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404, headers: corsHeaders })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Chatbot deleted successfully",
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
