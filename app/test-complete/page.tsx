"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  timestamp: Date
}

export default function TestCompletePage() {
  const [chatbotId, setChatbotId] = useState("1")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addTestResult = (name: string, status: "success" | "error", message: string) => {
    setTestResults((prev) => [...prev, { name, status, message, timestamp: new Date() }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const runCompleteTest = async () => {
    setIsRunning(true)
    clearResults()

    // تست 1: بررسی API چت‌بات‌ها
    try {
      addTestResult("API Test", "pending", "Testing chatbots API...")
      const response = await fetch("/api/chatbots")
      if (response.ok) {
        const data = await response.json()
        addTestResult("API Test", "success", `✅ API working - ${data.length} chatbots found`)
      } else {
        addTestResult("API Test", "error", `❌ API failed with status ${response.status}`)
      }
    } catch (error) {
      addTestResult("API Test", "error", `❌ API error: ${error}`)
    }

    // تست 2: بررسی widget-loader.js
    try {
      addTestResult("Widget Loader", "pending", "Testing widget loader...")
      const response = await fetch("/widget-loader.js")
      if (response.ok) {
        const script = await response.text()
        if (script.includes("ChatbotWidget")) {
          addTestResult("Widget Loader", "success", "✅ Widget loader script is valid")
        } else {
          addTestResult("Widget Loader", "error", "❌ Widget loader script is invalid")
        }
      } else {
        addTestResult("Widget Loader", "error", `❌ Widget loader failed with status ${response.status}`)
      }
    } catch (error) {
      addTestResult("Widget Loader", "error", `❌ Widget loader error: ${error}`)
    }

    // تست 3: بررسی چت‌بات خاص
    try {
      addTestResult("Chatbot Check", "pending", `Testing chatbot ${chatbotId}...`)
      const response = await fetch(`/api/chatbots/${chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        addTestResult("Chatbot Check", "success", `✅ Chatbot found: ${data.name}`)
      } else {
        addTestResult("Chatbot Check", "error", `❌ Chatbot ${chatbotId} not found`)
      }
    } catch (error) {
      addTestResult("Chatbot Check", "error", `❌ Chatbot check error: ${error}`)
    }

    // تست 4: بررسی صفحه ویجت
    try {
      addTestResult("Widget Page", "pending", `Testing widget page...`)
      const response = await fetch(`/widget/${chatbotId}`)
      if (response.ok) {
        addTestResult("Widget Page", "success", "✅ Widget page accessible")
      } else {
        addTestResult("Widget Page", "error", `❌ Widget page failed with status ${response.status}`)
      }
    } catch (error) {
      addTestResult("Widget Page", "error", `❌ Widget page error: ${error}`)
    }

    setIsRunning(false)
  }

  const testEmbedCode = () => {
    // حذف ویجت قبلی
    const existingScript = document.getElementById("test-widget-script")
    if (existingScript) {
      existingScript.remove()
    }

    const existingContainer = document.getElementById("chatbot-widget-container")
    if (existingContainer) {
      existingContainer.remove()
    }

    // اضافه کردن ویجت جدید
    const script = document.createElement("script")
    script.id = "test-widget-script"
    script.src = "/widget-loader.js"
    script.setAttribute("data-chatbot-id", chatbotId)
    script.setAttribute("data-position", "bottom-right")

    script.onload = () => {
      addTestResult("Embed Test", "success", "✅ Widget script loaded successfully")

      // بررسی وجود عناصر بعد از 2 ثانیه
      setTimeout(() => {
        const container = document.getElementById("chatbot-widget-container")
        const button = document.getElementById("chatbot-widget-button")
        const iframe = document.getElementById("chatbot-widget-iframe")

        if (container && button && iframe) {
          addTestResult("Widget Elements", "success", "✅ All widget elements created")
        } else {
          addTestResult("Widget Elements", "error", "❌ Some widget elements missing")
        }
      }, 2000)
    }

    script.onerror = () => {
      addTestResult("Embed Test", "error", "❌ Failed to load widget script")
    }

    document.body.appendChild(script)
    addTestResult("Embed Test", "pending", "Loading widget script...")
  }

  const testWidgetFunctions = () => {
    if (window.ChatbotWidget) {
      addTestResult("Widget Functions", "success", "✅ ChatbotWidget object available")

      // تست باز کردن
      if (typeof window.ChatbotWidget.open === "function") {
        window.ChatbotWidget.open()
        addTestResult("Open Function", "success", "✅ Widget opened")

        // تست بستن بعد از 3 ثانیه
        setTimeout(() => {
          if (typeof window.ChatbotWidget.close === "function") {
            window.ChatbotWidget.close()
            addTestResult("Close Function", "success", "✅ Widget closed")
          }
        }, 3000)
      } else {
        addTestResult("Widget Functions", "error", "❌ Open function not available")
      }
    } else {
      addTestResult("Widget Functions", "error", "❌ ChatbotWidget object not available")
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">تست کامل سیستم چت‌بات</h1>
          <p className="text-gray-600">این صفحه تمام قابلیت‌های سیستم را تست می‌کند</p>
        </div>

        {/* کنترل‌ها */}
        <Card>
          <CardHeader>
            <CardTitle>کنترل‌های تست</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه چت‌بات</label>
                <Input value={chatbotId} onChange={(e) => setChatbotId(e.target.value)} placeholder="1" />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={runCompleteTest} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    در حال تست...
                  </>
                ) : (
                  "تست کامل سیستم"
                )}
              </Button>

              <Button onClick={testEmbedCode} variant="outline" disabled={isRunning}>
                تست Embed Code
              </Button>

              <Button onClick={testWidgetFunctions} variant="outline" disabled={isRunning}>
                تست عملکرد ویجت
              </Button>

              <Button onClick={clearResults} variant="ghost">
                پاک کردن نتایج
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* نتایج تست */}
        <Card>
          <CardHeader>
            <CardTitle>نتایج تست</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>هنوز تستی انجام نشده است</p>
                <p className="text-sm">روی دکمه‌های بالا کلیک کنید تا تست‌ها شروع شود</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      result.status === "success"
                        ? "bg-green-50 border-green-200"
                        : result.status === "error"
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                    <div className="text-xs text-gray-500">{result.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* راهنمای embed code */}
        <Card>
          <CardHeader>
            <CardTitle>راهنمای استفاده از Embed Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">روش 1: Script Tag ساده</h4>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js" data-chatbot-id="${chatbotId}"></script>`}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">روش 2: JavaScript Manual</h4>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js"></script>
<script>
  window.cw('init', {
    id: '${chatbotId}',
    position: 'bottom-right',
    primaryColor: '#0066FF'
  });
</script>`}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">روش 3: Div Container</h4>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {`<div id="chatbot-widget" data-chatbot-id="${chatbotId}"></div>
<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js"></script>`}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">نکات مهم:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• مطمئن شوید که شناسه چت‌بات صحیح است</li>
                <li>• ویجت به صورت خودکار تشخیص داده می‌شود</li>
                <li>• برای موبایل کاملاً ریسپانسیو است</li>
                <li>• از CORS محافظت شده است</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* محتوای تست */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>محتوای تست 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                این بخش برای تست ویجت در محیط واقعی طراحی شده است. ویجت باید در گوشه صفحه ظاهر شود.
              </p>
              <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">محتوای نمونه</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>محتوای تست 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                اگر ویجت درست کار می‌کند، باید بتوانید روی آن کلیک کنید و چت‌بات باز شود.
              </p>
              <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">محتوای نمونه</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
