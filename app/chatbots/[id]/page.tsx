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
import {
  Loader2,
  Save,
  Eye,
  Settings,
  MessageSquare,
  Package,
  Users,
  BarChart3,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  Download,
} from "lucide-react"
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
  id?: number
  question: string
  answer: string
  emoji: string
  position: number
}

interface Product {
  id?: number
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
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // JSON import states
  const [showFaqImport, setShowFaqImport] = useState(false)
  const [showProductImport, setShowProductImport] = useState(false)
  const [faqJsonInput, setFaqJsonInput] = useState("")
  const [productJsonInput, setProductJsonInput] = useState("")

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

  const handleSaveGeneral = async () => {
    if (!chatbot) return
    setSaving("general")
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatbot),
      })

      if (response.ok) {
        toast.success("تنظیمات عمومی با موفقیت ذخیره شد")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "یک خطای ناشناخته رخ داد"
      toast.error(errorMessage)
    } finally {
      setSaving(null)
    }
  }

  const handleSaveAppearance = async () => {
    if (!chatbot) return
    setSaving("appearance")
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatbot),
      })

      if (response.ok) {
        toast.success("تنظیمات ظاهری با موفقیت ذخیره شد")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "یک خطای ناشناخته رخ داد"
      toast.error(errorMessage)
    } finally {
      setSaving(null)
    }
  }

  const handleSaveFaqs = async () => {
    setSaving("faqs")
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs }),
      })

      if (response.ok) {
        const updatedFaqs = await response.json()
        setFaqs(updatedFaqs)
        toast.success("سوالات متداول با موفقیت ذخیره شد")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "خطا در ذخیره سوالات متداول")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "یک خطای ناشناخته رخ داد"
      toast.error(errorMessage)
    } finally {
      setSaving(null)
    }
  }

  const handleSaveProducts = async () => {
    setSaving("products")
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      })

      if (response.ok) {
        const updatedProducts = await response.json()
        setProducts(updatedProducts)
        toast.success("محصولات با موفقیت ذخیره شد")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "خطا در ذخیره محصولات")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "یک خطای ناشناخته رخ داد"
      toast.error(errorMessage)
    } finally {
      setSaving(null)
    }
  }

  const handleInputChange = (field: keyof Chatbot, value: any) => {
    if (!chatbot) return
    setChatbot({ ...chatbot, [field]: value })
  }

  // FAQ functions
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "", emoji: "❓", position: faqs.length }])
  }

  const updateFaq = (index: number, field: keyof FAQ, value: any) => {
    setFaqs(faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)))
  }

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const handleFaqJsonImport = () => {
    try {
      const parsedFaqs = JSON.parse(faqJsonInput)
      if (Array.isArray(parsedFaqs)) {
        const validatedFaqs = parsedFaqs.map((faq, index) => ({
          question: faq.question || "",
          answer: faq.answer || "",
          emoji: faq.emoji || "❓",
          position: index,
        }))
        setFaqs(validatedFaqs)
        setFaqJsonInput("")
        setShowFaqImport(false)
        toast.success("سوالات متداول با موفقیت از JSON وارد شدند.")
      } else {
        toast.error("فرمت JSON نامعتبر است. باید آرایه‌ای از سوالات باشد.")
      }
    } catch (error) {
      toast.error("خطا در پردازش JSON: " + (error instanceof Error ? error.message : "خطای نامشخص"))
    }
  }

  const handleFaqJsonExport = () => {
    const exportData = faqs.map(({ id, ...faq }) => faq)
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "faqs.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Product functions
  const addProduct = () => {
    setProducts([
      ...products,
      {
        name: "",
        description: "",
        price: null,
        image_url: null,
        button_text: "خرید",
        secondary_text: "جزئیات",
        product_url: null,
        position: products.length,
      },
    ])
  }

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    setProducts(products.map((product, i) => (i === index ? { ...product, [field]: value } : product)))
  }

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleProductJsonImport = () => {
    try {
      const parsedProducts = JSON.parse(productJsonInput)
      if (Array.isArray(parsedProducts)) {
        const validatedProducts = parsedProducts.map((product, index) => ({
          name: product.name || "",
          description: product.description || "",
          price: product.price ? Number(product.price) : null,
          image_url: product.image_url || null,
          button_text: product.button_text || "خرید",
          secondary_text: product.secondary_text || "جزئیات",
          product_url: product.product_url || null,
          position: index,
        }))
        setProducts(validatedProducts)
        setProductJsonInput("")
        setShowProductImport(false)
        toast.success("محصولات با موفقیت از JSON وارد شدند.")
      } else {
        toast.error("فرمت JSON نامعتبر است. باید آرایه‌ای از محصولات باشد.")
      }
    } catch (error) {
      toast.error("خطا در پردازش JSON: " + (error instanceof Error ? error.message : "خطای نامشخص"))
    }
  }

  const handleProductJsonExport = () => {
    const exportData = products.map(({ id, ...product }) => product)
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
    return null
  }

  const sampleFaqJson = `[
  {
    "question": "ساعات کاری شما چیست؟",
    "answer": "ما از شنبه تا پنج‌شنبه از ساعت 9 تا 18 فعال هستیم.",
    "emoji": "🕐"
  },
  {
    "question": "چگونه سفارش دهم؟",
    "answer": "می‌توانید از طریق سایت یا تماس با ما سفارش دهید.",
    "emoji": "🛒"
  }
]`

  const sampleProductJson = `[
  {
    "name": "محصول شماره ۱",
    "description": "توضیحات محصول شماره ۱",
    "price": 150000,
    "image_url": "https://example.com/image1.jpg",
    "button_text": "خرید",
    "secondary_text": "اطلاعات بیشتر",
    "product_url": "https://example.com/product1"
  },
  {
    "name": "محصول شماره ۲",
    "description": "توضیحات محصول شماره ۲",
    "price": 250000,
    "image_url": "https://example.com/image2.jpg",
    "button_text": "افزودن به سبد",
    "secondary_text": "اطلاعات بیشتر",
    "product_url": "https://example.com/product2"
  }
]`

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

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={saving === "general"}>
                  {saving === "general" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  ذخیره تنظیمات عمومی
                </Button>
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

              <div className="flex justify-end">
                <Button onClick={handleSaveAppearance} disabled={saving === "appearance"}>
                  {saving === "appearance" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  ذخیره تنظیمات ظاهری
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>سوالات متداول</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="ml-2">
                      {faqs.length}
                    </Badge>
                    سوال متداول
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFaqJsonExport}>
                    <Download className="w-4 h-4 mr-2" />
                    خروجی JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowFaqImport(!showFaqImport)}>
                    <Upload className="w-4 h-4 mr-2" />
                    وارد کردن JSON
                  </Button>
                  <Button onClick={addFaq} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    افزودن سوال
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showFaqImport && (
                <div className="border rounded-lg p-4 bg-blue-50/50 space-y-3">
                  <h4 className="font-medium">وارد کردن سوالات متداول از JSON</h4>
                  <Textarea
                    value={faqJsonInput}
                    onChange={(e) => setFaqJsonInput(e.target.value)}
                    placeholder="JSON سوالات متداول را اینجا وارد کنید..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleFaqJsonImport} size="sm">
                      وارد کردن
                    </Button>
                    <Button onClick={() => setFaqJsonInput(sampleFaqJson)} variant="outline" size="sm">
                      نمونه JSON
                    </Button>
                    <Button onClick={() => setShowFaqImport(false)} variant="ghost" size="sm">
                      انصراف
                    </Button>
                  </div>
                </div>
              )}

              {faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">سوال {index + 1}</h4>
                        <Button variant="destructive" size="sm" onClick={() => removeFaq(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>سوال</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFaq(index, "question", e.target.value)}
                            placeholder="سوال را وارد کنید"
                          />
                        </div>
                        <div>
                          <Label>ایموجی</Label>
                          <Input
                            value={faq.emoji}
                            onChange={(e) => updateFaq(index, "emoji", e.target.value)}
                            placeholder="❓"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>پاسخ</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, "answer", e.target.value)}
                          placeholder="پاسخ را وارد کنید"
                          rows={3}
                        />
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

              <div className="flex justify-end">
                <Button onClick={handleSaveFaqs} disabled={saving === "faqs"}>
                  {saving === "faqs" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  ذخیره سوالات متداول
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>محصولات</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="ml-2">
                      {products.length}
                    </Badge>
                    محصول
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleProductJsonExport}>
                    <Download className="w-4 h-4 mr-2" />
                    خروجی JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowProductImport(!showProductImport)}>
                    <Upload className="w-4 h-4 mr-2" />
                    وارد کردن JSON
                  </Button>
                  <Button onClick={addProduct} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    افزودن محصول
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showProductImport && (
                <div className="border rounded-lg p-4 bg-blue-50/50 space-y-3">
                  <h4 className="font-medium">وارد کردن محصولات از JSON</h4>
                  <Textarea
                    value={productJsonInput}
                    onChange={(e) => setProductJsonInput(e.target.value)}
                    placeholder="JSON محصولات را اینجا وارد کنید..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleProductJsonImport} size="sm">
                      وارد کردن
                    </Button>
                    <Button onClick={() => setProductJsonInput(sampleProductJson)} variant="outline" size="sm">
                      نمونه JSON
                    </Button>
                    <Button onClick={() => setShowProductImport(false)} variant="ghost" size="sm">
                      انصراف
                    </Button>
                  </div>
                </div>
              )}

              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">محصول {index + 1}</h4>
                        <Button variant="destructive" size="sm" onClick={() => removeProduct(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>نام محصول</Label>
                          <Input
                            value={product.name}
                            onChange={(e) => updateProduct(index, "name", e.target.value)}
                            placeholder="نام محصول"
                          />
                        </div>
                        <div>
                          <Label>قیمت (تومان)</Label>
                          <Input
                            type="number"
                            value={product.price || ""}
                            onChange={(e) =>
                              updateProduct(index, "price", e.target.value ? Number(e.target.value) : null)
                            }
                            placeholder="قیمت"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>توضیحات</Label>
                        <Textarea
                          value={product.description}
                          onChange={(e) => updateProduct(index, "description", e.target.value)}
                          placeholder="توضیحات محصول"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>آدرس تصویر</Label>
                          <Input
                            value={product.image_url || ""}
                            onChange={(e) => updateProduct(index, "image_url", e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div>
                          <Label>آدرس محصول</Label>
                          <Input
                            value={product.product_url || ""}
                            onChange={(e) => updateProduct(index, "product_url", e.target.value)}
                            placeholder="https://example.com/product"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>متن دکمه اصلی</Label>
                          <Input
                            value={product.button_text}
                            onChange={(e) => updateProduct(index, "button_text", e.target.value)}
                            placeholder="خرید"
                          />
                        </div>
                        <div>
                          <Label>متن دکمه دوم</Label>
                          <Input
                            value={product.secondary_text}
                            onChange={(e) => updateProduct(index, "secondary_text", e.target.value)}
                            placeholder="جزئیات"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هنوز محصولی اضافه نشده است</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSaveProducts} disabled={saving === "products"}>
                  {saving === "products" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  ذخیره محصولات
                </Button>
              </div>
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
