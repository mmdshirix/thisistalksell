import { streamText, type CoreMessage } from "ai"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { getChatbotById, getFAQsByChatbotId, getProductsByChatbotId } from "@/lib/db"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// تشخیص intent خرید در پیام کاربر
function hasProductIntent(userMessage: string): boolean {
  const normalized = userMessage.toLowerCase()

  // کلمات کلیدی محصول و برند
  const productKeywords = [
    "محصول",
    "کالا",
    "خرید",
    "بخرم",
    "میخوام",
    "می‌خوام",
    "نیاز",
    "لازم",
    "قیمت",
    "هزینه",
    "تومان",
    "ریال",
    "پول",
    "فروش",
    "سفارش",
    "پیشنهاد",
    "توصیه",
    "بهترین",
    "مناسب",
    "ارزان",
    "گران",
    "کیفیت",
    "برند",
    "مدل",
    "موبایل",
    "گوشی",
    "تبلت",
    "لپ‌تاپ",
    "لپتاپ",
    "کامپیوتر",
    "هدفون",
    "سامسونگ",
    "اپل",
    "شیائومی",
    "هواوی",
    "ال‌جی",
    "سونی",
    "ایسوس",
  ]

  // الگوهای سوالی که نشان‌دهنده intent خرید هستند
  const intentPatterns = [
    /چه.*بخرم/,
    /کدام.*بهتر/,
    /بهترین.*چیه/,
    /پیشنهاد.*می.*دی/,
    /توصیه.*می.*کنی/,
    /قیمت.*چقدر/,
    /چند.*تومان/,
    /کجا.*بخرم/,
    /چطور.*تهیه/,
    /.*محصول.*/,
    /.*کالا.*/,
    /.*خرید.*/,
  ]

  const hasKeyword = productKeywords.some((keyword) => normalized.includes(keyword))
  const hasPattern = intentPatterns.some((pattern) => pattern.test(normalized))

  return hasKeyword || hasPattern
}

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

    // بررسی intent خرید در آخرین پیام کاربر
    const lastUserMessage = messages[messages.length - 1]?.content || ""
    const shouldSuggestProducts = hasProductIntent(lastUserMessage)

    const deepseek = createDeepSeek({ apiKey })
    const model = deepseek("deepseek-chat")

    // system prompt بهینه شده برای سرعت و دقت بالاتر
    const systemPrompt = `You are ${chatbot.name}, a helpful Persian assistant.
Website: ${chatbot.store_url || "main website"}
Date: ${new Date().toLocaleDateString("fa-IR")}

${
  shouldSuggestProducts
    ? `
Available products: ${JSON.stringify(products, null, 0)}
`
    : ""
}

Available FAQs: ${JSON.stringify(faqs, null, 0)}

RULES:
1. Always respond in Persian
2. Be helpful and professional
3. Keep responses concise and relevant

${
  shouldSuggestProducts
    ? `
PRODUCT SUGGESTIONS (ONLY when user asks about products/brands):
- Use this format ONLY if user specifically mentions products, brands, or buying intent:
SUGGESTED_PRODUCTS:[{"id":1,"name":"Name","description":"Desc","price":15000,"image_url":"url","product_url":"url","button_text":"text"}]
- Use compact JSON with NO spaces
- Maximum 2 products per response
- Only suggest highly relevant products
`
    : ""
}

FOLLOW-UP QUESTIONS:
- Always provide 2-3 relevant follow-up questions:
NEXT_SUGGESTIONS:[{"text":"Question text","emoji":"📦"}]
- Use compact JSON with NO spaces
- Make questions contextually relevant

IMPORTANT:
- Place JSON blocks at the very END of response
- Do NOT mention JSON blocks in conversation
- Only suggest products when user has clear buying intent
${chatbot.prompt_template || ""}
`

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
      maxTokens: 800, // کاهش برای سرعت بیشتر
      temperature: 0.6, // کاهش برای پاسخ‌های دقیق‌تر
    })

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
