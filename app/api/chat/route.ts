import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { getChatbotById, saveMessage, getFAQsByChatbotId, getProductsByChatbotId } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { messages, chatbotId } = await request.json()

    if (!messages || !chatbotId) {
      return NextResponse.json({ error: "Messages and chatbot ID are required" }, { status: 400 })
    }

    const chatbot = await getChatbotById(Number.parseInt(chatbotId))
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage?.content || ""

    // Get FAQs and Products for context
    const [faqs, products] = await Promise.all([
      getFAQsByChatbotId(Number.parseInt(chatbotId)),
      getProductsByChatbotId(Number.parseInt(chatbotId)),
    ])

    // Build system prompt
    let systemPrompt = `شما ${chatbot.name} هستید، یک دستیار هوشمند.\n\n`

    if (chatbot.knowledge_base_text) {
      systemPrompt += `اطلاعات کسب‌وکار:\n${chatbot.knowledge_base_text}\n\n`
    }

    if (faqs.length > 0) {
      systemPrompt += `سوالات متداول:\n`
      faqs.forEach((faq) => {
        systemPrompt += `${faq.emoji} ${faq.question}\n${faq.answer}\n\n`
      })
    }

    if (products.length > 0) {
      systemPrompt += `محصولات موجود:\n`
      products.forEach((product) => {
        systemPrompt += `- ${product.name}: ${product.description}`
        if (product.price) {
          systemPrompt += ` (قیمت: ${product.price} تومان)`
        }
        systemPrompt += `\n`
      })
      systemPrompt += `\n`
    }

    systemPrompt += `لطفاً به زبان فارسی، مفید و دوستانه پاسخ دهید.`

    let response = ""

    // Check if DeepSeek API key is available
    if (chatbot.deepseek_api_key) {
      try {
        const deepseek = createDeepSeek({
          apiKey: chatbot.deepseek_api_key,
        })

        const result = await streamText({
          model: deepseek("deepseek-chat"),
          system: systemPrompt,
          messages,
          maxTokens: 500,
          temperature: 0.7,
        })

        // Convert stream to text
        const chunks = []
        for await (const chunk of result.textStream) {
          chunks.push(chunk)
        }
        response = chunks.join("")
      } catch (aiError) {
        console.error("AI generation error:", aiError)
        response = "متأسفم، در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً تلاش کنید."
      }
    } else {
      // Simple keyword-based responses
      const lowerMessage = userMessage.toLowerCase()

      if (lowerMessage.includes("سلام") || lowerMessage.includes("درود")) {
        response = chatbot.welcome_message
      } else if (lowerMessage.includes("قیمت") || lowerMessage.includes("هزینه")) {
        if (products.length > 0) {
          response =
            "محصولات ما:\n" + products.map((p) => `${p.name}${p.price ? ` - ${p.price} تومان` : ""}`).join("\n")
        } else {
          response = "برای اطلاع از قیمت‌ها لطفاً با ما تماس بگیرید."
        }
      } else {
        // Check FAQs
        const matchingFAQ = faqs.find(
          (faq) =>
            lowerMessage.includes(faq.question.toLowerCase()) || faq.question.toLowerCase().includes(lowerMessage),
        )

        if (matchingFAQ) {
          response = `${matchingFAQ.emoji} ${matchingFAQ.answer}`
        } else {
          response = "متأسفم، متوجه سوال شما نشدم. می‌توانید سوال خود را واضح‌تر بپرسید؟"
        }
      }
    }

    // Save message to database
    try {
      await saveMessage({
        chatbot_id: Number.parseInt(chatbotId),
        user_message: userMessage,
        bot_response: response,
        user_ip: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      })
    } catch (dbError) {
      console.error("Database save error:", dbError)
      // Continue even if database save fails
    }

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
