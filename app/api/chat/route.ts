import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { sql } from '@neondatabase/serverless';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const db = sql(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { messages, chatbotId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400 }
      );
    }

    // Get chatbot configuration
    const chatbot = await db`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `;

    if (chatbot.length === 0) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    const chatbotConfig = chatbot[0];

    // Get FAQs and products for context
    const [faqs, products] = await Promise.all([
      db`SELECT * FROM faqs WHERE chatbot_id = ${chatbotId}`,
      db`SELECT * FROM products WHERE chatbot_id = ${chatbotId}`
    ]);

    // Build system prompt
    let systemPrompt = `You are a helpful customer service assistant for ${chatbotConfig.name}.`;
    
    if (chatbotConfig.description) {
      systemPrompt += ` ${chatbotConfig.description}`;
    }

    if (faqs.length > 0) {
      systemPrompt += '\n\nFrequently Asked Questions:\n';
      faqs.forEach((faq: any) => {
        systemPrompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      });
    }

    if (products.length > 0) {
      systemPrompt += '\n\nAvailable Products:\n';
      products.forEach((product: any) => {
        systemPrompt += `- ${product.name}: ${product.description} (Price: ${product.price})\n`;
      });
    }

    systemPrompt += '\n\nPlease provide helpful and accurate responses based on the information above.';

    // Stream the response
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 500,
    });

    // Log the conversation
    const userMessage = messages[messages.length - 1];
    await db`
      INSERT INTO messages (chatbot_id, content, is_user, created_at)
      VALUES (${chatbotId}, ${userMessage.content}, true, NOW())
    `;

    return result.toDataStreamResponse();

  } catch (error) {
    logger.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
