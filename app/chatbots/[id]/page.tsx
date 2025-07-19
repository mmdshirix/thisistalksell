"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Eye, Settings, MessageSquare, Code, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Define a comprehensive type for the chatbot settings
type ChatbotSettings = {
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
}

export default function ChatbotSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const chatbotId = params.id as string

  const [settings, setSettings] = useState<Partial<ChatbotSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`)
      const result = await response.json()
      if (result.success) {
        setSettings(result.data)
      } else {
        toast.error(result.message || "Failed to load chatbot settings.")
        router.push("/")
      }
    } catch (err) {
      toast.error("An error occurred while fetching settings.")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [chatbotId, router])

  useEffect(() => {
    if (chatbotId) {
      fetchSettings()
    }
  }, [chatbotId, fetchSettings])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const result = await response.json()
      if (result.success) {
        toast.success("تنظیمات با موفقیت ذخیره شد.")
        setSettings(result.data) // Update state with returned data
      } else {
        throw new Error(result.message || "Failed to save settings.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setSaving(false)
    }
  }

  const embedCode = `<script src="${
    typeof window !== "undefined" ? window.location.origin : ""
  }/widget-loader.js" data-chatbot-id="${chatbotId}" async></script>`

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{settings.name}</h1>
                <p className="text-sm text-gray-500">مدیریت و تنظیمات چت‌بات</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/chatbots/${chatbotId}/preview`} target="_blank">
                  <Eye className="ml-2 h-4 w-4" />
                  پیش‌نمایش
                </Link>
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                ذخیره تغییرات
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              <Settings className="ml-2 h-4 w-4" />
              عمومی و ظاهری
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <MessageSquare className="ml-2 h-4 w-4" />
              دانش و محتوا
            </TabsTrigger>
            <TabsTrigger value="embed">
              <Code className="ml-2 h-4 w-4" />
              نصب و امبد
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات عمومی و ظاهری</CardTitle>
                <CardDescription>اطلاعات پایه و ظاهر چت‌بات خود را سفارشی کنید.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">نام چت‌بات</Label>
                    <Input id="name" name="name" value={settings.name || ""} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="chat_icon">آیکون چت (Emoji)</Label>
                    <Input
                      id="chat_icon"
                      name="chat_icon"
                      value={settings.chat_icon || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="primary_color">رنگ اصلی</Label>
                    <Input
                      id="primary_color"
                      name="primary_color"
                      type="color"
                      value={settings.primary_color || "#14b8a6"}
                      onChange={handleInputChange}
                      className="p-1 h-10 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="text_color">رنگ متن</Label>
                    <Input
                      id="text_color"
                      name="text_color"
                      type="color"
                      value={settings.text_color || "#FFFFFF"}
                      onChange={handleInputChange}
                      className="p-1 h-10 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="background_color">رنگ پس‌زمینه</Label>
                    <Input
                      id="background_color"
                      name="background_color"
                      type="color"
                      value={settings.background_color || "#F3F4F6"}
                      onChange={handleInputChange}
                      className="p-1 h-10 w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>دانش و محتوا</CardTitle>
                <CardDescription>پیام‌ها و دانش پایه چت‌بات را مدیریت کنید.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label htmlFor="welcome_message">پیام خوش‌آمدگویی</Label>
                  <Textarea
                    id="welcome_message"
                    name="welcome_message"
                    value={settings.welcome_message || ""}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="navigation_message">پیام راهنمایی اولیه</Label>
                  <Textarea
                    id="navigation_message"
                    name="navigation_message"
                    value={settings.navigation_message || ""}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="knowledge_base_text">دانش پایه (متن)</Label>
                  <Textarea
                    id="knowledge_base_text"
                    name="knowledge_base_text"
                    value={settings.knowledge_base_text || ""}
                    onChange={handleInputChange}
                    placeholder="اطلاعات کلی در مورد کسب و کار، محصولات و خدمات خود را اینجا وارد کنید..."
                    rows={8}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>نصب چت‌بات</CardTitle>
                <CardDescription>
                  این کد را کپی کرده و قبل از تگ `&lt;/body&gt;` در وب‌سایت خود قرار دهید.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm relative">
                  <pre>{embedCode}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 left-2 text-white hover:bg-gray-700"
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode)
                      toast.success("کد با موفقیت کپی شد!")
                    }}
                  >
                    کپی
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
