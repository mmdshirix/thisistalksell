"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import ChatbotWidget from "@/components/chatbot-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Copy } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { Chatbot, ChatbotFAQ, ChatbotOption, ChatbotProduct } from "@/lib/db"

interface ChatbotData {
  chatbot: Chatbot
  options: ChatbotOption[]
  products: ChatbotProduct[]
  faqs: ChatbotFAQ[]
}

export default function LivePreview() {
  const params = useParams()
  const chatbotId = params.id as string

  const [loading, setLoading] = useState(true)
  const [chatbotData, setChatbotData] = useState<ChatbotData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!chatbotId) return

    const fetchData = async () => {
      try {
        const [chatbotRes, optionsRes, productsRes, faqsRes] = await Promise.all([
          fetch(`/api/chatbots/${chatbotId}`),
          fetch(`/api/chatbots/${chatbotId}/options`),
          fetch(`/api/chatbots/${chatbotId}/products`),
          fetch(`/api/chatbots/${chatbotId}/faqs`),
        ])

        if (!chatbotRes.ok || !optionsRes.ok || !productsRes.ok || !faqsRes.ok) {
          throw new Error("خطا در دریافت اطلاعات چت‌بات")
        }

        const chatbot = await chatbotRes.json()
        const options = await optionsRes.json()
        const products = await productsRes.json()
        const faqs = await faqsRes.json()

        setChatbotData({ chatbot, options, products, faqs })
      } catch (error) {
        console.error("Failed to fetch chatbot data for preview:", error)
        toast.error("خطا در بارگذاری اطلاعات پیش‌نمایش چت‌بات.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [chatbotId])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thisistalksel.vercel.app"
  const embedCode = `<script src="${appUrl}/api/widget-loader" data-chatbot-id="${chatbotId}" defer></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true)
      toast.success("کد امبد با موفقیت کپی شد!")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!chatbotData) {
    return <div className="py-10 text-center">خطا در بارگذاری اطلاعات چت‌بات.</div>
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
      {/* --- Embed Code Card --- */}
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>کد امبد</CardTitle>
            <CardDescription>این کد را در وب‌سایت خود قبل از تگ {"</body>"} قرار دهید.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-300">
              <code>{embedCode}</code>
            </div>
            <Button onClick={copyToClipboard} className="w-full">
              <Copy className="ml-2 h-4 w-4" />
              {copied ? "کپی شد!" : "کپی کردن کد"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- Live Preview --- */}
      <div className="flex items-center justify-center lg:col-span-2">
        <ChatbotWidget {...chatbotData} isPreview />
      </div>
    </div>
  )
}
