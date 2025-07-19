import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // دریافت اطلاعات چت‌بات
    const chatbots = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbots.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404, headers: corsHeaders })
    }

    const chatbot = chatbots[0]

    // دریافت محصولات
    let products = []
    try {
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

      products = await sql`
        SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId}
      `
    } catch (error) {
      console.error("Error fetching products:", error)
    }

    // دریافت FAQs
    let faqs = []
    try {
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

      faqs = await sql`
        SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}
      `
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    }

    // دریافت گزینه‌های سریع
    let options = []
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS chatbot_options (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL,
          label VARCHAR(255) NOT NULL,
          emoji VARCHAR(10) DEFAULT '💬',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      options = await sql`
        SELECT * FROM chatbot_options WHERE chatbot_id = ${chatbotId}
      `
    } catch (error) {
      console.error("Error fetching options:", error)
    }

    return NextResponse.json(
      {
        chatbot,
        products,
        faqs,
        options,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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
