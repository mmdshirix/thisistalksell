"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Settings, BarChart3, Eye, Code, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ChatbotListProps {
  initialChatbots?: any[]
}

export function ChatbotList({ initialChatbots = [] }: ChatbotListProps) {
  const [chatbots, setChatbots] = useState(initialChatbots || [])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()

  const handleDelete = async (chatbotId: number, chatbotName: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید چت‌بات "${chatbotName}" را حذف کنید؟`)) {
      return
    }

    setDeletingId(chatbotId)

    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/delete`, {
        method: "DELETE",
      })

      if (response.ok) {
        setChatbots(chatbots.filter((c) => c.id !== chatbotId))
      } else {
        alert("خطا در حذف چت‌بات")
      }
    } catch (error) {
      console.error("Error deleting chatbot:", error)
      alert("خطا در حذف چت‌بات")
    } finally {
      setDeletingId(null)
    }
  }

  // Ensure chatbots is always an array
  const safeChatbots = Array.isArray(chatbots) ? chatbots : []

  if (safeChatbots.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-2">هیچ چت‌باتی یافت نشد</h2>
        <p className="text-gray-600 mb-6">اولین چت‌بات خود را ایجاد کنید.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {safeChatbots.map((chatbot) => (
        <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{chatbot.chat_icon || "🤖"}</span>
                <div>
                  <CardTitle className="text-lg">{chatbot.name || "بدون نام"}</CardTitle>
                  <CardDescription>موقعیت: {chatbot.position || "bottom-right"}</CardDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: (chatbot.primary_color || "#3B82F6") + "20",
                  color: chatbot.primary_color || "#3B82F6",
                }}
              >
                فعال
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{chatbot.welcome_message || "پیام خوش‌آمدگویی"}</p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MessageCircle className="h-4 w-4" />
              <span>{chatbot.message_count || 0} پیام</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link href={`/chatbots/${chatbot.id}`}>
                <Button size="sm" variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-1" />
                  تنظیمات
                </Button>
              </Link>
              <Link href={`/chatbots/${chatbot.id}/analytics`}>
                <Button size="sm" variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  آمار
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link href={`/chatbots/${chatbot.id}/preview`}>
                <Button size="sm" variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-1" />
                  پیشنمایش
                </Button>
              </Link>
              <Link href={`/chatbots/${chatbot.id}/embed`}>
                <Button size="sm" variant="outline" className="w-full">
                  <Code className="h-4 w-4 mr-1" />
                  امبد کد
                </Button>
              </Link>
            </div>

            <Button
              size="sm"
              variant="destructive"
              className="w-full"
              onClick={() => handleDelete(chatbot.id, chatbot.name)}
              disabled={deletingId === chatbot.id}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {deletingId === chatbot.id ? "در حال حذف..." : "حذف چت‌بات"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Add default export
export default ChatbotList
