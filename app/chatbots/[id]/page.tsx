"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, Save, Eye, Settings, MessageSquare, Package, HelpCircle, Copy, ExternalLink } from "lucide-react"

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

export default function ChatbotPage() {
  const params = useParams()
  const chatbotId = params.id as string

  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("settings")

  // Form states
  const [settingsForm, setSettingsForm] = useState<Partial<Chatbot>>({})
  const [faqsJson, setFaqsJson] = useState("")
  const [productsJson, setProductsJson] = useState("")

  useEffect(() => {
    if (chatbotId) {
      fetchChatbotData()
    }
  }, [chatbotId])

  const fetchChatbotData = async () => {
    try {
      setLoading(true)

      // Fetch chatbot details
      const chatbotResponse = await fetch(`/api/chatbots/${chatbotId}`)
      if (chatbotResponse.ok) {
        const chatbotData = await chatbotResponse.json()
        setChatbot(chatbotData)
        setSettingsForm(chatbotData)
      }

      // Fetch FAQs
      const faqsResponse = await fetch(`/api/chatbots/${chatbotId}/faqs`)
      if (faqsResponse.ok) {
        const faqsData = await faqsResponse.json()
        setFaqs(faqsData)
        setFaqsJson(JSON.stringify(faqsData, null, 2))
      }

      // Fetch Products
      const productsResponse = await fetch(`/api/chatbots/${chatbotId}/products`)
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
        setProductsJson(JSON.stringify(productsData, null, 2))
      }
    } catch (error) {
      console.error("Error fetching chatbot data:", error)
      toast.error("خطا در بارگیری اطلاعات چت‌بات")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      })

      if (response.ok) {
        const updatedChatbot = await response.json()
        setChatbot(updatedChatbot)
        toast.success("تنظیمات با موفقیت ذخیره شد")
      } else {
        toast.error("خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setSaving(false)
    }
  }

  const saveFAQs = async () => {
    try {
      setSaving(true)
      const parsedFaqs = JSON.parse(faqsJson)

      const response = await fetch(`/api/chatbots/${chatbotId}/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs: parsedFaqs }),
      })

      if (response.ok) {
        const savedFaqs = await response.json()
        setFaqs(savedFaqs)
        toast.success("سوالات متداول با موفقیت ذخیره شد")
      } else {
        toast.error("خطا در ذخیره سوالات متداول")
      }
    } catch (error) {
      console.error("Error saving FAQs:", error)
      toast.error("خطا در فرمت JSON یا ذخیره سوالات متداول")
    } finally {
      setSaving(false)
    }
  }

  const saveProducts = async () => {
    try {
      setSaving(true)
      const parsedProducts = JSON.parse(productsJson)

      const response = await fetch(`/api/chatbots/${chatbotId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: parsedProducts }),
      })

      if (response.ok) {
        const savedProducts = await response.json()
        setProducts(savedProducts)
        toast.success("محصولات با موفقیت ذخیره شد")
      } else {
        toast.error("خطا در ذخیره محصولات")
      }
    } catch (error) {
      console.error("Error saving products:", error)
      toast.error("خطا در فرمت JSON یا ذخیره محصولات")
    } finally {
      setSaving(false)
    }
  }

  const copyEmbedCode = () => {
    const embedCode = `<script>
  window.TalkSellConfig = {
    chatbotId: "${chatbotId}",
    apiUrl: "${window.location.origin}"
  };
</script>
<script src="${window.location.origin}/widget-loader.js" async></script>`

    navigator.clipboard.writeText(embedCode)
    toast.success("کد نصب کپی شد")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">چت‌بات یافت نشد</h1>
          <p className="text-gray-600 mt-2">چت‌بات مورد نظر وجود ندارد یا حذف شده است.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{chatbot.name}</h1>
            <p className="text-gray-600 mt-2">مدیریت و تنظیمات چت‌بات</p>
          </div>
          <Badge variant="secondary">ID: {chatbot.id}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            تنظیمات
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            سوالات متداول
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            محصولات
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            پیش‌نمایش
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات عمومی</CardTitle>
              <CardDescription>تنظیمات اصلی چت‌بات را در اینجا ویرایش کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">نام چت‌بات</Label>
                  <Input
                    id="name"
                    value={settingsForm.name || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    placeholder="نام چت‌بات"
                  />
                </div>
                <div>
                  <Label htmlFor="chat_icon">آیکون چت</Label>
                  <Input
                    id="chat_icon"
                    value={settingsForm.chat_icon || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, chat_icon: e.target.value })}
                    placeholder="💬"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="welcome_message">پیام خوش‌آمدگویی</Label>
                <Textarea
                  id="welcome_message"
                  value={settingsForm.welcome_message || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, welcome_message: e.target.value })}
                  placeholder="سلام! چطور می‌توانم به شما کمک کنم؟"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="navigation_message">پیام راهنمایی</Label>
                <Textarea
                  id="navigation_message"
                  value={settingsForm.navigation_message || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, navigation_message: e.target.value })}
                  placeholder="چه چیزی شما را به اینجا آورده است؟"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">رنگ اصلی</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={settingsForm.primary_color || "#14b8a6"}
                    onChange={(e) => setSettingsForm({ ...settingsForm, primary_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="text_color">رنگ متن</Label>
                  <Input
                    id="text_color"
                    type="color"
                    value={settingsForm.text_color || "#ffffff"}
                    onChange={(e) => setSettingsForm({ ...settingsForm, text_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={settingsForm.background_color || "#f3f4f6"}
                    onChange={(e) => setSettingsForm({ ...settingsForm, background_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deepseek_api_key">کلید API DeepSeek</Label>
                <Input
                  id="deepseek_api_key"
                  type="password"
                  value={settingsForm.deepseek_api_key || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deepseek_api_key: e.target.value })}
                  placeholder="sk-..."
                />
              </div>

              <div>
                <Label htmlFor="knowledge_base_text">دانش پایه (متن)</Label>
                <Textarea
                  id="knowledge_base_text"
                  value={settingsForm.knowledge_base_text || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, knowledge_base_text: e.target.value })}
                  placeholder="اطلاعات و دانش پایه چت‌بات را اینجا وارد کنید..."
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_url">آدرس فروشگاه</Label>
                  <Input
                    id="store_url"
                    value={settingsForm.store_url || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, store_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="stats_multiplier">ضریب آمار</Label>
                  <Input
                    id="stats_multiplier"
                    type="number"
                    step="0.1"
                    value={settingsForm.stats_multiplier || 1.0}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, stats_multiplier: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              <Button onClick={saveSettings} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    ذخیره تنظیمات
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سوالات متداول</CardTitle>
              <CardDescription>سوالات متداول را به صورت JSON وارد کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="faqs-json">JSON سوالات متداول</Label>
                <Textarea
                  id="faqs-json"
                  value={faqsJson}
                  onChange={(e) => setFaqsJson(e.target.value)}
                  placeholder={`[
  {
    "question": "ساعات کاری شما چیست؟",
    "answer": "ما از شنبه تا پنج‌شنبه از ساعت ۹ تا ۱۸ فعال هستیم.",
    "emoji": "🕒",
    "position": 0
  }
]`}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={saveFAQs} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    ذخیره سوالات متداول
                  </>
                )}
              </Button>

              {faqs.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">سوالات فعلی ({faqs.length})</h3>
                  <div className="space-y-2">
                    {faqs.map((faq, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{faq.emoji}</span>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>محصولات</CardTitle>
              <CardDescription>محصولات را به صورت JSON وارد کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="products-json">JSON محصولات</Label>
                <Textarea
                  id="products-json"
                  value={productsJson}
                  onChange={(e) => setProductsJson(e.target.value)}
                  placeholder={`[
  {
    "name": "محصول نمونه",
    "description": "توضیحات محصول",
    "price": 100000,
    "image_url": "https://example.com/image.jpg",
    "button_text": "خرید",
    "secondary_text": "جزئیات",
    "product_url": "https://example.com/product",
    "position": 0
  }
]`}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={saveProducts} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    ذخیره محصولات
                  </>
                )}
              </Button>

              {products.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">محصولات فعلی ({products.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          {product.image_url && (
                            <img
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            {product.price && (
                              <p className="text-sm font-semibold mt-2">{product.price.toLocaleString()} تومان</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>پیش‌نمایش چت‌بات</CardTitle>
              <CardDescription>چت‌بات را در حالت زنده مشاهده کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">کد نصب چت‌بات</h3>
                    <p className="text-sm text-gray-600">این کد را در وب‌سایت خود قرار دهید</p>
                  </div>
                  <Button onClick={copyEmbedCode} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    کپی کد
                  </Button>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`<script>
  window.TalkSellConfig = {
    chatbotId: "${chatbotId}",
    apiUrl: "${typeof window !== "undefined" ? window.location.origin : ""}"
  };
</script>
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget-loader.js" async></script>`}</pre>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4">پیش‌نمایش زنده</h3>
                  <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
                    <iframe src={`/widget/${chatbotId}`} className="w-full h-full" title="پیش‌نمایش چت‌بات" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <a href={`/widget/${chatbotId}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      باز کردن در تب جدید
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={`/chatbots/${chatbotId}/analytics`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      مشاهده آمار
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
