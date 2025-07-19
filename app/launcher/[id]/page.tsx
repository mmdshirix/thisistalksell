import { neon } from "@neondatabase/serverless"
import ChatbotWidget from "@/components/chatbot-widget"
import { notFound } from "next/navigation"

const sql = neon(process.env.DATABASE_URL!)

interface PageProps {
  params: { id: string }
}

export default async function LauncherPage({ params }: PageProps) {
  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      notFound()
    }

    // دریافت اطلاعات چت‌بات
    const chatbots = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbots.length === 0) {
      notFound()
    }

    const chatbot = chatbots[0]

    // دریافت محصولات، FAQs و گزینه‌ها
    const [products, faqs, options] = await Promise.all([
      sql`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY id`,
      sql`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY id`,
      sql`SELECT * FROM chatbot_options WHERE chatbot_id = ${chatbotId} ORDER BY id`.catch(() => []),
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
          products={products || []}
          faqs={faqs || []}
          options={options || []}
        />
      </div>
    )
  } catch (error) {
    console.error("Error loading launcher page:", error)
    notFound()
  }
}
