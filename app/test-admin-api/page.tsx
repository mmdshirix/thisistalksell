"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAdminAPI() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAPI = async (chatbotId: number) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log(`🔄 Testing API for chatbot ${chatbotId}`)
      const response = await fetch(`/api/admin-panel/${chatbotId}/data`)

      console.log(`📡 Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData, null, 2))
      }

      const data = await response.json()
      console.log(`✅ API Response:`, data)
      setResult(data)
    } catch (err) {
      console.error(`❌ API Error:`, err)
      setError(err instanceof Error ? err.message : "خطای نامشخص")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 تست API پنل ادمین</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => testAPI(1)} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "در حال تست..." : "تست چت‌بات 1"}
            </Button>
            <Button onClick={() => testAPI(2)} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "در حال تست..." : "تست چت‌بات 2"}
            </Button>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">❌ خطا</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-auto">{error}</pre>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">✅ نتیجه موفق</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">نام چت‌بات</div>
                      <div className="font-bold">{result.chatbot?.name}</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">کل پیام‌ها</div>
                      <div className="font-bold">{result.stats?.totalMessages}</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">کاربران منحصر به فرد</div>
                      <div className="font-bold">{result.stats?.uniqueUsers}</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">پیام‌های امروز</div>
                      <div className="font-bold">{result.stats?.todayMessages}</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded border">
                    <h3 className="font-bold mb-2">📊 آمار روزانه</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {result.analytics?.dailyData?.map((day: any, index: number) => (
                        <div key={index} className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600">{day.name}</div>
                          <div className="font-bold">{day.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded border">
                    <h3 className="font-bold mb-2">💬 آخرین پیام‌ها</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.messages?.slice(0, 3).map((msg: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium">کاربر: {msg.user_message}</div>
                          <div className="text-gray-600">پاسخ: {msg.bot_response}</div>
                          <div className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString("fa-IR")}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <details className="bg-white p-4 rounded border">
                    <summary className="font-bold cursor-pointer">🔍 داده‌های کامل JSON</summary>
                    <pre className="text-xs mt-2 overflow-auto max-h-60 bg-gray-100 p-2 rounded">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
