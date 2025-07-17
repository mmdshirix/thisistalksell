import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { getChatbot, saveMessage, getChatbotFAQs, getChatbotProducts } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { message, chatbotId, userIp, userAgent } = await request.json()

    if (!message || !chatbotId) {
      return NextResponse.json({ error: "Message and chatbot ID are required" }, { status: 400 })
    }

    // Get chatbot configuration
    const chatbot = await getChatbot(Number.parseInt(chatbotId))
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Get FAQs and products for context
    const faqs = await getChatbotFAQs(Number.parseInt(chatbotId))
    const products = await getChatbotProducts(Number.parseInt(chatbotId))

    // Build context for AI
    let context = `شما یک دستیار هوشمند برای ${chatbot.name} هستید.\n\n`

    if (chatbot.knowledge_base_text) {
      context += `اطلاعات کسب و کار:\n${chatbot.knowledge_base_text}\n\n`
    }

    if (faqs.length > 0) {
      context += `سوالات متداول:\n`
      faqs.forEach((faq) => {
        context += `${faq.emoji} ${faq.question}\n${faq.answer}\n\n`
      })
    }

    if (products.length > 0) {
      context += `محصولات موجود:\n`
      products.forEach((product) => {
        context += `- ${product.name}: ${product.description}\n`
        if (product.price) {
          context += `  قیمت: ${product.price} تومان\n`
        }
      })
      context += `\n`
    }

    context += `لطفاً به زبان فارسی و به صورت مفید و دوستانه پاسخ دهید.`

    let botResponse = ""

    // Check if we have DeepSeek API key
    if (chatbot.deepseek_api_key) {
      try {
        const result = await generateText({
          model: deepseek("deepseek-chat", {
            apiKey: chatbot.deepseek_api_key,
          }),
          system: context,
          prompt: message,
          maxTokens: 500,
        })

        botResponse = result.text
      } catch (aiError) {
        console.error("AI generation error:", aiError)
        // Fallback to simple response
        botResponse = "متأسفم، در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً تلاش کنید."
      }
    } else {
      // Simple keyword-based responses
      const lowerMessage = message.toLowerCase()

      if (lowerMessage.includes("سلام") || lowerMessage.includes("درود")) {
        botResponse = chatbot.welcome_message
      } else if (lowerMessage.includes("قیمت") || lowerMessage.includes("هزینه")) {
        if (products.length > 0) {
          botResponse =
            "محصولات ما:\n" + products.map((p) => `${p.name}${p.price ? ` - ${p.price} تومان` : ""}`).join("\n")
        } else {
          botResponse = "برای اطلاع از قیمت‌ها لطفاً با ما تماس بگیرید."
        }
      } else if (lowerMessage.includes("تماس") || lowerMessage.includes("ارتباط")) {
        botResponse = "برای تماس با ما می‌توانید از طریق تیکت پشتیبانی اقدام کنید."
      } else {
        // Check FAQs
        const matchingFAQ = faqs.find(
          (faq) =>
            lowerMessage.includes(faq.question.toLowerCase()) || faq.question.toLowerCase().includes(lowerMessage),
        )

        if (matchingFAQ) {
          botResponse = `${matchingFAQ.emoji} ${matchingFAQ.answer}`
        } else {
          botResponse = "متأسفم، متوجه سوال شما نشدم. می‌توانید سوال خود را واضح‌تر بپرسید؟"
        }
      }
    }

    // Save message to database
    try {
      await saveMessage({
        chatbot_id: Number.parseInt(chatbotId),
        user_message: message,
        bot_response: botResponse,
        user_ip: userIp,
        user_agent: userAgent,
      })
    } catch (dbError) {
      console.error("Database save error:", dbError)
      // Continue even if database save fails
    }

    return NextResponse.json({
      message: botResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
