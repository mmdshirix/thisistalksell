"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Save, Eye, Settings, Palette, MessageSquare, Package, HelpCircle } from "lucide-react"
import { toast } from "sonner"

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
})

type ChatbotFormData = z.infer<typeof chatbotSchema>

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

interface ChatbotSettingsFormProps {
  chatbot?: any
  onSave?: (data: any) => void
  onPreview?: () => void
}

export default function ChatbotSettingsForm({ chatbot, onSave, onPreview }: ChatbotSettingsFormProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(chatbot?.faqs || [])
  const [products, setProducts] = useState<Product[]>(chatbot?.products || [])
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChatbotFormData>({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      name: chatbot?.name || "",
      welcome_message: chatbot?.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
      navigation_message: chatbot?.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
      primary_color: chatbot?.primary_color || "#14b8a6",
      text_color: chatbot?.text_color || "#ffffff",
      background_color: chatbot?.background_color || "#f3f4f6",
      chat_icon: chatbot?.chat_icon || "💬",
      position: chatbot?.position || "bottom-right",
      margin_x: chatbot?.margin_x || 20,
      margin_y: chatbot?.margin_y || 20,
      deepseek_api_key: chatbot?.deepseek_api_key || "",
      knowledge_base_text: chatbot?.knowledge_base_text || "",
      knowledge_base_url: chatbot?.knowledge_base_url || "",
      store_url: chatbot?.store_url || "",
      ai_url: chatbot?.ai_url || "",
    },
  })

  const watchedValues = watch()

  const addFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "", emoji: "❓" }])
  }

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const updatedFaqs = [...faqs]
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value }
    setFaqs(updatedFaqs)
  }

  const addProduct = () => {
    setProducts([
      ...products,
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
    setProducts(products.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, field: keyof Product, value: string | number | null) => {
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], [field]: value }
    setProducts(updatedProducts)
  }

  const onSubmit = async (data: ChatbotFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        faqs,
        products,
      }

      if (onSave) {
        await onSave(payload)
        toast.success("تنظیمات با موفقیت ذخیره شد")
      }
    } catch (error) {
      toast.error("خطا در ذخیره تنظیمات")
      console.error("Error saving chatbot:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تنظیمات چت‌بات</h1>
          <p className="text-muted-foreground">چت‌بات خود را شخصی‌سازی کنید</p>
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <Button variant="outline" onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2" />
              پیش‌نمایش
            </Button>
          )}
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">
              <Settings className="w-4 h-4 mr-2" />
              عمومی
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="w-4 h-4 mr-2" />
              ظاهر
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              پیام‌ها
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

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات عمومی</CardTitle>
                <CardDescription>تنظیمات اصلی چت‌بات را مشخص کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">نام چت‌بات</Label>
                  <Input id="name" {...register("name")} placeholder="نام چت‌بات خود را وارد کنید" />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="deepseek_api_key">کلید API DeepSeek (اختیاری)</Label>
                  <Input id="deepseek_api_key" type="password" {...register("deepseek_api_key")} placeholder="sk-..." />
                  <p className="text-sm text-muted-foreground mt-1">
                    برای فعال‌سازی پاسخگویی هوشمند، کلید API خود را وارد کنید
                  </p>
                </div>

                <div>
                  <Label htmlFor="knowledge_base_text">دانش پایه (متن)</Label>
                  <Textarea
                    id="knowledge_base_text"
                    {...register("knowledge_base_text")}
                    placeholder="اطلاعات مربوط به کسب‌وکار خود را اینجا وارد کنید..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="knowledge_base_url">لینک دانش پایه</Label>
                    <Input
                      id="knowledge_base_url"
                      {...register("knowledge_base_url")}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="store_url">لینک فروشگاه</Label>
                    <Input id="store_url" {...register("store_url")} placeholder="https://shop.example.com" />
                  </div>
                  <div>
                    <Label htmlFor="ai_url">لینک هوش مصنوعی</Label>
                    <Input id="ai_url" {...register("ai_url")} placeholder="https://ai.example.com" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات ظاهری</CardTitle>
                <CardDescription>ظاهر چت‌بات را شخصی‌سازی کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary_color">رنگ اصلی</Label>
                    <div className="flex gap-2">
                      <Input id="primary_color" type="color" {...register("primary_color")} className="w-16 h-10 p-1" />
                      <Input {...register("primary_color")} placeholder="#14b8a6" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="text_color">رنگ متن</Label>
                    <div className="flex gap-2">
                      <Input id="text_color" type="color" {...register("text_color")} className="w-16 h-10 p-1" />
                      <Input {...register("text_color")} placeholder="#ffffff" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background_color"
                        type="color"
                        {...register("background_color")}
                        className="w-16 h-10 p-1"
                      />
                      <Input {...register("background_color")} placeholder="#f3f4f6" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="chat_icon">آیکون چت</Label>
                    <Input id="chat_icon" {...register("chat_icon")} placeholder="💬" />
                  </div>
                  <div>
                    <Label htmlFor="position">موقعیت</Label>
                    <Select
                      value={watchedValues.position}
                      onValueChange={(value) => setValue("position", value as any)}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="margin_x">فاصله افقی (px)</Label>
                    <Input
                      id="margin_x"
                      type="number"
                      {...register("margin_x", { valueAsNumber: true })}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin_y">فاصله عمودی (px)</Label>
                    <Input
                      id="margin_y"
                      type="number"
                      {...register("margin_y", { valueAsNumber: true })}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>پیام‌های چت‌بات</CardTitle>
                <CardDescription>پیام‌های نمایشی چت‌بات را تنظیم کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="welcome_message">پیام خوش‌آمدگویی</Label>
                  <Textarea
                    id="welcome_message"
                    {...register("welcome_message")}
                    placeholder="سلام! چطور می‌توانم به شما کمک کنم؟"
                    rows={3}
                  />
                  {errors.welcome_message && (
                    <p className="text-sm text-red-500 mt-1">{errors.welcome_message.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="navigation_message">پیام راهنمایی</Label>
                  <Textarea
                    id="navigation_message"
                    {...register("navigation_message")}
                    placeholder="چه چیزی شما را به اینجا آورده است؟"
                    rows={3}
                  />
                  {errors.navigation_message && (
                    <p className="text-sm text-red-500 mt-1">{errors.navigation_message.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faqs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  سوالات متداول
                  <Button type="button" onClick={addFAQ} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    افزودن سوال
                  </Button>
                </CardTitle>
                <CardDescription>سوالات متداول را برای پاسخگویی سریع‌تر اضافه کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">سوال {index + 1}</Badge>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeFAQ(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
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
                      <div className="md:col-span-6">
                        <Label>پاسخ</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                          placeholder="پاسخ را وارد کنید"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {faqs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>هنوز سوالی اضافه نشده است</p>
                    <Button type="button" onClick={addFAQ} className="mt-2">
                      اولین سوال را اضافه کنید
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  محصولات
                  <Button type="button" onClick={addProduct} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    افزودن محصول
                  </Button>
                </CardTitle>
                <CardDescription>محصولات خود را برای نمایش در چت‌بات اضافه کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.map((product, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">محصول {index + 1}</Badge>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeProduct(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>نام محصول</Label>
                        <Input
                          value={product.name}
                          onChange={(e) => updateProduct(index, "name", e.target.value)}
                          placeholder="نام محصول"
                        />
                      </div>
                      <div>
                        <Label>قیمت</Label>
                        <Input
                          type="number"
                          value={product.price || ""}
                          onChange={(e) =>
                            updateProduct(index, "price", e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder="قیمت (تومان)"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>لینک تصویر</Label>
                        <Input
                          value={product.image_url}
                          onChange={(e) => updateProduct(index, "image_url", e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <Label>لینک محصول</Label>
                        <Input
                          value={product.product_url}
                          onChange={(e) => updateProduct(index, "product_url", e.target.value)}
                          placeholder="https://example.com/product"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>متن دکمه اصلی</Label>
                        <Input
                          value={product.button_text}
                          onChange={(e) => updateProduct(index, "button_text", e.target.value)}
                          placeholder="خرید"
                        />
                      </div>
                      <div>
                        <Label>متن دکمه فرعی</Label>
                        <Input
                          value={product.secondary_text}
                          onChange={(e) => updateProduct(index, "secondary_text", e.target.value)}
                          placeholder="جزئیات"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>هنوز محصولی اضافه نشده است</p>
                    <Button type="button" onClick={addProduct} className="mt-2">
                      اولین محصول را اضافه کنید
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
