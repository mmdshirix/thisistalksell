import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { neon } from '@neondatabase/serverless'
import { logger } from '@/lib/logger'

// Use nodejs runtime instead of edge for better compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { messages, chatbotId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400 }
      )
    }

    // Get chatbot configuration
    const chatbot = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (!chatbot.length) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    const chatbotConfig = chatbot[0]

    // Get FAQs and products for context
    const [faqs, products] = await Promise.all([
      sql`SELECT * FROM faqs WHERE chatbot_id = ${chatbotId}`,
      sql`SELECT * FROM products WHERE chatbot_id = ${chatbotId}`
    ])

    // Build context from FAQs and products
    const faqContext = faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')
    const productContext = products.map(product => 
      `Product: ${product.name}\nDescription: ${product.description}\nPrice: ${product.price}`
    ).join('\n\n')

    const systemPrompt = `
You are a helpful customer service chatbot for ${chatbotConfig.name}.

${chatbotConfig.description ? `About the business: ${chatbotConfig.description}` : ''}

${faqContext ? `Frequently Asked Questions:\n${faqContext}` : ''}

${productContext ? `Available Products/Services:\n${productContext}` : ''}

Instructions:
- Be helpful, friendly, and professional
- Answer questions based on the provided context
- If you don't know something, politely say so and offer to connect them with a human
- Keep responses concise but informative
- Always maintain a positive tone
`

    // Stream the response
    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 500,
    })

    // Log the conversation
    const userMessage = messages[messages.length - 1]
    if (userMessage) {
      try {
        await sql`
          INSERT INTO messages (chatbot_id, content, is_user, created_at)
          VALUES (${chatbotId}, ${userMessage.content}, true, NOW())
        `
      } catch (error) {
        logger.error('Failed to log user message:', error)
      }
    }

    return result.toDataStreamResponse()

  } catch (error) {
    logger.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
