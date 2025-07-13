"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, RefreshCw, Database, Settings, MessageSquare } from "lucide-react"

interface DebugInfo {
  database: {
    connected: boolean
    url: string | null
    error: string | null
  }
  tables: {
    chatbots: boolean
    chatbot_faqs: boolean
    chatbot_products: boolean
    chatbot_messages: boolean
    chatbot_options: boolean
  }
  data: {
    chatbots: any[]
    sampleChatbot: any | null
  }
  apis: {
    getChatbots: boolean
    createChatbot: boolean
    updateChatbot: boolean
    getFaqs: boolean
    getProducts: boolean
  }
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runDiagnostics = async () => {
    setIsLoading(true)
    setLogs([])
    addLog("🔍 شروع تشخیص مشکلات...")

    try {
      // بررسی اتصال دیتابیس
      addLog("📡 بررسی اتصال دیتابیس...")
      const dbResponse = await fetch("/api/database/setup")
      const dbData = await dbResponse.json()

      // بررسی جداول
      addLog("🗃️ بررسی جداول دیتابیس...")
      const tablesResponse = await fetch("/api/database/init")
      const tablesData = await tablesResponse.json()

      // بررسی چت‌بات‌ها
      addLog("🤖 بررسی چت‌بات‌های موجود...")
      const chatbotsResponse = await fetch("/api/chatbots")
      const chatbotsData = await chatbotsResponse.json()

      // تست API های مختلف
      addLog("🔧 تست API های مختلف...")
      const apiTests = {
        getChatbots: chatbotsResponse.ok,
        createChatbot: false,
        updateChatbot: false,
        getFaqs: false,
        getProducts: false,
      }

      // تست ایجاد چت‌بات نمونه
      try {
        const testChatbot = {
          name: "تست چت‌بات " + Date.now(),
          primary_color: "#0066FF",
          welcome_message: "سلام تست",
        }
        const createResponse = await fetch("/api/chatbots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testChatbot),
        })
        apiTests.createChatbot = createResponse.ok

        if (createResponse.ok) {
          const createdBot = await createResponse.json()
          addLog(`✅ چت‌بات تست ایجاد شد: ${createdBot.id}`)

          // تست آپدیت
          const updateResponse = await fetch(`/api/chatbots/${createdBot.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...testChatbot, name: "تست آپدیت شده" }),
          })
          apiTests.updateChatbot = updateResponse.ok

          // تست FAQs
          const faqsResponse = await fetch(`/api/chatbots/${createdBot.id}/faqs`)
          apiTests.getFaqs = faqsResponse.ok

          // تست Products
          const productsResponse = await fetch(`/api/chatbots/${createdBot.id}/products`)
          apiTests.getProducts = productsResponse.ok

          // حذف چت‌بات تست
          await fetch(`/api/chatbots/${createdBot.id}`, { method: "DELETE" })
          addLog("🗑️ چت‌بات تست حذف شد")
        }
      } catch (error) {
        addLog(`❌ خطا در تست API: ${error}`)
      }

      setDebugInfo({
        database: {
          connected: dbData.connected || false,
          url: dbData.url || null,
          error: dbData.error || null,
        },
        tables: {
          chatbots: tablesData.tablesFound >= 1,
          chatbot_faqs: tablesData.tablesFound >= 2,
          chatbot_products: tablesData.tablesFound >= 3,
          chatbot_messages: tablesData.tablesFound >= 4,
          chatbot_options: tablesData.tablesFound >= 5,
        },
        data: {
          chatbots: Array.isArray(chatbotsData) ? chatbotsData : [],
          sampleChatbot: Array.isArray(chatbotsData) && chatbotsData.length > 0 ? chatbotsData[0] : null,
        },
        apis: apiTests,
      })

      addLog("✅ تشخیص کامل شد!")
    } catch (error) {
      addLog(`❌ خطا در تشخیص: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const fixIssues = async () => {
    setIsFixing(true)
    addLog("🔧 شروع رفع مشکلات...")

    try {
      // ایجاد جداول
      addLog("🗃️ ایجاد جداول دیتابیس...")
      const initResponse = await fetch("/api/database/init", { method: "POST" })
      if (initResponse.ok) {
        addLog("✅ جداول ایجاد شدند")
      } else {
        addLog("❌ خطا در ایجاد جداول")
      }

      // ایجاد چت‌بات نمونه
      addLog("🤖 ایجاد چت‌بات نمونه...")
      const sampleChatbot = {
        name: "چت‌بات نمونه",
        primary_color: "#0066FF",
        text_color: "#333333",
        background_color: "#FFFFFF",
        chat_icon: "🤖",
        position: "bottom-right",
        welcome_message: "سلام! به چت‌بات نمونه خوش آمدید",
        navigation_message: "چطور می‌توانم کمکتان کنم؟",
        knowledge_base_text: "این یک چت‌بات نمونه است که برای تست ایجاد شده.",
      }

      const createResponse = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sampleChatbot),
      })

      if (createResponse.ok) {
        const createdBot = await createResponse.json()
        addLog(`✅ چت‌بات نمونه ایجاد شد: ${createdBot.id}`)

        // اضافه کردن FAQs نمونه
        addLog("❓ اضافه کردن سوالات متداول نمونه...")
        const sampleFaqs = [
          { question: "چطور کار می‌کنی؟", answer: "من یک چت‌بات هوشمند هستم", emoji: "🤖", position: 0 },
          { question: "چه کمکی می‌تونی بکنی؟", answer: "می‌توانم به سوالات شما پاسخ دهم", emoji: "❓", position: 1 },
        ]

        const faqsResponse = await fetch(`/api/chatbots/${createdBot.id}/faqs`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sampleFaqs.map((faq) => ({ ...faq, chatbot_id: createdBot.id }))),
        })

        if (faqsResponse.ok) {
          addLog("✅ سوالات متداول اضافه شدند")
        }

        // اضافه کردن محصولات نمونه
        addLog("📦 اضافه کردن محصولات نمونه...")
        const sampleProducts = [
          {
            name: "محصول نمونه 1",
            description: "توضیحات محصول نمونه",
            image_url: "/placeholder.svg?height=200&width=200",
            price: 100000,
            position: 0,
            button_text: "خرید",
            secondary_text: "اطلاعات بیشتر",
            product_url: "https://example.com",
          },
        ]

        const productsResponse = await fetch(`/api/chatbots/${createdBot.id}/products`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sampleProducts.map((product) => ({ ...product, chatbot_id: createdBot.id }))),
        })

