"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Save, Eye, Settings, MessageSquare, Package, Users, BarChart3, AlertCircle } from "lucide-react"
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
  const router = useRouter()
  const chatbotId = params.id as string

  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chatbotId || isNaN(Number(chatbotId))) {
      setError("شناسه چت‌بات نامعتبر است.")
      setLoading(false)
      return
    }

    const loadAllData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [chatbotRes, faqsRes, productsRes] = await Promise.all([
          fetch(`/api/chatbots/${chatbotId}`),
          fetch(`/api/chatbots/${chatbotId}/faqs`),
          fetch(`/api/chatbots/${chatbotId}/products`),
        ])

        if (!chatbotRes.ok) {
          if (chatbotRes.status === 404) {
            throw new Error("چت‌بات با این شناسه یافت نشد.")
          }
          throw new Error("خطا در بارگذاری اطلاعات چت‌بات")
        }

        const chatbotData = await chatbotRes.json()
        const faqsData = faqsRes.ok ? await faqsRes.json() : []
        const productsData = productsRes.ok ? await productsRes.json() : []

        setChatbot(chatbotData)
        setFaqs(faqsData)
        setProducts(productsData)
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "خطا در اتصال به سرور"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [chatbotId])

  const handleSave = async () => {
    if (!chatbot) return

    setSaving(true)
    toast.loading("در حال ذخیره تغییرات...")
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatbot),
      })

      if (response.ok) {
        toast.success("تنظیمات با موفقیت ذخیره شد")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "یک خطای ناشناخته رخ داد"
      toast.error(errorMessage)
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-4 text-lg">در حال بارگذاری تنظیمات...</p>
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
            <Button onClick={() => router.push("/")}>بازگشت به لیست چت‌بات‌ها</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!chatbot) {
    return null // Should be handled by error state
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
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
                <Badge variant="secondary" className="ml-2">
                  {faqs.length}
                </Badge>
                سوال متداول
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
                <Badge variant="secondary" className="ml-2">
                  {products.length}
                </Badge>
                محصول
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
          <Card>
            <CardHeader>
              <CardTitle>آمار</CardTitle>
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
