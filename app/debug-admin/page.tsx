"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugAdmin() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string | null>(null)

  const runTest = async (testName: string, url: string) => {
    setLoading(testName)
    try {
      console.log(`🧪 Running test: ${testName}`)
      const response = await fetch(url)
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: response.ok,
          status: response.status,
          data: data,
          timestamp: new Date().toISOString(),
        },
      }))

      console.log(`✅ Test ${testName} completed:`, { status: response.status, data })
    } catch (error) {
      console.error(`❌ Test ${testName} failed:`, error)
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          error: error instanceof Error ? error.message : "خطای نامشخص",
          timestamp: new Date().toISOString(),
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const tests = [
    {
      name: "Simple Test",
      url: "/api/admin-panel/1/test-simple",
      description: "تست ساده بدون دیتابیس",
    },
    {
      name: "Database Test",
      url: "/api/admin-panel/1/data",
      description: "تست کامل با دیتابیس",
    },
    {
      name: "Chatbot API",
      url: "/api/chatbots/1",
      description: "تست API چت‌بات",
    },
    {
      name: "Database Connection",
      url: "/api/database/test",
      description: "تست اتصال دیتابیس",
    },
  ]

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">🔧 عیب‌یابی پنل ادمین</h1>
        <p className="text-gray-600">تست‌های مختلف برای تشخیص مشکل</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => (
          <Card key={test.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {test.name}
                <Button onClick={() => runTest(test.name, test.url)} disabled={loading === test.name} size="sm">
                  {loading === test.name ? "در حال تست..." : "اجرا"}
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600">{test.description}</p>
            </CardHeader>
            <CardContent>
              {results[test.name] && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={results[test.name].success ? "default" : "destructive"}>
                      {results[test.name].success ? "موفق" : "ناموفق"}
                    </Badge>
                    {results[test.name].status && <Badge variant="outline">HTTP {results[test.name].status}</Badge>}
                  </div>

                  {results[test.name].error && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-red-700 text-sm">{results[test.name].error}</p>
                    </div>
                  )}

                  {results[test.name].data && (
                    <details className="bg-gray-50 border rounded p-2">
                      <summary className="cursor-pointer text-sm font-medium">نمایش جزئیات</summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-40">
                        {JSON.stringify(results[test.name].data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 تست سریع پنل ادمین</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => window.open("/admin-panel/1", "_blank")} variant="outline">
              باز کردن پنل ادمین (چت‌بات 1)
            </Button>
            <Button onClick={() => window.open("/admin-panel/2", "_blank")} variant="outline">
              باز کردن پنل ادمین (چت‌بات 2)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 راهنمای عیب‌یابی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>1. Simple Test:</strong> اگر این تست موفق باشد، مشکل از دیتابیس است
            </p>
            <p>
              <strong>2. Database Test:</strong> اگر این تست ناموفق باشد، مشکل از اتصال دیتابیس است
            </p>
            <p>
              <strong>3. Chatbot API:</strong> تست API اصلی چت‌بات
            </p>
            <p>
              <strong>4. Database Connection:</strong> تست مستقیم اتصال دیتابیس
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
