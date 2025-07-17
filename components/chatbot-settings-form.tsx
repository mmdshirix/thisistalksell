"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Palette, Settings, Package, HelpCircle, Trash2, Plus, Save } from "lucide-react"
import type { Chatbot, ChatbotFAQ, ChatbotProduct } from "@/lib/db"

const chatbotSchema = z.object({
  name: z.string().min(1, "نام چت‌بات الزامی است"),
  welcome_message: z.string().min(1, "پیام خوش‌آمدگویی الزامی است"),
  navigation_message: z.string().min(1, "پیام راهنمایی الزامی است"),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "رنگ نامعتبر است"),
  text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "رنگ متن نامعتبر است"),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "رنگ پس‌زمینه نامعتبر است"),
  chat_icon: z.string().min(1, "آیکون چت الزامی است"),
  position: z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]),
  margin_x: z.number().min(0).max(100),
  margin_y: z.number().min(0).max(100),
  deepseek_api_key: z.string().optional(),
  knowledge_base_text: z.string().optional(),
  knowledge_base_url: z.string().url().optional().or(z.literal("")),
  store_url: z.string().url().optional().or(z.literal("")),
  ai_url: z.string().url().optional().or(z.literal("")),
  stats_multiplier: z.number().optional(),
})

type ChatbotFormData = z.infer<typeof chatbotSchema>

interface ChatbotSettingsFormProps {
  chatbot: Chatbot
}

