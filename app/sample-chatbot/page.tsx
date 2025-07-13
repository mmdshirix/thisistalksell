"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, ShoppingCart, HelpCircle, Settings, Users, BarChart3, Eye } from "lucide-react"
import Link from "next/link"

interface SampleChatbot {
  id: number
  name: string
  welcome_message: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  created_at: string
}

interface SampleProduct {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  button_text: string
  product_url: string
}

interface SampleFAQ {
  id: number
  question: string
  answer: string
  emoji: string
}

interface SampleOption {
  id: number
  label: string
  emoji: string
}

export default function SampleChatbotPage() {
  const [chatbot, setChatbot] = useState<SampleChatbot | null>(null)
  const [products, setProducts] = useState<SampleProduct[]>([])
  const [faqs, setFaqs] = useState<SampleFAQ[]>([])
  const [options, setOptions] = useState<SampleOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSampleData()
  }, [])

  const fetchSampleData = async () => {
    try {
      // Fetch sample chatbot (ID 1 is our sample)
      const chatbotResponse = await fetch("/api/chatbots/1")
      if (chatbotResponse.ok) {
        const chatbotData = await chatbotResponse.json()
        setChatbot(chatbotData)
      }

      // Fetch products
      const productsResponse = await fetch("/api/chatbots/1/products")
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }

      // Fetch FAQs
      const faqsResponse = await fetch("/api/chatbots/1/faqs")
      if (faqsResponse.ok) {
        const faqsData = await faqsResponse.json()
        setFaqs(faqsData)
      }

      // Fetch options
      const optionsResponse = await fetch("/api/chatbots/1/options")
      if (optionsResponse.ok) {
        const optionsData = await optionsResponse.json()
        setOptions(optionsData)
      }
    } catch (error) {
      console.error("Error fetching sample data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری چت‌بات نمونه...</p>
        </div>
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">چت‌بات نمونه یافت نشد</h3>
            <p className="text-gray-600 mb-4">ابتدا اسکریپت نمونه را اجرا کنید</p>
            <Button asChild>
              <Link href="/database-setup">راه‌اندازی دیتابیس</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <header className="bg-white shadow rounded-lg mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">چت‌بات نمونه: {chatbot.name}</h1>
              <p className="text-gray-600 mt-1">نمایش کامل قابلیت‌های سیستم مدیریت چت‌بات</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/chatbots/${chatbot.id}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  مدیریت
                </Link>
              </Button>
              <Button asChild>
                <Link href="/test-sample-widget">
                  <Eye className="h-4 w-4 mr-2" />
                  تست زنده
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <div className="bg-white shadow rounded-lg mb-6">
            <TabsList className="w-full h-auto flex flex-wrap justify-start border-b p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2 py-3 px-4">
                <BarChart3 className="h-4 w-4" />
                <span>نمای کلی</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2 py-3 px-4">
                <ShoppingCart className="h-4 w-4" />
                <span>محصولات ({products.length})</span>
              </TabsTrigger>
              <TabsTrigger value="faqs" className="flex items-center gap-2 py-3 px-4">
                <HelpCircle className="h-4 w-4" />
                <span>سوالات متداول ({faqs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="options" className="flex items-center gap-2 py-3 px-4">
                <Users className="h-4 w-4" />
                <span>گزینه‌ها ({options.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">محصولات</p>
                      <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <HelpCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">سوالات متداول</p>
                      <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">گزینه‌های سریع</p>
                      <p className="text-2xl font-bold text-gray-900">{options.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">وضعیت</p>
                      <p className="text-sm font-bold text-green-600">فعال</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chatbot Settings Preview */}
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات چت‌بات</CardTitle>
                <CardDescription>پیکربندی فعلی چت‌بات نمونه</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">نام چت‌بات</label>
                      <p className="text-gray-900">{chatbot.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">پیام خوشامدگویی</label>
                      <p className="text-gray-900">{chatbot.welcome_message}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">موقعیت</label>
                      <Badge variant="outline">{chatbot.position}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">رنگ‌بندی</label>
                      <div className="flex gap-2 mt-1">
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: chatbot.primary_color }}
                          title="رنگ اصلی"
                        />
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: chatbot.text_color }}
                          title="رنگ متن"
                        />
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: chatbot.background_color }}
                          title="رنگ پس‌زمینه"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">آیکون</label>
                      <p className="text-2xl">{chatbot.chat_icon}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">تاریخ ایجاد</label>
                      <p className="text-gray-900">{new Date(chatbot.created_at).toLocaleDateString("fa-IR")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>محصولات فروشگاه</CardTitle>
                <CardDescription>لیست محصولات قابل نمایش در چت‌بات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg overflow-hidden">
                      <div className="h-32 bg-gray-200 flex items-center justify-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {product.price?.toLocaleString()} تومان
                          </span>
                          <Button size="sm" style={{ backgroundColor: chatbot.primary_color }}>
                            {product.button_text}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {products.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>هیچ محصولی تعریف نشده است</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>سوالات متداول</CardTitle>
                <CardDescription>سوالات و پاسخ‌های از پیش تعریف شده</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{faq.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {faqs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>هیچ سوال متداولی تعریف نشده است</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>گزینه‌های سریع</CardTitle>
                <CardDescription>گزینه‌های پیشنهادی برای کاربران</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">{option.emoji}</div>
                      <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    </div>
                  ))}
                </div>
                {options.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>هیچ گزینه‌ای تعریف نشده است</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
