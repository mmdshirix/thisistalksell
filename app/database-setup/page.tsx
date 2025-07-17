"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
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
          <CardTitle className="text-2xl">راه‌اندازی و به‌روزرسانی دیتابیس</CardTitle>
          <CardDescription>این عملیات جداول مورد نیاز برنامه را ایجاد یا به‌روزرسانی می‌کند.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-sm text-center text-gray-600">
            اگر برای اولین بار است که برنامه را اجرا می‌کنید یا پس از آپدیت کردن کد با خطا مواجه شده‌اید، این دکمه را فشار
            دهید. این عملیات داده‌های شما را حذف **نمی‌کند**.
          </p>
          <Button onClick={handleInitialize} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال اجرای عملیات...
              </>
            ) : (
              "شروع راه‌اندازی / به‌روزرسانی"
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="w-full">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "موفقیت‌آمیز" : "خطا"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
