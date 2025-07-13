"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSimpleWidgetPage() {
  const [chatbotId, setChatbotId] = useState("1")
  const [isWidgetVisible, setIsWidgetVisible] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `${timestamp}: ${message}`])
  }

  const loadWidget = () => {
    addLog("🚀 بارگذاری ویجت ساده...")

    // حذف ویجت قبلی
    const existingScript = document.getElementById("simple-widget-script")
    if (existingScript) {
      existingScript.remove()
      addLog("🗑️ اسکریپت قبلی حذف شد")
    }

    const existingContainer = document.getElementById("chatbot-widget-container")
    if (existingContainer) {
      existingContainer.remove()
      addLog("🗑️ کانتینر قبلی حذف شد")
    }

    // ریست متغیر سراسری
    if (window.ChatbotWidgetLoaded) {
      window.ChatbotWidgetLoaded = false
      addLog("🔄 متغیر سراسری ریست شد")
    }

    // ایجاد اسکریپت جدید
    const script = document.createElement("script")
    script.id = "simple-widget-script"
    script.src = "/widget-loader.js"
    script.setAttribute("data-chatbot-id", chatbotId)
    script.setAttribute("data-position", "bottom-right")
    script.setAttribute("data-primary-color", "#0066FF")

    script.onload = () => {
      addLog("✅ اسکریپت بارگذاری شد")

      // بررسی وجود ویجت
      setTimeout(() => {
        const container = document.getElementById("chatbot-widget-container")
        if (container) {
          addLog("✅ ویجت ایجاد شد")
          setIsWidgetVisible(true)

          const button = container.querySelector(".chatbot-widget-button")
          const frame = container.querySelector(".chatbot-widget-frame")

          if (button) addLog("✅ دکمه ویجت موجود است")
          if (frame) addLog("✅ iframe ویجت موجود است")
        } else {
          addLog("❌ ویجت ایجاد نشد")
        }
      }, 1000)
    }

    script.onerror = () => {
      addLog("❌ خطا در بارگذاری اسکریپت")
    }

    document.body.appendChild(script)
    addLog("📝 اسکریپت اضافه شد")
  }

  const testWidget = () => {
    addLog("🧪 تست عملکرد ویجت...")

    if (window.ChatbotWidget) {
      addLog("✅ API ویجت موجود است")

      // تست باز کردن
      const openResult = window.ChatbotWidget.open()
      if (openResult) {
        addLog("✅ ویجت باز شد")

        // تست بستن بعد از 3 ثانیه
        setTimeout(() => {
          const closeResult = window.ChatbotWidget.close()
          if (closeResult) {
            addLog("✅ ویجت بسته شد")
          } else {
            addLog("❌ خطا در بستن ویجت")
          }
        }, 3000)
      } else {
        addLog("❌ خطا در باز کردن ویجت")
      }
    } else {
      addLog("❌ API ویجت موجود نیست")
    }
  }

  const removeWidget = () => {
    if (window.ChatbotWidget && typeof window.ChatbotWidget.destroy === "function") {
      window.ChatbotWidget.destroy()
      addLog("🗑️ ویجت از طریق API حذف شد")
    }

    const script = document.getElementById("simple-widget-script")
    if (script) {
      script.remove()
      addLog("🗑️ اسکریپت حذف شد")
    }

    setIsWidgetVisible(false)
    addLog("✅ ویجت کاملاً حذف شد")
  }

  const clearLogs = () => {
    setLogs([])
  }

  // بررسی وضعیت ویجت
  useEffect(() => {
    const interval = setInterval(() => {
      const container = document.getElementById("chatbot-widget-container")
      if (container && !isWidgetVisible) {
        setIsWidgetVisible(true)
      } else if (!container && isWidgetVisible) {
        setIsWidgetVisible(false)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isWidgetVisible])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">تست ویجت ساده</h1>
          <p className="text-gray-600">ویجت ساده و قابل اعتماد بدون پیچیدگی</p>
        </div>

        {/* کنترل‌ها */}
        <Card>
          <CardHeader>
            <CardTitle>کنترل‌های ویجت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه چت‌بات</label>
                <Input value={chatbotId} onChange={(e) => setChatbotId(e.target.value)} placeholder="1" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <div
                  className={`w-3 h-3 rounded-full ${isWidgetVisible ? "bg-green-500" : "bg-red-500"}`}
                  title={isWidgetVisible ? "ویجت موجود است" : "ویجت موجود نیست"}
                ></div>
                <span className="text-sm text-gray-600">{isWidgetVisible ? "موجود" : "غیرموجود"}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={loadWidget} className="bg-blue-600 hover:bg-blue-700">
                بارگذاری ویجت
              </Button>

              <Button onClick={testWidget} variant="outline" disabled={!isWidgetVisible}>
                تست عملکرد
              </Button>

              <Button onClick={removeWidget} variant="outline" className="text-red-600">
                حذف ویجت
              </Button>

              <Button onClick={clearLogs} variant="ghost">
                پاک کردن لاگ‌ها
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* لاگ‌ها */}
        <Card>
          <CardHeader>
            <CardTitle>لاگ‌های سیستم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">هنوز لاگی ثبت نشده...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* کد embed */}
        <Card>
          <CardHeader>
            <CardTitle>کد Embed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">کد ساده (توصیه شده):</h4>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js" data-chatbot-id="${chatbotId}"></script>`}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">کد دستی:</h4>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">✨ ویژگی‌ها:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• ساده و قابل اعتماد</li>
                <li>• بدون Shadow DOM پیچیده</li>
                <li>• iframe کامل چت‌بات</li>
                <li>• ریسپانسیو</li>
                <li>• سازگار با همه مرورگرها</li>
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
                ویجت باید در گوشه پایین راست صفحه ظاهر شود. روی دایره کلیک کنید تا چت‌بات باز شود.
              </p>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-lg flex items-center justify-center text-white font-bold">
                محتوای نمونه
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>محتوای تست 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">برای بستن چت‌بات، روی دکمه ضربدر در گوشه چت‌بات کلیک کنید.</p>
              <div className="bg-gradient-to-r from-green-500 to-teal-600 h-32 rounded-lg flex items-center justify-center text-white font-bold">
                محتوای دیگر
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
