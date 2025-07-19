import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    // دریافت اطلاعات چت‌بات
    const chatbots = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbots.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    const chatbot = chatbots[0]

    // دریافت FAQs
    const faqs = await sql`
      SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY id
    `

    // دریافت محصولات
    const products = await sql`
      SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY id
    `

    const response = {
      chatbot,
      faqs,
      products,
      // اطلاعات اضافی برای سازگاری
      id: chatbot.id,
      name: chatbot.name,
      primary_color: chatbot.primary_color,
      chat_icon: chatbot.chat_icon,
      position: chatbot.position,
      margin_x: chatbot.margin_x,
      margin_y: chatbot.margin_y,
      welcome_message: chatbot.welcome_message,
    }

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300", // 5 minutes cache
      },
    })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
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

    // بروزرسانی چت‌بات
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
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        chatbot: result[0],
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    )
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    // حذف چت‌بات
    const result = await sql`
      DELETE FROM chatbots WHERE id = ${chatbotId} RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Chatbot deleted successfully",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    )
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