        if (productsResponse.ok) {
          addLog("✅ محصولات نمونه اضافه شدند")
        }
      }

      addLog("🎉 رفع مشکلات کامل شد!")

      // اجرای مجدد تشخیص
      setTimeout(() => {
        runDiagnostics()
      }, 1000)
    } catch (error) {
      addLog(`❌ خطا در رفع مشکلات: ${error}`)
    } finally {
      setIsFixing(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const StatusIcon = ({ status }: { status: boolean }) =>
    status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-vazir">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔧 تشخیص و رفع مشکلات</h1>
          <div className="flex gap-3">
            <Button onClick={runDiagnostics} disabled={isLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              تشخیص مجدد
            </Button>
            <Button onClick={fixIssues} disabled={isFixing} className="bg-green-600 hover:bg-green-700">
              <Settings className={`h-4 w-4 mr-2 ${isFixing ? "animate-spin" : ""}`} />
              رفع خودکار مشکلات
            </Button>
          </div>
        </div>

        {debugInfo && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* وضعیت دیتابیس */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  وضعیت دیتابیس
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>اتصال دیتابیس</span>
                  <StatusIcon status={debugInfo.database.connected} />
                </div>
                {debugInfo.database.url && (
                  <div className="text-sm text-gray-600">URL: {debugInfo.database.url.substring(0, 50)}...</div>
                )}
                {debugInfo.database.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{debugInfo.database.error}</div>
                )}
              </CardContent>
            </Card>

            {/* وضعیت جداول */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  جداول دیتابیس
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(debugInfo.tables).map(([table, exists]) => (
                  <div key={table} className="flex items-center justify-between">
                    <span className="text-sm">{table}</span>
                    <StatusIcon status={exists} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* وضعیت API ها */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  عملکرد API ها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(debugInfo.apis).map(([api, working]) => (
                  <div key={api} className="flex items-center justify-between">
                    <span className="text-sm">{api}</span>
                    <StatusIcon status={working} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* داده‌های موجود */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  داده‌های موجود
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>تعداد چت‌بات‌ها</span>
                  <span className="font-bold">{debugInfo.data.chatbots.length}</span>
                </div>
                {debugInfo.data.sampleChatbot && (
                  <div className="text-sm bg-blue-50 p-2 rounded">
                    <div className="font-medium">{debugInfo.data.sampleChatbot.name}</div>
                    <div className="text-gray-600">ID: {debugInfo.data.sampleChatbot.id}</div>
                  </div>
                )}
                {debugInfo.data.chatbots.length === 0 && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">هیچ چت‌باتی موجود نیست</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* لاگ‌ها */}
        <Card>
          <CardHeader>
            <CardTitle>لاگ عملیات</CardTitle>
            <CardDescription>جزئیات عملیات تشخیص و رفع مشکلات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && <div className="text-gray-500">در انتظار عملیات...</div>}
            </div>
          </CardContent>
        </Card>

        {/* دکمه‌های عمل */}
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => (window.location.href = "/database-setup")} variant="outline">
            تنظیمات دیتابیس
          </Button>
          <Button onClick={() => (window.location.href = "/")} className="bg-blue-600 hover:bg-blue-700">
            بازگشت به صفحه اصلی
          </Button>
        </div>
      </div>
    </div>
  )
}
