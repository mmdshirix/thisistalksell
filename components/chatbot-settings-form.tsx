"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Save, Palette, MessageSquare, Settings } from "lucide-react"

interface ChatbotSettingsFormProps {
  chatbot: {
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
  onSave: (data: any) => Promise<void>
}

export default function ChatbotSettingsForm({ chatbot, onSave }: ChatbotSettingsFormProps) {
  const [formData, setFormData] = useState(chatbot)
  const [saving, setSaving] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave(formData)
      toast.success("تنظیمات با موفقیت ذخیره شد")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="general" className="space-y-4">
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
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="نام چت‌بات را وارد کنید"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="chat_icon">آیکون چت</Label>
                  <Input
                    id="chat_icon"
                    value={formData.chat_icon}
                    onChange={(e) => handleInputChange("chat_icon", e.target.value)}
                    placeholder="💬"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="knowledge_base_text">دانش پایه</Label>
                <Textarea
                  id="knowledge_base_text"
                  value={formData.knowledge_base_text || ""}
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
                    value={formData.store_url || ""}
                    onChange={(e) => handleInputChange("store_url", e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="deepseek_api_key">
                    کلید API DeepSeek
                    <Badge variant="secondary" className="mr-2">
                      اختیاری
                    </Badge>
                  </Label>
                  <Input
                    id="deepseek_api_key"
                    type="password"
                    value={formData.deepseek_api_key || ""}
                    onChange={(e) => handleInputChange("deepseek_api_key", e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stats_multiplier">ضریب آمار</Label>
                <Input
                  id="stats_multiplier"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={formData.stats_multiplier}
                  onChange={(e) => handleInputChange("stats_multiplier", Number.parseFloat(e.target.value))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  برای نمایش آمار بیشتر از واقعیت استفاده می‌شود (پیش‌فرض: 1.0)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات ظاهری</CardTitle>
              <CardDescription>رنگ‌ها و موقعیت چت‌بات را تنظیم کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
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
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
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
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
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
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="position">موقعیت</Label>
                  <select
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="bottom-right">پایین راست</option>
                    <option value="bottom-left">پایین چپ</option>
                    <option value="top-right">بالا راست</option>
                    <option value="top-left">بالا چپ</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="margin_x">فاصله افقی (px)</Label>
                  <Input
                    id="margin_x"
                    type="number"
                    value={formData.margin_x}
                    onChange={(e) => handleInputChange("margin_x", Number.parseInt(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="margin_y">فاصله عمودی (px)</Label>
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
                  value={formData.welcome_message}
                  onChange={(e) => handleInputChange("welcome_message", e.target.value)}
                  placeholder="سلام! چطور می‌توانم به شما کمک کنم؟"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">این پیام هنگام باز شدن چت‌بات نمایش داده می‌شود</p>
              </div>

              <div>
                <Label htmlFor="navigation_message">پیام راهنمایی</Label>
                <Textarea
                  id="navigation_message"
                  value={formData.navigation_message}
                  onChange={(e) => handleInputChange("navigation_message", e.target.value)}
                  placeholder="چه چیزی شما را به اینجا آورده است؟"
                  rows={2}
                />
                <p className="text-sm text-muted-foreground mt-1">این پیام برای راهنمایی کاربر نمایش داده می‌شود</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  )
}
