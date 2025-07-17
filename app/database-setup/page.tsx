"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertTriangle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DatabaseSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleInitialize = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch("/api/database/init", {
        method: "POST",
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Database className="w-6 h-6" />
            بازسازی کامل دیتابیس
          </CardTitle>
          <CardDescription>این عملیات تمام جداول را حذف کرده و دوباره با ساختار صحیح می‌سازد.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
            <p className="text-sm text-yellow-800 font-medium">⚠️ هشدار مهم:</p>
            <p className="text-sm text-yellow-700 mt-1">
              این عملیات تمام داده‌های موجود در دیتابیس (چت‌بات‌ها، پیام‌ها، تیکت‌ها و غیره) را حذف می‌کند و دیتابیس را از صفر
              می‌سازد.
            </p>
          </div>

          <p className="text-sm text-center text-gray-600">
            اگر با خطاهای مربوط به ساختار دیتابیس مواجه شده‌اید، این دکمه را فشار دهید تا مشکل به طور کامل حل شود.
          </p>

          <Button
            onClick={handleInitialize}
            disabled={loading}
            className="w-full"
            variant={result?.success ? "default" : "destructive"}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال بازسازی دیتابیس...
              </>
            ) : (
              "شروع بازسازی کامل دیتابیس"
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="w-full">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "موفقیت‌آمیز" : "خطا"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {result?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
              <p className="text-sm text-green-800 font-medium">✅ دیتابیس آماده است!</p>
              <p className="text-sm text-green-700 mt-1">
                حالا می‌توانید چت‌بات جدید بسازید و از تمام قابلیت‌های برنامه استفاده کنید.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
