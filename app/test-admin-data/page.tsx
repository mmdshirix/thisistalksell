"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAdminData() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testData = async (chatbotId: number) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🧪 Testing data for chatbot ${chatbotId}`)
      const response = await fetch(`/api/admin-panel/${chatbotId}/data`)
      const data = await response.json()

      setResult(data)
      console.log("✅ Test result:", data)
    } catch (err) {
      console.error("❌ Test error:", err)
      setError(err instanceof Error ? err.message : "خطای نامشخص")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">تست داده‌های پنل ادمین</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button onClick={() => testData(1)} disabled={loading}>
          تست داده‌های چت‌بات 1
        </Button>
        <Button onClick={() => testData(2)} disabled={loading}>
          تست داده‌های چت‌بات 2
        </Button>
        <Button onClick={() => testData(14)} disabled={loading}>
          تست داده‌های چت‌بات 14
        </Button>
      </div>

      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4">در حال دریافت داده‌ها...</p>
        </div>
      )}

      {error && (
        <Card className="mb-8 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">خطا در دریافت داده‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-red-100 p-4 rounded text-red-900 overflow-auto">{error}</pre>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>نتیجه تست</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-bold mb-2">اطلاعات چت‌بات:</h3>
                <p>شناسه: {result.chatbot?.id}</p>
                <p>نام: {result.chatbot?.name}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">آمار:</h3>
                <p>کل پیام‌ها: {result.stats?.totalMessages}</p>
                <p>کاربران منحصر به فرد: {result.stats?.uniqueUsers}</p>
                <p>پیام‌های امروز: {result.stats?.todayMessages}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-bold mb-2">پیام‌ها ({result.messages?.length}):</h3>
              {result.messages?.slice(0, 3).map((msg, i) => (
                <div key={i} className="border-l-2 border-blue-500 pl-2 mb-2">
                  <p className="text-sm">کاربر: {msg.user_message}</p>
                  <p className="text-sm text-green-700">ربات: {msg.bot_response?.substring(0, 50)}...</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="font-bold mb-2">تیکت‌ها ({result.tickets?.length}):</h3>
              {result.tickets?.slice(0, 3).map((ticket, i) => (
                <div key={i} className="border-l-2 border-orange-500 pl-2 mb-2">
                  <p className="text-sm font-medium">{ticket.subject}</p>
                  <p className="text-sm">{ticket.message?.substring(0, 50)}...</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold mb-2">سوالات پرتکرار ({result.analytics?.topQuestions?.length}):</h3>
              {result.analytics?.topQuestions?.slice(0, 3).map((q, i) => (
                <div key={i} className="border-l-2 border-purple-500 pl-2 mb-2">
                  <p className="text-sm">
                    {q.question} ({q.count} بار)
                  </p>
                </div>
              ))}
            </div>

            <details className="mt-6">
              <summary className="cursor-pointer font-medium">نمایش کامل داده‌ها</summary>
              <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
