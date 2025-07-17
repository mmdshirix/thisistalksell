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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Palette, MessageSquare, Settings, Globe } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const chatbotSettingsSchema = z.object({
  name: z.string().min(1, "نام چت‌بات الزامی است"),
  welcome_message: z.string().min(1, "پیام خوش‌آمدگویی الزامی است"),
  navigation_message: z.string().min(1, "پیام راهنمایی الزامی است"),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "رنگ اصلی باید در فرمت هگز باشد"),
  text_color: z.string().regex(/^#[0-9A-F]{6}$/i, "رنگ متن باید در فرمت هگز باشد"),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i, "رنگ پس‌زمینه باید در فرمت هگز باشد"),
  chat_icon: z.string().min(1, "آیکون چت الزامی است"),
  position: z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]),
  margin_x: z.number().min(0).max(100),
  margin_y: z.number().min(0).max(100),
  deepseek_api_key: z.string().optional(),
  knowledge_base_text: z.string().optional(),
  knowledge_base_url: z.string().url().optional().or(z.literal("")),
  store_url: z.string().url().optional().or(z.literal("")),
  ai_url: z.string().url().optional().or(z.literal("")),
  stats_multiplier: z.number().min(0.1).max(10),
})

type ChatbotSettingsFormData = z.infer<typeof chatbotSettingsSchema>

interface ChatbotSettingsFormProps {
  chatbot?: any
  onSubmit: (data: ChatbotSettingsFormData) => Promise<void>
  isLoading?: boolean
}

