"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function NewChatbotPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("نام چت‌بات نمی‌تواند خالی باشد.")
      return
    }
    setLoading(true)

    try {
      const response = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("چت‌بات با موفقیت ایجاد شد!")
        router.push(`/chatbots/${result.data.id}`)
      } else {
        throw new Error(result.message || "خطا در ایجاد چت‌بات")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "یک خطای پیش‌بینی نشده رخ داد.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ساخت چت‌بات جدید</CardTitle>
          <CardDescription>فقط یک نام برای شروع کافیست. بقیه تنظیمات بعداً قابل تغییر است.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">نام چت‌بات</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: پشتیبان فروشگاه آنلاین"
                className="mt-1"
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button asChild type="button" variant="ghost">
                <Link href="/">انصراف</Link>
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    در حال ایجاد...
                  </>
                ) : (
                  "ایجاد و ادامه"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
