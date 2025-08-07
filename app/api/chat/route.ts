import { getSql } from "@/lib/db"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"
import { productMatcher } from "@/lib/product-matcher"

export const runtime = "nodejs" // Changed from "edge" to avoid compatibility issues

export async function POST(req: Request) {
  const sql = getSql()
  const { messages, chatbotId } = await req.json()

  if (!chatbotId) {
    return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
  }

  try {
    const chatbotSettings = await sql`
      SELECT model, temperature, max_tokens, top_p, frequency_penalty, presence_penalty,
             show_product_suggestions, show_faq_suggestions, show_quick_options, show_ticket_form
      FROM chatbots
      WHERE id = ${chatbotId};
    `

    if (chatbotSettings.length === 0) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    const settings = chatbotSettings[0]

    // Fetch FAQs and Products for context
    const faqs = await sql`SELECT question, answer FROM faqs WHERE chatbot_id = ${chatbotId};`
    const products = await sql`SELECT name, description FROM suggested_products WHERE chatbot_id = ${chatbotId};`

    const faqContext = faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n")
    const productContext = products.map((p) => `Product Name: ${p.name}\nDescription: ${p.description}`).join("\n\n")

    const systemPrompt = `
      You are a helpful customer support assistant for a company.
      Answer questions based on the provided context. If you don't know the answer, politely state that you don't have enough information.
      
      Company FAQs:
      ${faqContext}

      Company Products:
      ${productContext}

      If the user asks about products, try to suggest relevant products from the "Company Products" section.
      If the user asks a question covered in the FAQs, use the FAQ answer.
      Keep your answers concise and to the point.
    `

    const { text } = await generateText({
      model: openai(settings.model || "gpt-4o"), // Default to gpt-4o if not set
      prompt: messages[messages.length - 1].content,
      system: systemPrompt,
      temperature: settings.temperature || 0.7,
      maxTokens: settings.max_tokens || 500,
      topP: settings.top_p || 1,
      frequencyPenalty: settings.frequency_penalty || 0,
      presencePenalty: settings.presence_penalty || 0,
    })

    // Log message
    await sql`
      INSERT INTO messages (chatbot_id, user_message, bot_response)
      VALUES (${chatbotId}, ${messages[messages.length - 1].content}, ${text});
    `

    // Product suggestion logic (can be enhanced)
    const suggestedProducts = productMatcher(messages[messages.length - 1].content, products)

    return NextResponse.json({
      response: text,
      suggestedProducts: settings.show_product_suggestions ? suggestedProducts : [],
      showTicketForm: settings.show_ticket_form,
      showQuickOptions: settings.show_quick_options,
      showFaqSuggestions: settings.show_faq_suggestions,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
