import { getChatbotById, getChatbotFAQs, getChatbotProducts } from "@/lib/db"
import { notFound } from "next/navigation"
import ChatbotWidget from "@/components/chatbot-widget"

interface WidgetPageProps {
  params: {
    id: string
  }
}

export const dynamic = "force-dynamic"

export default async function WidgetPage({ params }: WidgetPageProps) {
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    notFound()
  }

  try {
    const chatbot = await getChatbotById(chatbotId)
    if (!chatbot) {
      notFound()
    }

    const [faqs, products] = await Promise.all([getChatbotFAQs(chatbotId), getChatbotProducts(chatbotId)])

    return (
      // Use h-screen to ensure the container takes the full viewport height of the iframe.
      <div className="w-full h-screen pointer-events-auto">
        <ChatbotWidget chatbot={chatbot} faqs={faqs} products={products} />
      </div>
    )
  } catch (error) {
    console.error(`Error loading widget ${chatbotId}:`, error)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p>خطا در بارگذاری چت‌بات.</p>
        </div>
      </div>
    )
  }
}
