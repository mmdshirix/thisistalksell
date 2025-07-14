import { streamText, type CoreMessage } from "ai"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { getChatbotById, getFAQsByChatbotId, getProductsByChatbotId } from "@/lib/db"

export const runtime = "edge"
export const dynamic = "force-dynamic" // همیشه آخرین داده‌ها را واکشی کن

export async function POST(req: Request) {
  try {
    const { messages, chatbotId }: { messages: CoreMessage[]; chatbotId: number } = await req.json()

    if (!chatbotId) {
      return new Response(JSON.stringify({ error: "Chatbot ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // واکشی هم‌زمان برای سرعت بالاتر
    const [chatbot, faqs, products] = await Promise.all([
      getChatbotById(chatbotId),
      getFAQsByChatbotId(chatbotId),
      getProductsByChatbotId(chatbotId),
    ])

    if (!chatbot) {
      return new Response(JSON.stringify({ error: "Chatbot not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const apiKey = chatbot.deepseek_api_key || process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "DeepSeek API key is not configured for this chatbot or in environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const deepseek = createDeepSeek({ apiKey })
    const model = deepseek("deepseek-chat")

    const systemPrompt = `You are a helpful assistant for ${chatbot.name}.
Your name is ${chatbot.name}.
Your goal is to answer user questions and help them find products.
The user is on the website: ${chatbot.store_url || "the main website"}.
Current date: ${new Date().toLocaleDateString("fa-IR")}

Available products:
${JSON.stringify(products, null, 2)}

Available FAQs:
${JSON.stringify(faqs, null, 2)}

Conversation Rules:
1.  Always respond in Persian.
2.  Be friendly, professional, and helpful.
3.  If the user's query matches a product, you MUST suggest it.
4.  To suggest products, embed a special block in your response like this:
SUGGESTED_PRODUCTS: [
 {"id": 1, "name": "Product Name", "description": "A short description of the product.", "price": 15000, "image_url": "https://example.com/image.jpg", "product_url": "https://example.com/product/1", "button_text": "View Product"}
]
The JSON inside SUGGESTED_PRODUCTS must be valid. Include all fields: id, name, description, price, image_url, product_url, button_text.
5.  After answering, if relevant, suggest 2-3 follow-up questions the user might have. Format them like this:
NEXT_SUGGESTIONS: [
 {"text": "How can I track my order?", "emoji": "📦"},
 {"text": "What are the shipping costs?", "emoji": "🚚"}
]
6.  Do not mention the SUGGESTED_PRODUCTS or NEXT_SUGGESTIONS blocks in your conversational response.
7.  If you don't know the answer, say you don't know and offer to create a support ticket.
8.  Keep your answers concise and to the point.
${chatbot.prompt_template || ""}
`

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
    })

    // خروجی مناسب برای useChat
    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("[CHAT_API_ERROR]", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
