import { notFound } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import ChatbotWidget from "@/components/chatbot-widget"

const sql = neon(process.env.DATABASE_URL!)

interface LauncherPageProps {
  params: {
    id: string
  }
}

export default async function LauncherPage({ params }: LauncherPageProps) {
  const chatbotId = Number.parseInt(params.id)

  if (isNaN(chatbotId)) {
    notFound()
  }

  try {
    // اطمینان از وجود جداول
    await sql`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        primary_color VARCHAR(7) DEFAULT '#0D9488',
        text_color VARCHAR(7) DEFAULT '#FFFFFF',
        background_color VARCHAR(7) DEFAULT '#F9FAFB',
        chat_icon VARCHAR(10) DEFAULT '💬',
        position VARCHAR(20) DEFAULT 'bottom-right',
        margin_x INTEGER DEFAULT 20,
        margin_y INTEGER DEFAULT 20,
        welcome_message TEXT DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟',
        navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟',
        knowledge_base_text TEXT,
        knowledge_base_url TEXT,
        store_url TEXT,
        ai_url TEXT,
        stats_multiplier DECIMAL(3,2) DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_faqs (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        emoji VARCHAR(10) DEFAULT '❓',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_products (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        image_url TEXT,
        product_url TEXT,
        button_text VARCHAR(100) DEFAULT 'خرید',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // دریافت اطلاعات چت‌بات
    const chatbots = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbots.length === 0) {
      notFound()
    }

    const chatbot = chatbots[0]

    // دریافت FAQs، محصولات و گزینه‌ها
    const [faqs, products, options] = await Promise.all([
      sql`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY id`,
      sql`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY id`,
      sql`
        SELECT * FROM chatbot_options WHERE chatbot_id = ${chatbotId} ORDER BY id
      `.catch(() => []), // اگر جدول وجود نداشت، آرایه خالی برگردان
    ])

    return (
      <div className="h-screen w-full">
        <ChatbotWidget
          chatbot={{
            id: chatbot.id,
            name: chatbot.name || "چت‌بات",
            welcome_message: chatbot.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
            navigation_message: chatbot.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
            primary_color: chatbot.primary_color || "#0D9488",
            text_color: chatbot.text_color || "#FFFFFF",
            background_color: chatbot.background_color || "#F9FAFB",
            chat_icon: chatbot.chat_icon || "💬",
            position: chatbot.position || "bottom-right",
            store_url: chatbot.store_url,
            ai_url: chatbot.ai_url,
          }}
          options={options || []}
          products={products || []}
          faqs={faqs || []}
        />
      </div>
    )
  } catch (error) {
    console.error("Error loading chatbot:", error)
    notFound()
  }
}
