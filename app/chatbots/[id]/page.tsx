"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Save, Eye, Settings, MessageSquare, Package, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

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
  deepseek_api_key: string | null
  knowledge_base_text: string | null
  knowledge_base_url: string | null
  store_url: string | null
  ai_url: string | null
  stats_multiplier: number
}

interface FAQ {
  id: number
  question: string
  answer: string
  emoji: string
  position: number
}

interface Product {
  id: number
  name: string
  description: string
  price: number | null
  image_url: string | null
  button_text: string
  secondary_text: string
  product_url: string | null
  position: number
}

export default function ChatbotSettingsPage() {
  const params = useParams()
  const chatbotId = params.id as string

  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load chatbot data
  useEffect(() => {
    const loadChatbot = async () => {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}`)
        if (response.ok) {
          const data = await response.json()
          setChatbot(data)
        } else {
          toast.error("خطا در بارگذاری چت‌بات")
        }
      } catch (error) {
        console.error("Error loading chatbot:", error)
        toast.error("خطا در بارگذاری چت‌بات")
      } finally {
        setLoading(false)
      }
    }

    if (chatbotId) {
      loadChatbot()
    }
  }, [chatbotId])

  // Load FAQs
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}/faqs`)
        if (response.ok) {
          const data = await response.json()
          setFaqs(data)
        }
      } catch (error) {
        console.error("Error loading FAQs:", error)
      }
    }

    if (chatbotId) {
      loadFAQs()
    }
  }, [chatbotId])

  // Load Products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}/products`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Error loading products:", error)
      }
    }

    if (chatbotId) {
      loadProducts()
    }
  }, [chatbotId])

  const handleSave = async () => {
    if (!chatbot) return

    setSaving(true)
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatbot),
      })

      if (response.ok) {
        toast.success("تنظیمات با موفقیت ذخیره شد")
      } else {
        toast.error("خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      console.error("Error saving chatbot:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Chatbot, value: any) => {
    if (!chatbot) return
    setChatbot({ ...chatbot, [field]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">چت‌بات یافت نشد</h1>
          <p className="text-muted-foreground">چت‌بات مورد نظر وجود ندارد یا حذف شده است.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{chatbot.name}</h1>
          <p className="text-muted-foreground">تنظیمات و مدیریت چت‌بات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/chatbots/${chatbotId}/preview`}>
              <Eye className="w-4 h-4 mr-2" />
              پیش‌نمایش
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            ذخیره تغییرات
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            عمومی
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Eye className="w-4 h-4 mr-2" />
            ظاهر
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <MessageSquare className="w-4 h-4 mr-2" />
            سوالات متداول
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            محصولات
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            آمار
          </TabsTrigger>
          <TabsTrigger value="admin">
            <Users className="w-4 h-4 mr-2" />
            مدیران
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات عمومی</CardTitle>
              <CardDescription>تنظیمات اصلی چت‌بات را مدیریت کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">نام چت‌بات</Label>
                  <Input
                    id="name"
                    value={chatbot.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="نام چت‌بات را وارد کنید"
                  />
                </div>
                <div>
                  <Label htmlFor="chat_icon">آیکون چت</Label>
                  <Input
                    id="chat_icon"
                    value={chatbot.chat_icon}
                    onChange={(e) => handleInputChange("chat_icon", e.target.value)}
                    placeholder="💬"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="welcome_message">پیام خوش‌آمدگویی</Label>
                <Textarea
                  id="welcome_message"
                  value={chatbot.welcome_message}
                  onChange={(e) => handleInputChange("welcome_message", e.target.value)}
                  placeholder="سلام! چطور می‌توانم به شما کمک کنم؟"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="navigation_message">پیام راهنمایی</Label>
                <Textarea
                  id="navigation_message"
                  value={chatbot.navigation_message}
                  onChange={(e) => handleInputChange("navigation_message", e.target.value)}
                  placeholder="چه چیزی شما را به اینجا آورده است؟"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="knowledge_base_text">دانش پایه (متن)</Label>
                <Textarea
                  id="knowledge_base_text"
                  value={chatbot.knowledge_base_text || ""}
                  onChange={(e) => handleInputChange("knowledge_base_text", e.target.value)}
                  placeholder="اطلاعات کسب و کار خود را اینجا وارد کنید..."
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_url">آدرس فروشگاه</Label>
                  <Input
                    id="store_url"
                    value={chatbot.store_url || ""}
                    onChange={(e) => handleInputChange("store_url", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="deepseek_api_key">کلید API DeepSeek</Label>
                  <Input
                    id="deepseek_api_key"
                    type="password"
                    value={chatbot.deepseek_api_key || ""}
                    onChange={(e) => handleInputChange("deepseek_api_key", e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات ظاهری</CardTitle>
              <CardDescription>رنگ‌ها و موقعیت چت‌بات را تنظیم کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">رنگ اصلی</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={chatbot.primary_color}
                    onChange={(e) => handleInputChange("primary_color", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="text_color">رنگ متن</Label>
                  <Input
                    id="text_color"
                    type="color"
                    value={chatbot.text_color}
                    onChange={(e) => handleInputChange("text_color", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={chatbot.background_color}
                    onChange={(e) => handleInputChange("background_color", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="position">موقعیت</Label>
                  <select
                    id="position"
                    value={chatbot.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="bottom-right">پایین راست</option>
                    <option value="bottom-left">پایین چپ</option>
                    <option value="top-right">بالا راست</option>
                    <option value="top-left">بالا چپ</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="margin_x">فاصله افقی</Label>
                  <Input
                    id="margin_x"
                    type="number"
                    value={chatbot.margin_x}
                    onChange={(e) => handleInputChange("margin_x", Number.parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="margin_y">فاصله عمودی</Label>
                  <Input
                    id="margin_y"
                    type="number"
                    value={chatbot.margin_y}
                    onChange={(e) => handleInputChange("margin_y", Number.parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>سوالات متداول</CardTitle>
              <CardDescription>
                {faqs.length} سوال متداول
                <Badge variant="secondary" className="mr-2">
                  {faqs.length}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{faq.emoji}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{faq.question}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هنوز سوال متداولی اضافه نشده است</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>محصولات</CardTitle>
              <CardDescription>
                {products.length} محصول
                <Badge variant="secondary" className="mr-2">
                  {products.length}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                      {product.price && (
                        <p className="text-sm font-medium mt-2">{product.price.toLocaleString()} تومان</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هنوز محصولی اضافه نشده است</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">کل پیام‌ها</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">کاربران منحصر به فرد</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>آمار تفصیلی</CardTitle>
              <CardDescription>برای مشاهده آمار کامل به صفحه آنالیتیکس بروید</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/chatbots/${chatbotId}/analytics`}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  مشاهده آمار کامل
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>مدیران چت‌بات</CardTitle>
              <CardDescription>مدیریت کاربران مجاز برای دسترسی به پنل مدیریت</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/chatbots/${chatbotId}/admin-users`}>
                  <Users className="w-4 h-4 mr-2" />
                  مدیریت کاربران مدیر
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
