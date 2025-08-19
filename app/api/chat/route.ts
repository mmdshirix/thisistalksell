import { type NextRequest, NextResponse } from "next/server"
import { OpenAIStream, StreamingTextResponse } from "ai"
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
    const systemMessage = `You are ${chatbot.name}, a helpful AI assistant for this business.

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

    // Use DeepSeek API directly
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatbot.deepseek_api_key || process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemMessage }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    // Create a streaming response
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
