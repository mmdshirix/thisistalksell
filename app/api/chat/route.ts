import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getChatbot, saveMessage, getChatbotFAQs, getChatbotProducts } from "@/lib/db"
import { findMatchingProducts } from "@/lib/product-matcher"

const sql = neon(process.env.DATABASE_URL!)

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("📨 Chat API Request:", body)

    // Extract data from AI SDK format
    const messages = body.messages || []
    const chatbotId = body.chatbotId || body.chatbot_id

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400, headers: corsHeaders })
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400, headers: corsHeaders })
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400, headers: corsHeaders })
    }

    const userMessage = lastMessage.content

    // Get chatbot data
    const chatbot = await getChatbot(Number(chatbotId))
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404, headers: corsHeaders })
    }

    // Get FAQs and Products
    const [faqs, products] = await Promise.all([
      getChatbotFAQs(Number(chatbotId)),
      getChatbotProducts(Number(chatbotId)),
    ])

    // Find matching products using our smart matcher
    const matchedProducts = findMatchingProducts(userMessage, products)
    console.log("🎯 Matched Products:", matchedProducts.length)

    // Generate next suggestions based on context
    const generateNextSuggestions = (userMsg: string, availableFaqs: any[]) => {
      const suggestions = []

      // Product-related suggestions
      if (userMsg.includes("قیمت") || userMsg.includes("خرید") || userMsg.includes("محصول")) {
        suggestions.push({ text: "محصولات مشابه نشان بده", emoji: "🛍️" })
        suggestions.push({ text: "بهترین قیمت چیه؟", emoji: "💰" })
      }

      // General suggestions from FAQs
      if (availableFaqs.length > 0) {
        const randomFaqs = availableFaqs.slice(0, 2)
        randomFaqs.forEach((faq) => {
          suggestions.push({ text: faq.question, emoji: faq.emoji || "❓" })
        })
      }

      // Default suggestions
      if (suggestions.length === 0) {
        suggestions.push({ text: "محصولات شما چی هستن؟", emoji: "🛍️" })
        suggestions.push({ text: "چطور سفارش بدم؟", emoji: "📞" })
        suggestions.push({ text: "قیمت ها چطوره؟", emoji: "💰" })
      }

      return suggestions.slice(0, 3) // Max 3 suggestions
    }

    const nextSuggestions = generateNextSuggestions(userMessage, faqs)

    // Build system prompt with context
    const systemPrompt = `
شما یک دستیار فروش هوشمند برای ${chatbot.name} هستید.

اطلاعات کسب و کار:
${chatbot.knowledge_base_text || "اطلاعات خاصی ارائه نشده"}

محصولات موجود:
${products.map((p) => `- ${p.name}: ${p.description || "بدون توضیح"} (قیمت: ${p.price ? p.price.toLocaleString() + " تومان" : "نامشخص"})`).join("\n")}

سوالات متداول:
${faqs.map((f) => `- ${f.question}: ${f.answer || "پاسخ ارائه نشده"}`).join("\n")}

دستورالعمل‌ها:
1. پاسخ‌های کوتاه و مفید بدهید (حداکثر 100 کلمه)
2. اگر محصول مناسبی پیدا کردید، در انتهای پاسخ این فرمت را اضافه کنید:
SUGGESTED_PRODUCTS: ${JSON.stringify(matchedProducts.slice(0, 2))}

3. همیشه 2-3 سوال پیشنهادی در انتها اضافه کنید:
NEXT_SUGGESTIONS: ${JSON.stringify(nextSuggestions)}

4. از زبان فارسی و لحن دوستانه استفاده کنید
5. اگر سوال خارج از حوزه کاری است، به مشتری کمک کنید تا به بخش مناسب هدایت شود
`

    console.log("🤖 System Prompt Length:", systemPrompt.length)
    console.log("🎯 Products to suggest:", matchedProducts.length)
    console.log("💡 Next suggestions:", nextSuggestions.length)

    // Check if we have DeepSeek API key
    if (!chatbot.deepseek_api_key && !process.env.DEEPSEEK_API_KEY) {
      // Fallback response without AI
      let response = "سلام! من دستیار هوشمند هستم. چطور می‌تونم کمکتون کنم؟"

      // Add product suggestions if found
      if (matchedProducts.length > 0) {
        response += `\n\nSUGGESTED_PRODUCTS: ${JSON.stringify(matchedProducts.slice(0, 2))}`
      }

      // Add next suggestions
      response += `\n\nNEXT_SUGGESTIONS: ${JSON.stringify(nextSuggestions)}`

      // Save message
      await saveMessage({
        chatbot_id: Number(chatbotId),
        user_message: userMessage,
        bot_response: response,
        user_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      })

      return new Response(response, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    }

    // Use AI to generate response
    const result = await streamText({
      model: deepseek("deepseek-chat", {
        apiKey: chatbot.deepseek_api_key || process.env.DEEPSEEK_API_KEY,
      }),
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 500,
    })

    // Save the message (we'll update with AI response later)
    const messageId = await saveMessage({
      chatbot_id: Number(chatbotId),
      user_message: userMessage,
      bot_response: null, // Will be updated when stream completes
      user_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
    })

    console.log("💾 Message saved with ID:", messageId)

    return result.toDataStreamResponse({
      headers: corsHeaders,
    })
  } catch (error) {
    console.error("❌ Chat API Error:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders },
    )
  }
}
