import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ChatbotWidget from "@/components/chatbot-widget"
import { getChatbotById, getChatbotOptions, getChatbotProducts, getChatbotFAQs } from "@/lib/db"

interface PreviewChatbotPageProps {
  params: {
    id: string
  }
}

export default async function PreviewChatbotPage({ params }: PreviewChatbotPageProps) {
  const chatbotId = Number.parseInt(params.id)

  if (isNaN(chatbotId)) {
    notFound()
  }

  const chatbot = await getChatbotById(chatbotId)

  if (!chatbot) {
    notFound()
  }

  // Fetch related data with error handling
  let options = []
  let products = []
  let faqs = []

  try {
    options = await getChatbotOptions(chatbotId)
  } catch (error) {
    console.error("Error fetching options:", error)
  }

  try {
    products = await getChatbotProducts(chatbotId)
  } catch (error) {
    console.error("Error fetching products:", error)
  }

  try {
    faqs = await getChatbotFAQs(chatbotId)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/chatbots/${chatbot.id}`}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">پیش‌نمایش: {chatbot.name}</h1>
          </div>
          <Link href={`/chatbots/${chatbot.id}/embed`}>
            <Button className="bg-blue-600 hover:bg-blue-700">دریافت کد جاسازی</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
        <ChatbotWidget chatbot={chatbot} options={options} products={products} faqs={faqs} isPreview={true} />
      </main>
    </div>
  )
}
