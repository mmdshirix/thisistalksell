import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { messages, chatbotId } = await req.json()

    // Get chatbot data
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbotResult.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    const chatbot = chatbotResult[0]

    // Get FAQs
    const faqs = await sql`
      SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY id
    `

    // Get products
    const products = await sql`
      SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY id
    `

    // Build context
    const context = `You are ${chatbot.name}, a helpful AI assistant for this business.

Business Information:
- Name: ${chatbot.name}
- Welcome Message: ${chatbot.welcome_message}
- Navigation Message: ${chatbot.navigation_message}

Available Products:
${products.map((p) => `- ${p.name}: ${p.description} (Price: ${p.price} تومان)`).join("\n")}

Frequently Asked Questions:
${faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

Instructions:
1. Answer questions naturally and helpfully in Persian/Farsi
2. When users ask about products or show purchase intent, suggest relevant products using this EXACT format:
   SUGGESTED_PRODUCTS: [{"id": 1, "name": "Product Name", "description": "Description", "price": 100000, "image_url": "url", "product_url": "url", "button_text": "خرید"}]

3. After each response, provide 2-3 helpful follow-up questions using this EXACT format:
   NEXT_SUGGESTIONS: [{"text": "Question text", "emoji": "🤔"}]

4. Keep responses concise and friendly
5. Focus on helping customers find what they need
6. Use appropriate emojis in suggestions

Remember: Use the EXACT JSON format for products and suggestions as shown above.`

    const result = await streamText({
      model: deepseek("deepseek-chat"),
      messages: [{ role: "system", content: context }, ...messages],
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
