"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, Settings, BarChart3, Trash2, ExternalLink, ArrowRight } from "lucide-react"

interface Chatbot {
  id: number
  name: string
  created_at: string
  updated_at: string
  primary_color: string
  welcome_message: string
  navigation_message: string
}

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChatbots()
  }, [])

  const fetchChatbots = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/chatbots")

      if (!response.ok) {
        throw new Error("Failed to fetch chatbots")
      }

      const data = await response.json()
      setChatbots(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching chatbots:", err)
      setError("خطا در دریافت چت‌بات‌ها")
    } finally {
      setLoading(false)
    }
  }

  const deleteChatbot = async (id: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این چت‌بات را حذف کنید؟")) {
      return
    }

    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setChatbots(chatbots.filter((bot) => bot.id !== id))
      } else {
        alert("خطا در حذف چت‌بات")
      }
    } catch (error) {
      console.error("Error deleting chatbot:", error)
      alert("خطا در حذف چت‌بات")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">چت‌بات ساز</h1>
              </Link>
            </div>
            <nav className="flex space-x-4 space-x-reverse">
              <Link href="/">
                <Button variant="ghost">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  صفحه اصلی
                </Button>
              </Link>
              <Link href="/chatbots/new">
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  چت‌بات جدید
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">چت‌بات‌های من</h1>
          <p className="text-gray-600">مدیریت و تنظیم چت‌بات‌های خود</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <Button onClick={fetchChatbots} variant="outline" size="sm" className="mt-2 bg-transparent">
              تلاش مجدد
            </Button>
          </div>
        )}

        {chatbots.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">هنوز چت‌بات ندارید</h3>
              <p className="text-gray-600 mb-6">اولین چت‌بات خود را بسازید و شروع کنید</p>
              <Link href="/chatbots/new">
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  ساخت چت‌بات جدید
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((chatbot) => (
              <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{chatbot.name}</CardTitle>
                      <CardDescription className="text-sm">ایجاد شده: {formatDate(chatbot.created_at)}</CardDescription>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: chatbot.primary_color }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">پیام خوش‌آمدگویی:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{chatbot.welcome_message}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">فعال</Badge>
                      <Badge variant="outline">آماده استفاده</Badge>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Link href={`/chatbots/${chatbot.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Settings className="h-4 w-4 ml-2" />
                            تنظیمات
                          </Button>
                        </Link>
                        <Link href={`/chatbots/${chatbot.id}/analytics`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <BarChart3 className="h-4 w-4 ml-2" />
                            آمار
                          </Button>
                        </Link>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/chatbots/${chatbot.id}/preview`} className="flex-1">
                          <Button size="sm" className="w-full">
                            <ExternalLink className="h-4 w-4 ml-2" />
                            پیش‌نمایش
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteChatbot(chatbot.id)}
                          className="px-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
