"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import ChatbotWidget from "@/components/chatbot-widget"

interface ChatbotConfig {
  id: number
  name: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  margin_x: number
  margin_y: number
  welcome_message: string
  navigation_message: string
  knowledge_base_text: string
  knowledge_base_url: string
  store_url: string
  ai_url: string
}

export default function ChatbotLauncher() {
  const params = useParams()
  const searchParams = useSearchParams()
  const chatbotId = Number(params.id)
  const isPreview = searchParams.get("preview") === "true"

  const [config, setConfig] = useState<ChatbotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}`, {
          cache: "no-store", // Always get fresh data for preview
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setConfig(data.chatbot)
      } catch (err) {
        console.error("Error fetching chatbot config:", err)
        setError("خطا در بارگذاری تنظیمات چت‌بات")
      } finally {
        setLoading(false)
      }
    }

    if (chatbotId) {
      fetchConfig()
    }
  }, [chatbotId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری چت‌بات...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "چت‌بات یافت نشد"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: config.background_color }}>
      {isPreview && (
        <div className="fixed top-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm z-50">
          پیش‌نمایش: {config.name}
        </div>
      )}

      <ChatbotWidget chatbotId={chatbotId} config={config} />

      {/* Background content for preview */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {isPreview ? `پیش‌نمایش چت‌بات: ${config.name}` : "خوش آمدید"}
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">درباره این چت‌بات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>نام:</strong> {config.name}
              </div>
              <div>
                <strong>رنگ اصلی:</strong>
                <span
                  className="inline-block w-4 h-4 rounded ml-2 border"
                  style={{ backgroundColor: config.primary_color }}
                ></span>
                {config.primary_color}
              </div>
              <div>
                <strong>موقعیت:</strong> {config.position}
              </div>
              <div>
                <strong>آیکون:</strong> {config.chat_icon}
              </div>
            </div>
            {config.knowledge_base_text && (
              <div className="mt-4">
                <strong>اطلاعات پایه:</strong>
                <p className="text-gray-600 mt-2">{config.knowledge_base_text.substring(0, 200)}...</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">نحوه استفاده</h3>
            <p className="text-gray-700">
              روی آیکون چت‌بات در گوشه صفحه کلیک کنید تا گفتگو را شروع کنید. می‌توانید سوالات خود را مطرح کرده و از
              امکانات مختلف چت‌بات استفاده کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