export function ChatbotSettingsForm({ chatbot, onSubmit, isLoading = false }: ChatbotSettingsFormProps) {
  const [activeTab, setActiveTab] = useState("basic")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChatbotSettingsFormData>({
    resolver: zodResolver(chatbotSettingsSchema),
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
      stats_multiplier: chatbot?.stats_multiplier || 1.0,
    },
  })

  const watchedValues = watch()

  const handleFormSubmit = async (data: ChatbotSettingsFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تنظیمات چت‌بات</h1>
          <p className="text-muted-foreground">پیکربندی و شخصی‌سازی چت‌بات خود</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {chatbot ? "ویرایش" : "جدید"}
        </Badge>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              اصلی
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              ظاهری
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              پیام‌ها
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              پیشرفته
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات پایه</CardTitle>
                <CardDescription>تنظیمات اصلی چت‌بات شما</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">نام چت‌بات *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="نام چت‌بات خود را وارد کنید"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chat_icon">آیکون چت *</Label>
                    <Input
                      id="chat_icon"
                      {...register("chat_icon")}
                      placeholder="💬"
                      className={errors.chat_icon ? "border-red-500" : ""}
                    />
                    {errors.chat_icon && <p className="text-sm text-red-500">{errors.chat_icon.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deepseek_api_key">کلید API DeepSeek</Label>
                  <Input
                    id="deepseek_api_key"
                    type="password"
                    {...register("deepseek_api_key")}
                    placeholder="کلید API خود را وارد کنید (اختیاری)"
                  />
                  <p className="text-sm text-muted-foreground">
                    در صورت عدم وارد کردن، از کلید پیش‌فرض سیستم استفاده می‌شود
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stats_multiplier">ضریب آمار</Label>
                  <Input
                    id="stats_multiplier"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    {...register("stats_multiplier", { valueAsNumber: true })}
                    placeholder="1.0"
                  />
                  <p className="text-sm text-muted-foreground">ضریب نمایش آمار (برای تست و نمایش)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات ظاهری</CardTitle>
                <CardDescription>رنگ‌ها و موقعیت چت‌بات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">رنگ اصلی</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        {...register("primary_color")}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input {...register("primary_color")} placeholder="#14b8a6" className="flex-1" />
                    </div>
                    {errors.primary_color && <p className="text-sm text-red-500">{errors.primary_color.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_color">رنگ متن</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="text_color"
                        type="color"
                        {...register("text_color")}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input {...register("text_color")} placeholder="#ffffff" className="flex-1" />
                    </div>
                    {errors.text_color && <p className="text-sm text-red-500">{errors.text_color.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="background_color"
                        type="color"
                        {...register("background_color")}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input {...register("background_color")} placeholder="#f3f4f6" className="flex-1" />
                    </div>
                    {errors.background_color && (
                      <p className="text-sm text-red-500">{errors.background_color.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">موقعیت چت‌بات</Label>
                    <Select
                      value={watchedValues.position}
                      onValueChange={(value) => setValue("position", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="موقعیت را انتخاب کنید" />
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
                    <Label htmlFor="margin_x">فاصله افقی (px)</Label>
                    <Input
                      id="margin_x"
                      type="number"
                      min="0"
                      max="100"
                      {...register("margin_x", { valueAsNumber: true })}
                      placeholder="20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="margin_y">فاصله عمودی (px)</Label>
                    <Input
                      id="margin_y"
                      type="number"
                      min="0"
                      max="100"
                      {...register("margin_y", { valueAsNumber: true })}
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">پیش‌نمایش رنگ‌ها</h4>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full border-2"
                      style={{ backgroundColor: watchedValues.primary_color }}
                    />
                    <div
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: watchedValues.primary_color,
                        color: watchedValues.text_color,
                      }}
                    >
                      نمونه متن
                    </div>
                    <div
                      className="px-4 py-2 rounded text-sm border"
                      style={{ backgroundColor: watchedValues.background_color }}
                    >
                      پس‌زمینه
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>پیام‌های چت‌بات</CardTitle>
                <CardDescription>متن‌های نمایشی چت‌بات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome_message">پیام خوش‌آمدگویی *</Label>
                  <Textarea
                    id="welcome_message"
                    {...register("welcome_message")}
                    placeholder="سلام! چطور می‌توانم به شما کمک کنم؟"
                    rows={3}
                    className={errors.welcome_message ? "border-red-500" : ""}
                  />
                  {errors.welcome_message && <p className="text-sm text-red-500">{errors.welcome_message.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="navigation_message">پیام راهنمایی *</Label>
                  <Textarea
                    id="navigation_message"
                    {...register("navigation_message")}
                    placeholder="چه چیزی شما را به اینجا آورده است؟"
                    rows={3}
                    className={errors.navigation_message ? "border-red-500" : ""}
                  />
                  {errors.navigation_message && (
                    <p className="text-sm text-red-500">{errors.navigation_message.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="knowledge_base_text">دانش پایه (متن)</Label>
                  <Textarea
                    id="knowledge_base_text"
                    {...register("knowledge_base_text")}
                    placeholder="اطلاعات و دانش مربوط به کسب‌وکار شما..."
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    اطلاعاتی که می‌خواهید چت‌بات در پاسخ‌هایش از آن استفاده کند
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات پیشرفته</CardTitle>
                <CardDescription>لینک‌ها و تنظیمات اضافی</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_url">آدرس فروشگاه</Label>
                  <Input
                    id="store_url"
                    type="url"
                    {...register("store_url")}
                    placeholder="https://example.com"
                    className={errors.store_url ? "border-red-500" : ""}
                  />
                  {errors.store_url && <p className="text-sm text-red-500">{errors.store_url.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="knowledge_base_url">آدرس دانش پایه</Label>
                  <Input
                    id="knowledge_base_url"
                    type="url"
                    {...register("knowledge_base_url")}
                    placeholder="https://example.com/knowledge"
                    className={errors.knowledge_base_url ? "border-red-500" : ""}
                  />
                  {errors.knowledge_base_url && (
                    <p className="text-sm text-red-500">{errors.knowledge_base_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai_url">آدرس AI سفارشی</Label>
                  <Input
                    id="ai_url"
                    type="url"
                    {...register("ai_url")}
                    placeholder="https://api.example.com/ai"
                    className={errors.ai_url ? "border-red-500" : ""}
                  />
                  {errors.ai_url && <p className="text-sm text-red-500">{errors.ai_url.message}</p>}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    تنظیمات پیشرفته فقط برای کاربران با تجربه توصیه می‌شود. تغییرات نادرست ممکن است عملکرد چت‌بات را مختل
                    کند.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">تمام فیلدهای ستاره‌دار (*) الزامی هستند</div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" disabled={isSubmitting || isLoading}>
              لغو
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? "در حال ذخیره..." : chatbot ? "بروزرسانی" : "ایجاد چت‌بات"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
