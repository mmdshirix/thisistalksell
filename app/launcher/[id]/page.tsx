import { notFound } from "next/navigation"
import ChatbotWidget from "@/components/chatbot-widget"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function getChatbotData(id: string) {
  try {
    // دریافت اطلاعات چت‌بات
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${id}
    `

    if (chatbotResult.length === 0) {
      return null
    }

    const chatbot = chatbotResult[0]

    // دریافت گزینه‌های سریع
    const optionsResult = await sql`
      SELECT * FROM quick_options WHERE chatbot_id = ${id} ORDER BY id
    `

    // دریافت محصولات
    const productsResult = await sql`
      SELECT * FROM products WHERE chatbot_id = ${id} ORDER BY id
    `

    // دریافت سوالات متداول
    const faqsResult = await sql`
      SELECT * FROM faqs WHERE chatbot_id = ${id} ORDER BY id
    `

    return {
      chatbot,
      options: optionsResult,
      products: productsResult,
      faqs: faqsResult,
    }
  } catch (error) {
    console.error("Error fetching chatbot data:", error)
    return null
  }
}

export default async function ChatbotLauncher({ params }: { params: { id: string } }) {
  const data = await getChatbotData(params.id)

  if (!data) {
    notFound()
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <ChatbotWidget chatbot={data.chatbot} options={data.options} products={data.products} faqs={data.faqs} />
    </div>
  )
}
