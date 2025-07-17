"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Eye, Code, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface Chatbot {
  id: number
  name: string
  welcome_message: string
  navigation_message: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  margin_x: number
  margin_y: number
}

export default function ChatbotPreviewPage() {
  const params = useParams()
  const chatbotId = params.id as string
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chatbotId || isNaN(Number(chatbotId))) {
      setError("شناسه چت‌بات نامعتبر است.")
      setLoading(false)
      return
    }

    const loadChatbot = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("چت‌بات با این شناسه یافت نشد.")
          }
          throw new Error("خطا در بارگذاری اطلاعات چت‌بات")
        }
        const chatbotData = await response.json()
        setChatbot(chatbotData)
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "خطا در اتصال به سرور"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadChatbot()
  }, [chatbotId])

  const embedCode = chatbot
    ? `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget-loader.js';
    script.setAttribute('data-chatbot-id', '${chatbot.id}');
    script.setAttribute('data-api-url', '${window.location.origin}');
    document.head.appendChild(script);
  })();
</script>`
    : ""

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success("کد embed کپی شد!")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-4 text-lg">در حال بارگذاری پیش‌نمایش...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
            <CardTitle className="text-red-600 mt-4">خطا در بارگذاری</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.history.back()}>بازگشت</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!chatbot) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Eye className="w-8 h-8" />
            پیش‌نمایش چت‌بات
          </h1>
          <p className="text-muted-foreground">
            {chatbot.name} •
            <Badge variant="secondary" className="mr-2">
              ID: {chatbot.id}
            </Badge>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>پیش‌نمایش زنده</CardTitle>
            <CardDescription>چت‌بات شما در حالت واقعی</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-100 rounded-lg p-4 min-h-[500px]">
              <div className="text-center text-gray-500 mb-4">
                <p>پیش‌نمایش سایت شما</p>
              </div>

              {/* Simulated website content */}
              <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                <h3 className="text-xl font-bold mb-2">صفحه اصلی وب‌سایت</h3>
                <p className="text-gray-600 mb-4">
                  این یک نمونه از محتوای وب‌سایت شما است. چت‌بات در گوشه صفحه نمایش داده می‌شود.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium">بخش ۱</h4>
                    <p className="text-sm text-gray-600">محتوای نمونه</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium">بخش ۲</h4>
                    <p className="text-sm text-gray-600">محتوای نمونه</p>
                  </div>
                </div>
              </div>

              {/* Chatbot Widget Preview */}
              <div
                className="fixed z-50"
                style={{
                  [chatbot.position.includes("bottom") ? "bottom" : "top"]: `${chatbot.margin_y}px`,
                  [chatbot.position.includes("right") ? "right" : "left"]: `${chatbot.margin_x}px`,
                }}
              >
                <Button
                  className="rounded-full w-14 h-14 shadow-lg"
                  style={{
                    backgroundColor: chatbot.primary_color,
                    color: chatbot.text_color,
                  }}
                >
                  <span className="text-2xl">{chatbot.chat_icon}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Embed Code */}
        <div className="space-y-6">
          {/* Current Settings */}
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات فعلی</CardTitle>
              <CardDescription>تنظیمات ظاهری چت‌بات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">نام:</span>
                  <p className="text-muted-foreground">{chatbot.name}</p>
                </div>
                <div>
                  <span className="font-medium">آیکون:</span>
                  <p className="text-muted-foreground text-lg">{chatbot.chat_icon}</p>
                </div>
                <div>
                  <span className="font-medium">موقعیت:</span>
                  <p className="text-muted-foreground">{chatbot.position}</p>
                </div>
                <div>
                  <span className="font-medium">رنگ اصلی:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: chatbot.primary_color }} />
                    <span className="text-muted-foreground">{chatbot.primary_color}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <span className="font-medium">پیام خوش‌آمدگویی:</span>
                <p className="text-muted-foreground text-sm mt-1">{chatbot.welcome_message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                کد Embed
              </CardTitle>
              <CardDescription>این کد را در وب‌سایت خود قرار دهید تا چت‌بات نمایش داده شود</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{embedCode}</pre>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyEmbedCode} className="flex-1">
                  کپی کد
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`${window.location.origin}/launcher/${chatbot.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    تست در صفحه جدید
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>راهنمای نصب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p className="font-medium">۱. کپی کردن کد:</p>
                <p className="text-muted-foreground mr-4">کد embed بالا را کپی کنید.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">۲. قرار دادن در وب‌سایت:</p>
                <p className="text-muted-foreground mr-4">
                  کد را قبل از تگ `&lt;/body&gt;` در صفحات وب‌سایت خود قرار دهید.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">۳. تست عملکرد:</p>
                <p className="text-muted-foreground mr-4">صفحه وب‌سایت را بازخوانی کنید تا چت‌بات نمایش داده شود.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
