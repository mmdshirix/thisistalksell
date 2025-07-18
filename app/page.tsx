"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MessageCircle, BarChart3, Settings, Trash2 } from "lucide-react"
import Link from "next/link"

interface Chatbot {
  id: number
  name: string
  primary_color: string
  chat_icon: string
  created_at: string
  stats?: {
    total_messages: number
    unique_users: number
    today_messages: number
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thisistalksell.liara.run"

export default function HomePage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadChatbots()
  }, [])

  const loadChatbots = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/chatbots`)
      const result = await response.json()

      if (result.success) {
        setChatbots(Array.isArray(result.data) ? result.data : [])
      } else {
        setError(result.message || "خطا در بارگذاری چت‌بات‌ها")
        setChatbots([])
      }
    } catch (error) {
      console.error("Error loading chatbots:", error)
      setError("خطا در بارگذاری چت‌بات‌ها")
      setChatbots([])
    } finally {
      setLoading(false)
    }
  }

  const deleteChatbot = async (id: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این چت‌بات را حذف کنید؟")) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbots/${id}/delete`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setChatbots((prev) => prev.filter((bot) => bot.id !== id))
      } else {
        alert(result.message || "خطا در حذف چت‌بات")
      }
    } catch (error) {
      console.error("Error deleting chatbot:", error)
      alert("خطا در حذف چت‌بات")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadChatbots}>تلاش مجدد</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">چت‌بات‌های من</h1>
            <p className="text-gray-600 mt-2">مدیریت و نظارت بر چت‌بات‌های شما</p>
          </div>
          <Link href="/chatbots/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              چت‌بات جدید
            </Button>
          </Link>
        </div>

        {chatbots.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">هنوز چت‌بات ندارید</h3>
              <p className="text-gray-600 mb-6">اولین چت‌بات خود را ایجاد کنید و شروع کنید</p>
              <Link href="/chatbots/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  ایجاد چت‌بات
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((chatbot) => (
              <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: chatbot.primary_color || "#3B82F6" }}
                      >
                        💬
                      </div>
                      <div>
                        <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                        <CardDescription>
                          ایجاد شده در {new Date(chatbot.created_at).toLocaleDateString("fa-IR")}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {chatbot.stats && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{chatbot.stats.total_messages}</div>
                        <div className="text-xs text-gray-500">کل پیام‌ها</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{chatbot.stats.unique_users}</div>
                        <div className="text-xs text-gray-500">کاربران</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{chatbot.stats.today_messages}</div>
                        <div className="text-xs text-gray-500">امروز</div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/chatbots/${chatbot.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Settings className="w-4 h-4 mr-2" />
                        تنظیمات
                      </Button>
                    </Link>
                    <Link href={`/chatbots/${chatbot.id}/analytics`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        آمار
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteChatbot(chatbot.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
