"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Save } from "lucide-react"
import type { Chatbot } from "@/lib/db"

interface ChatbotSettingsFormProps {
  chatbot: Chatbot
}

interface FAQ {
  id?: number
  question: string
  answer: string
  emoji: string
}

interface Product {
  id?: number
  name: string
  description: string
  price: number | null
  image_url: string
  button_text: string
  secondary_text: string
  product_url: string
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
  })

  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("خطا در بروزرسانی چت‌بات")
      }

      toast.success("تنظیمات با موفقیت ذخیره شد")
      router.refresh()
    } catch (error) {
      console.error("Error updating chatbot:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addFAQ = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "", emoji: "❓" }])
  }

  const removeFAQ = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    setFaqs((prev) => prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)))
  }

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        price: null,
        image_url: "",
        button_text: "خرید",
        secondary_text: "جزئیات",
        product_url: "",
      },
    ])
  }

  const removeProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    setProducts((prev) => prev.map((product, i) => (i === index ? { ...product, [field]: value } : product)))
  }

  const saveFAQs = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/faqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ faqs }),
      })

      if (!response.ok) {
        throw new Error("خطا در ذخیره سوالات متداول")
      }

      toast.success("سوالات متداول ذخیره شد")
    } catch (error) {
      console.error("Error saving FAQs:", error)
      toast.error("خطا در ذخیره سوالات متداول")
    }
  }

  const saveProducts = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      })

      if (!response.ok) {
        throw new Error("خطا در ذخیره محصولات")
      }

      toast.success("محصولات ذخیره شد")
    } catch (error) {
      console.error("Error saving products:", error)
      toast.error("خطا در ذخیره محصولات")
    }
  }

  return (
    <Tabs defaultValue="basic" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">تنظیمات پایه</TabsTrigger>
        <TabsTrigger value="appearance">ظاهر</TabsTrigger>
        <TabsTrigger value="faqs">سوالات متداول</TabsTrigger>
        <TabsTrigger value="products">محصولات</TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام چت‌بات</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="نام چت‌بات را وارد کنید"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chat_icon">آیکون چت</Label>
              <Input
                id="chat_icon"
                value={formData.chat_icon}
                onChange={(e) => handleInputChange("chat_icon", e.target.value)}
                placeholder="💬"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome_message">پیام خوش‌آمدگویی</Label>
            <Textarea
              id="welcome_message"
              value={formData.welcome_message}
              onChange={(e) => handleInputChange("welcome_message", e.target.value)}
              placeholder="سلام! چطور می‌توانم به شما کمک کنم؟"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="navigation_message">پیام راهنمایی</Label>
            <Textarea
              id="navigation_message"
              value={formData.navigation_message}
              onChange={(e) => handleInputChange("navigation_message", e.target.value)}
              placeholder="چه چیزی شما را به اینجا آورده است؟"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="knowledge_base_text">دانش پایه (متن)</Label>
            <Textarea
              id="knowledge_base_text"
              value={formData.knowledge_base_text}
              onChange={(e) => handleInputChange("knowledge_base_text", e.target.value)}
              placeholder="اطلاعات مربوط به کسب و کار خود را اینجا وارد کنید"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="knowledge_base_url">آدرس وب‌سایت</Label>
              <Input
                id="knowledge_base_url"
                type="url"
                value={formData.knowledge_base_url}
                onChange={(e) => handleInputChange("knowledge_base_url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_url">آدرس فروشگاه</Label>
              <Input
                id="store_url"
                type="url"
                value={formData.store_url}
                onChange={(e) => handleInputChange("store_url", e.target.value)}
                placeholder="https://shop.example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deepseek_api_key">کلید API DeepSeek</Label>
            <Input
              id="deepseek_api_key"
              type="password"
              value={formData.deepseek_api_key}
              onChange={(e) => handleInputChange("deepseek_api_key", e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            ذخیره تنظیمات
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="appearance">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">رنگ اصلی</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange("primary_color", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange("primary_color", e.target.value)}
                  placeholder="#14b8a6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_color">رنگ متن</Label>
              <div className="flex gap-2">
                <Input
                  id="text_color"
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => handleInputChange("text_color", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.text_color}
                  onChange={(e) => handleInputChange("text_color", e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
              <div className="flex gap-2">
                <Input
                  id="background_color"
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => handleInputChange("background_color", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.background_color}
                  onChange={(e) => handleInputChange("background_color", e.target.value)}
                  placeholder="#f3f4f6"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">موقعیت</Label>
              <Select value={formData.position} onValueChange={(value) => handleInputChange("position", value)}>
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

            <div className="space-y-2">
              <Label htmlFor="margin_x">فاصله افقی</Label>
              <Input
                id="margin_x"
                type="number"
                value={formData.margin_x}
                onChange={(e) => handleInputChange("margin_x", Number.parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin_y">فاصله عمودی</Label>
              <Input
                id="margin_y"
                type="number"
                value={formData.margin_y}
                onChange={(e) => handleInputChange("margin_y", Number.parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            ذخیره ظاهر
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="faqs">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">سوالات متداول</h3>
            <Button onClick={addFAQ} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              افزودن سوال
            </Button>
          </div>

          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-1">
                    <Label>ایموجی</Label>
                    <Input
                      value={faq.emoji}
                      onChange={(e) => updateFAQ(index, "emoji", e.target.value)}
                      placeholder="❓"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <Label>سوال</Label>
                    <Input
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, "question", e.target.value)}
                      placeholder="سوال خود را وارد کنید"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <Label>پاسخ</Label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                      placeholder="پاسخ را وارد کنید"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button variant="outline" size="icon" onClick={() => removeFAQ(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {faqs.length > 0 && (
            <Button onClick={saveFAQs}>
              <Save className="w-4 h-4 mr-2" />
              ذخیره سوالات متداول
            </Button>
          )}
        </div>
      </TabsContent>

      <TabsContent value="products">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">محصولات</h3>
            <Button onClick={addProduct} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              افزودن محصول
            </Button>
          </div>

          {products.map((product, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نام محصول</Label>
                    <Input
                      value={product.name}
                      onChange={(e) => updateProduct(index, "name", e.target.value)}
                      placeholder="نام محصول"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>قیمت</Label>
                    <Input
                      type="number"
                      value={product.price || ""}
                      onChange={(e) =>
                        updateProduct(index, "price", e.target.value ? Number.parseFloat(e.target.value) : null)
                      }
                      placeholder="قیمت"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>توضیحات</Label>
                    <Textarea
                      value={product.description}
                      onChange={(e) => updateProduct(index, "description", e.target.value)}
                      placeholder="توضیحات محصول"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>آدرس تصویر</Label>
                    <Input
                      value={product.image_url}
                      onChange={(e) => updateProduct(index, "image_url", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>متن دکمه</Label>
                    <Input
                      value={product.button_text}
                      onChange={(e) => updateProduct(index, "button_text", e.target.value)}
                      placeholder="خرید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>آدرس محصول</Label>
                    <Input
                      value={product.product_url}
                      onChange={(e) => updateProduct(index, "product_url", e.target.value)}
                      placeholder="https://shop.example.com/product"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => removeProduct(index)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {products.length > 0 && (
            <Button onClick={saveProducts}>
              <Save className="w-4 h-4 mr-2" />
              ذخیره محصولات
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