export default function ChatbotSettingsForm({ chatbot }: ChatbotSettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: chatbot.name,
    welcome_message: chatbot.welcome_message,
    navigation_message: chatbot.navigation_message,
    primary_color: chatbot.primary_color,
    text_color: chatbot.text_color,
    background_color: chatbot.background_color,
    chat_icon: chatbot.chat_icon,
    position: chatbot.position,
    margin_x: chatbot.margin_x,
    margin_y: chatbot.margin_y,
    deepseek_api_key: chatbot.deepseek_api_key || "",
    knowledge_base_text: chatbot.knowledge_base_text || "",
    knowledge_base_url: chatbot.knowledge_base_url || "",
    store_url: chatbot.store_url || "",
    ai_url: chatbot.ai_url || "",
    stats_multiplier: chatbot.stats_multiplier || 1.0,
  })

  const [faqs, setFaqs] = useState<ChatbotFAQ[]>([])
  const [products, setProducts] = useState<ChatbotProduct[]>([])

  // Load FAQs and Products
  const loadFAQs = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/faqs`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
      }
    } catch (error) {
      console.error("Error loading FAQs:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  // Save chatbot settings
  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("تنظیمات با موفقیت ذخیره شد")
        router.refresh()
      } else {
        toast.error("خطا در ذخیره تنظیمات")
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور")
    } finally {
      setIsLoading(false)
    }
  }

  // Save FAQs
  const saveFAQs = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/faqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ faqs }),
      })

      if (response.ok) {
        toast.success("سوالات متداول ذخیره شد")
      } else {
        toast.error("خطا در ذخیره سوالات متداول")
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور")
    }
  }

  // Save Products
  const saveProducts = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      })

      if (response.ok) {
        toast.success("محصولات ذخیره شد")
      } else {
        toast.error("خطا در ذخیره محصولات")
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور")
    }
  }

  // Add new FAQ
  const addFAQ = () => {
    setFaqs([
      ...faqs,
      {
        id: Date.now(),
        chatbot_id: chatbot.id,
        question: "",
        answer: "",
        emoji: "❓",
        position: faqs.length,
      },
    ])
  }

  // Remove FAQ
  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  // Add new Product
  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now(),
        chatbot_id: chatbot.id,
        name: "",
        description: "",
        image_url: "",
        price: 0,
        position: products.length,
        button_text: "خرید",
        secondary_text: "جزئیات",
        product_url: "",
      },
    ])
  }

  // Remove Product
  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            عمومی
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            ظاهر
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <HelpCircle className="w-4 h-4 mr-2" />
            سوالات متداول
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            محصولات
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات عمومی</CardTitle>
              <CardDescription>نام، پیام‌ها و تنظیمات اصلی چت‌بات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">نام چت‌بات</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="نام چت‌بات خود را وارد کنید"
                  />
                </div>
                <div>
                  <Label htmlFor="chat_icon">آیکون چت</Label>
                  <Input
                    id="chat_icon"
                    value={formData.chat_icon}
                    onChange={(e) => setFormData({ ...formData, chat_icon: e.target.value })}
                    placeholder="💬"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="welcome_message">پیام خوش‌آمدگویی</Label>
                <Textarea
                  id="welcome_message"
                  value={formData.welcome_message}
                  onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                  placeholder="سلام! چطور می‌توانم به شما کمک کنم؟"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="navigation_message">پیام راهنمایی</Label>
                <Textarea
                  id="navigation_message"
                  value={formData.navigation_message}
                  onChange={(e) => setFormData({ ...formData, navigation_message: e.target.value })}
                  placeholder="چه چیزی شما را به اینجا آورده است؟"
                  rows={3}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="deepseek_api_key">کلید API DeepSeek</Label>
                <Input
                  id="deepseek_api_key"
                  type="password"
                  value={formData.deepseek_api_key}
                  onChange={(e) => setFormData({ ...formData, deepseek_api_key: e.target.value })}
                  placeholder="sk-..."
                />
              </div>

              <div>
                <Label htmlFor="knowledge_base_text">متن دانش پایه</Label>
                <Textarea
                  id="knowledge_base_text"
                  value={formData.knowledge_base_text}
                  onChange={(e) => setFormData({ ...formData, knowledge_base_text: e.target.value })}
                  placeholder="اطلاعات مربوط به کسب و کار شما..."
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="knowledge_base_url">URL دانش پایه</Label>
                  <Input
                    id="knowledge_base_url"
                    value={formData.knowledge_base_url}
                    onChange={(e) => setFormData({ ...formData, knowledge_base_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="store_url">URL فروشگاه</Label>
                  <Input
                    id="store_url"
                    value={formData.store_url}
                    onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                    placeholder="https://shop.example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="ai_url">URL هوش مصنوعی</Label>
                  <Input
                    id="ai_url"
                    value={formData.ai_url}
                    onChange={(e) => setFormData({ ...formData, ai_url: e.target.value })}
                    placeholder="https://api.example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stats_multiplier">ضریب آمار</Label>
                <Input
                  id="stats_multiplier"
                  type="number"
                  step="0.1"
                  value={formData.stats_multiplier}
                  onChange={(e) =>
                    setFormData({ ...formData, stats_multiplier: Number.parseFloat(e.target.value) || 1.0 })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات ظاهری</CardTitle>
              <CardDescription>رنگ‌ها، موقعیت و ظاهر چت‌بات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">رنگ اصلی</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="text_color">رنگ متن</Label>
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="position">موقعیت</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">پایین راست</SelectItem>
                      <SelectItem value="bottom-left">پایین چپ</SelectItem>
                      <SelectItem value="top-right">بالا راست</SelectItem>
                      <SelectItem value="top-left">بالا چپ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="margin_x">فاصله افقی</Label>
                  <Input
                    id="margin_x"
                    type="number"
                    value={formData.margin_x}
                    onChange={(e) => setFormData({ ...formData, margin_x: Number.parseInt(e.target.value) || 20 })}
                  />
                </div>
                <div>
                  <Label htmlFor="margin_y">فاصله عمودی</Label>
                  <Input
                    id="margin_y"
                    type="number"
                    value={formData.margin_y}
                    onChange={(e) => setFormData({ ...formData, margin_y: Number.parseInt(e.target.value) || 20 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                سوالات متداول
                <Button onClick={addFAQ} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  افزودن سوال
                </Button>
              </CardTitle>
              <CardDescription>سوالات متداول که کاربران می‌توانند انتخاب کنند</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-1">
                      <Label>ایموجی</Label>
                      <Input
                        value={faq.emoji || ""}
                        onChange={(e) => {
                          const newFaqs = [...faqs]
                          newFaqs[index].emoji = e.target.value
                          setFaqs(newFaqs)
                        }}
                        placeholder="❓"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Label>سوال</Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...faqs]
                          newFaqs[index].question = e.target.value
                          setFaqs(newFaqs)
                        }}
                        placeholder="سوال متداول..."
                      />
                    </div>
                    <div className="md:col-span-6">
                      <Label>پاسخ</Label>
                      <Input
                        value={faq.answer || ""}
                        onChange={(e) => {
                          const newFaqs = [...faqs]
                          newFaqs[index].answer = e.target.value
                          setFaqs(newFaqs)
                        }}
                        placeholder="پاسخ..."
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Button variant="destructive" size="sm" onClick={() => removeFAQ(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {faqs.length > 0 && (
                <Button onClick={saveFAQs} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  ذخیره سوالات متداول
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                محصولات
                <Button onClick={addProduct} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  افزودن محصول
                </Button>
              </CardTitle>
              <CardDescription>محصولاتی که چت‌بات می‌تواند پیشنهاد دهد</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.map((product, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>نام محصول</Label>
                      <Input
                        value={product.name}
                        onChange={(e) => {
                          const newProducts = [...products]
                          newProducts[index].name = e.target.value
                          setProducts(newProducts)
                        }}
                        placeholder="نام محصول..."
                      />
                    </div>
                    <div>
                      <Label>قیمت</Label>
                      <Input
                        type="number"
                        value={product.price || ""}
                        onChange={(e) => {
                          const newProducts = [...products]
                          newProducts[index].price = Number.parseFloat(e.target.value) || null
                          setProducts(newProducts)
                        }}
                        placeholder="قیمت..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>توضیحات</Label>
                      <Textarea
                        value={product.description || ""}
                        onChange={(e) => {
                          const newProducts = [...products]
                          newProducts[index].description = e.target.value
                          setProducts(newProducts)
                        }}
                        placeholder="توضیحات محصول..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>URL تصویر</Label>
                      <Input
                        value={product.image_url || ""}
                        onChange={(e) => {
                          const newProducts = [...products]
                          newProducts[index].image_url = e.target.value
                          setProducts(newProducts)
                        }}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label>URL محصول</Label>
                      <Input
                        value={product.product_url || ""}
                        onChange={(e) => {
                          const newProducts = [...products]
                          newProducts[index].product_url = e.target.value
                          setProducts(newProducts)
                        }}
                        placeholder="https://example.com/product"
                      />
                    </div>
                    <div>
                      <Label>متن دکمه</Label>
                      <Input
                        value={product.button_text}
                        onChange={(e) => {
                          const newProducts = [...products]
                          newProducts[index].button_text = e.target.value
                          setProducts(newProducts)
                        }}
                        placeholder="خرید"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button variant="destructive" size="sm" onClick={() => removeProduct(index)} className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        حذف محصول
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {products.length > 0 && (
                <Button onClick={saveProducts} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  ذخیره محصولات
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </Button>
      </div>
    </div>
  )
}
