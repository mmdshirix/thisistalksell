"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Eye, Settings, Copy, Check, ExternalLink } from "lucide-react"
import Link from "next/link"
import ChatbotWidget from "@/components/chatbot-widget"

interface SampleChatbot {
  id: number
  name: string
  welcome_message: string
  navigation_message: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  store_url?: string
  ai_url?: string
}

export default function TestSampleWidgetPage() {
  const [chatbot, setChatbot] = useState<SampleChatbot | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchSampleChatbot()
  }, [])

  const fetchSampleChatbot = async () => {
    try {
      // Fetch chatbot data
      const chatbotResponse = await fetch("/api/chatbots/1")
      if (chatbotResponse.ok) {
        const chatbotData = await chatbotResponse.json()
        setChatbot(chatbotData)
      }

      // Fetch related data
      const [productsRes, faqsRes, optionsRes] = await Promise.all([
        fetch("/api/chatbots/1/products"),
        fetch("/api/chatbots/1/faqs"),
        fetch("/api/chatbots/1/options"),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (faqsRes.ok) {
        const faqsData = await faqsRes.json()
        setFaqs(faqsData)
      }

      if (optionsRes.ok) {
        const optionsData = await optionsRes.json()
        setOptions(optionsData)
      }
    } catch (error) {
      console.error("Error fetching sample chatbot:", error)
    } finally {
      setLoading(false)
    }
  }

  const embedCode = chatbot
    ? `<!-- کد تعبیه چت‌بات -->
<script>
  window.OrionChatbotConfig = {
    chatbotId: ${chatbot.id},
    apiUrl: '${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}'
  };
</script>
<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/widget-loader.js" async></script>`
    : ""

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری چت‌بات...</p>
        </div>
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-medium mb-2">چت‌بات نمونه یافت نشد</h3>
            <p className="text-gray-600 mb-4">ابتدا اسکریپت نمونه را اجرا کنید</p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/database-setup">راه‌اندازی دیتابیس</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/sample-chatbot">مشاهده جزئیات</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تست چت‌بات نمونه</h1>
              <p className="text-gray-600">آزمایش زنده چت‌بات در محیط واقعی</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/sample-chatbot">
                  <Eye className="h-4 w-4 mr-2" />
                  جزئیات
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/chatbots/${chatbot.id}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  مدیریت
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="preview" className="w-full">
          <div className="bg-white shadow rounded-lg mb-6">
            <TabsList className="w-full h-auto flex justify-start border-b p-1">
              <TabsTrigger value="preview" className="flex items-center gap-2 py-3 px-4">
                <Eye className="h-4 w-4" />
                <span>پیش‌نمایش زنده</span>
              </TabsTrigger>
              <TabsTrigger value="embed" className="flex items-center gap-2 py-3 px-4">
                <Code className="h-4 w-4" />
                <span>کد تعبیه</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2 py-3 px-4">
                <Settings className="h-4 w-4" />
                <span>اطلاعات</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Live Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Widget Preview */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>پیش‌نمایش چت‌بات</CardTitle>
                    <CardDescription>چت‌بات در حالت کامل - تمام قابلیت‌ها فعال است</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 rounded-lg p-4 min-h-[600px] relative">
                      <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
                        <ChatbotWidget chatbot={chatbot} products={products} faqs={faqs} options={options} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats & Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>آمار چت‌بات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">محصولات</span>
                      <Badge variant="secondary">{products.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">سوالات متداول</span>
                      <Badge variant="secondary">{faqs.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">گزینه‌های سریع</span>
                      <Badge variant="secondary">{options.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">وضعیت</span>
                      <Badge className="bg-green-100 text-green-800">فعال</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>تنظیمات ظاهری</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">رنگ اصلی</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded border" style={{ backgroundColor: chatbot.primary_color }} />
                        <span className="text-sm text-gray-600">{chatbot.primary_color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">موقعیت</label>
                      <p className="text-sm text-gray-600 mt-1">{chatbot.position}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">آیکون</label>
                      <p className="text-2xl mt-1">{chatbot.chat_icon}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>لینک‌های مفید</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href={`/chatbots/${chatbot.id}/analytics`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        آمار و تحلیل
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href={`/chatbots/${chatbot.id}/tickets`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        تیکت‌های پشتیبانی
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href={`/admin-panel/${chatbot.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        پنل مدیریت
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Embed Code Tab */}
          <TabsContent value="embed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>کد تعبیه چت‌بات</CardTitle>
                <CardDescription>این کد را در سایت خود قرار دهید تا چت‌بات نمایش داده شود</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{embedCode}</pre>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyEmbedCode} className="flex items-center gap-2">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "کپی شد!" : "کپی کد"}
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/chatbots/${chatbot.id}/embed`}>مشاهده راهنمای کامل</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>راهنمای نصب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">کپی کردن کد</h4>
                      <p className="text-sm text-gray-600">کد تعبیه را از بالا کپی کنید</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">قرار دادن در سایت</h4>
                      <p className="text-sm text-gray-600">کد را قبل از تگ &lt;/body&gt; قرار دهید</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">تست عملکرد</h4>
                      <p className="text-sm text-gray-600">سایت را بازدید کنید و چت‌بات را تست کنید</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>اطلاعات چت‌بات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">شناسه</label>
                    <p className="text-gray-900">{chatbot.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">نام</label>
                    <p className="text-gray-900">{chatbot.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">پیام خوشامدگویی</label>
                    <p className="text-gray-900">{chatbot.welcome_message}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">پیام راهنمایی</label>
                    <p className="text-gray-900">{chatbot.navigation_message}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تنظیمات پیشرفته</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">URL فروشگاه</label>
                    <p className="text-gray-900">{chatbot.store_url || "تعریف نشده"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">URL هوش مصنوعی</label>
                    <p className="text-gray-900">{chatbot.ai_url || "تعریف نشده"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">رنگ پس‌زمینه</label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: chatbot.background_color }} />
                      <span className="text-gray-900">{chatbot.background_color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">رنگ متن</label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: chatbot.text_color }} />
                      <span className="text-gray-900">{chatbot.text_color}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
