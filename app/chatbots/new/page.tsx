"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewChatbotPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    welcome_message: "سلام! چطور می‌توانم به شما کمک کنم؟",
    primary_color: "#14b8a6",
    // No need to send all fields, API and DB will use defaults
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chatbots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const chatbot = await response.json()
        router.push(`/chatbots/${chatbot.id}`)
      } else {
        const errorData = await response.json()
        console.error("Error creating chatbot:", errorData)
        setError(errorData.error || "خطا در ایجاد چت‌بات. لطفاً دوباره تلاش کنید.")
      }
    } catch (err) {
      console.error("Network or unexpected error:", err)
      setError("یک خطای پیش‌بینی نشده رخ داد. اتصال اینترنت خود را بررسی کنید.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <MessageSquare className="h-8 w-8 text-teal-600 ml-3" />
              <h1 className="text-2xl font-bold text-gray-900">چت‌بات ساز</h1>
            </Link>
            <Button asChild variant="ghost">
              <Link href="/chatbots">
                بازگشت به لیست
                <ArrowRight className="h-4 w-4 mr-2" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ساخت چت‌بات جدید</h1>
          <p className="text-gray-600">اطلاعات اولیه چت‌بات خود را برای شروع وارد کنید.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات پایه</CardTitle>
            <CardDescription>این اطلاعات بعداً به راحتی قابل تغییر هستند.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>خطا</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="name">نام چت‌بات *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="مثال: پشتیبان فروشگاه آنلاین"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="welcome_message">پیام خوش‌آمدگویی</Label>
                <Textarea
                  id="welcome_message"
                  name="welcome_message"
                  value={formData.welcome_message}
                  onChange={handleInputChange}
                  placeholder="پیامی که کاربران در ابتدای مکالمه می‌بینند"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="primary_color">رنگ اصلی</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    id="primary_color"
                    name="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={handleInputChange}
                    className="p-1 h-10 w-14 block bg-white border border-gray-300 rounded-md cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.primary_color}
                    onChange={handleInputChange}
                    name="primary_color"
                    placeholder="#14b8a6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button asChild type="button" variant="outline">
                  <Link href="/chatbots">انصراف</Link>
                </Button>
                <Button type="submit" disabled={loading || !formData.name.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      در حال ایجاد...
                    </>
                  ) : (
                    "ایجاد چت‌بات"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
