"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, AlertTriangle, CheckCircle } from "lucide-react"

export default function DatabaseSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/database/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message || "دیتابیس با موفقیت راه‌اندازی شد" })
      } else {
        setError(data.details || data.error || "خطای نامشخص")
      }
    } catch (err) {
      setError("خطا در اتصال به سرور")
      console.error("Setup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <Database className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <CardTitle className="text-2xl">راه‌اندازی و بازسازی دیتابیس</CardTitle>
          <CardDescription>این عملیات تمام جداول دیتابیس را حذف کرده و دوباره با ساختار صحیح می‌سازد.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>هشدار:</strong> این عملیات تمام داده‌های موجود در دیتابیس را حذف می‌کند. اگر داده‌های مهمی دارید،
              ابتدا از آن‌ها پشتیبان تهیه کنید.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button onClick={handleSetup} disabled={isLoading} size="lg" className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  در حال بازسازی دیتابیس...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  شروع بازسازی کامل دیتابیس
                </>
              )}
            </Button>
          </div>

          {result && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>موفقیت:</strong> {result.message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>خطا:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>این عملیات شامل:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>حذف تمام جداول موجود</li>
              <li>ساخت جداول جدید با ساختار صحیح</li>
              <li>تنظیم روابط بین جداول (Foreign Keys)</li>
              <li>ایجاد ایندکس‌های لازم برای بهبود عملکرد</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
