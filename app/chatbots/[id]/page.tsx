"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import ChatbotSettingsForm from "@/components/chatbot-settings-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Eye, Settings, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Chatbot {
  id: number
  name: string
  created_at: string
  updated_at: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  margin_x: number
  margin_y: number
  deepseek_api_key: string | null
  welcome_message: string
  navigation_message: string
  knowledge_base_text: string | null
  knowledge_base_url: string | null
  store_url: string | null
  ai_url: string | null
  stats_multiplier: number
  faqs?: any[]
  products?: any[]
}

export default function ChatbotEditPage() {
  const params = useParams()
  const router = useRouter()
  const chatbotId = params.id as string

  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchChatbot()
  }, [chatbotId])

  const fetchChatbot = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chatbots/${chatbotId}`)
      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات چت‌بات")
      }
      const data = await response.json()
      setChatbot(data)
    } catch (error) {
      console.error("Error fetching chatbot:", error)
      toast.error("خطا در بارگذاری اطلاعات چت‌بات")
      router.push("/chatbots")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: any) => {
    try {
      setSaving(true)

      // Save chatbot basic info
      const chatbotResponse = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          welcome_message: formData.welcome_message,
          navigation_message: formData.navigation_message,
          primary_color: formData.primary_color,
          text_color: formData.text_color,
          background_color: formData.background_color,
          chat_icon: formData.chat_icon,
          position: formData.position,
          margin_x: formData.margin_x,
          margin_y: formData.margin_y,
          deepseek_api_key: formData.deepseek_api_key,
          knowledge_base_text: formData.knowledge_base_text,
          knowledge_base_url: formData.knowledge_base_url,
          store_url: formData.store_url,
          ai_url: formData.ai_url,
        }),
      })

      if (!chatbotResponse.ok) {
        throw new Error("خطا در ذخیره اطلاعات چت‌بات")
      }

      // Save FAQs
      if (formData.faqs && formData.faqs.length > 0) {
        const faqsResponse = await fetch(`/api/chatbots/${chatbotId}/faqs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ faqs: formData.faqs }),
        })

        if (!faqsResponse.ok) {
          console.warn("خطا در ذخیره سوالات متداول")
        }
      }

      // Save Products
      if (formData.products && formData.products.length > 0) {
        const productsResponse = await fetch(`/api/chatbots/${chatbotId}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ products: formData.products }),
        })

        if (!productsResponse.ok) {
          console.warn("خطا در ذخیره محصولات")
        }
      }

      toast.success("تنظیمات با موفقیت ذخیره شد")
      await fetchChatbot() // Refresh data
    } catch (error) {
      console.error("Error saving chatbot:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("آیا از حذف این چت‌بات اطمینان دارید؟ این عمل قابل بازگشت نیست.")) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`/api/chatbots/${chatbotId}/delete`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("خطا در حذف چت‌بات")
      }

      toast.success("چت‌بات با موفقیت حذف شد")
      router.push("/chatbots")
    } catch (error) {
      console.error("Error deleting chatbot:", error)
      toast.error("خطا در حذف چت‌بات")
    } finally {
      setDeleting(false)
    }
  }

  const handlePreview = () => {
    window.open(`/chatbots/${chatbotId}/preview`, "_blank")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">چت‌بات یافت نشد</p>
            <Button asChild className="mt-4">
              <Link href="/chatbots">بازگشت به لیست چت‌بات‌ها</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/chatbots">
              <ArrowLeft className="w-4 h-4 mr-2" />
              بازگشت
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">ویرایش چت‌بات</h1>
            <p className="text-muted-foreground">ID: {chatbot.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">آخرین بروزرسانی: {new Date(chatbot.updated_at).toLocaleDateString("fa-IR")}</Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            عملیات سریع
          </CardTitle>
          <CardDescription>دسترسی سریع به امکانات مختلف چت‌بات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={handlePreview} className="h-auto p-4 flex-col bg-transparent">
              <Eye className="w-6 h-6 mb-2" />
              <span>پیش‌نمایش</span>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4 flex-col bg-transparent">
              <Link href={`/chatbots/${chatbotId}/analytics`}>
                <div className="w-6 h-6 mb-2 bg-blue-100 rounded flex items-center justify-center">📊</div>
                <span>آمار</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4 flex-col bg-transparent">
              <Link href={`/chatbots/${chatbotId}/embed`}>
                <ExternalLink className="w-6 h-6 mb-2" />
                <span>کد تعبیه</span>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4 flex-col bg-transparent">
              <Link href={`/chatbots/${chatbotId}/tickets`}>
                <div className="w-6 h-6 mb-2 bg-green-100 rounded flex items-center justify-center">🎫</div>
                <span>تیکت‌ها</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      {/* Settings Form */}
      <ChatbotSettingsForm chatbot={chatbot} onSave={handleSave} onPreview={handlePreview} />

      <Separator className="my-8" />

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            منطقه خطر
          </CardTitle>
          <CardDescription>عملیات‌های غیرقابل بازگشت</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-medium text-red-800">حذف چت‌بات</h4>
              <p className="text-sm text-red-600">
                تمام اطلاعات، پیام‌ها، تیکت‌ها و تنظیمات این چت‌بات برای همیشه حذف خواهد شد.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "در حال حذف..." : "حذف چت‌بات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
