"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Code, Trash2 } from "lucide-react"

export default function TestDirectWidgetPage() {
  const [chatbotId, setChatbotId] = useState("1")
  const [logs, setLogs] = useState<string[]>([])
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `${timestamp}: ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const loadWidget = () => {
    addLog("🚀 شروع بارگذاری ویجت...")

    // حذف ویجت قبلی
    const existingScript = document.getElementById("direct-widget-script")
    if (existingScript) {
      existingScript.remove()
      addLog("🗑️ اسکریپت قبلی حذف شد")
    }

    const existingContainer = document.getElementById("chatbot-widget-container")
    if (existingContainer) {
      existingContainer.remove()
      addLog("🗑️ کانتینر قبلی حذف شد")
    }

    // ریست کردن متغیر سراسری
    if (window.ChatbotWidgetLoaded) {
      window.ChatbotWidgetLoaded = false
      addLog("🔄 متغیر سراسری ریست شد")
    }

    // ایجاد اسکریپت جدید
    const script = document.createElement("script")
    script.id = "direct-widget-script"
    script.src = "/widget-loader.js"
    script.setAttribute("data-chatbot-id", chatbotId)
    script.setAttribute("data-position", "bottom-right")
    script.setAttribute("data-primary-color", "#0066FF")

    script.onload = () => {
      addLog("✅ اسکریپت ویجت بارگذاری شد")
      setIsWidgetLoaded(true)

      // بررسی وجود عناصر بعد از 2 ثانیه
      setTimeout(() => {
        const container = document.getElementById("chatbot-widget-container")
        if (container) {
          addLog("✅ کانتینر ویجت ایجاد شد")

          // بررسی Shadow DOM
          if (container.shadowRoot) {
            addLog("✅ Shadow DOM ایجاد شد")

            const button = container.shadowRoot.querySelector(".widget-button")
            const panel = container.shadowRoot.querySelector(".widget-panel")

            if (button) {
              addLog("✅ دکمه ویجت ایجاد شد")
            } else {
              addLog("❌ دکمه ویجت یافت نشد")
            }

            if (panel) {
              addLog("✅ پنل ویجت ایجاد شد")
            } else {
              addLog("❌ پنل ویجت یافت نشد")
            }
          } else {
            addLog("❌ Shadow DOM ایجاد نشد")
          }
        } else {
          addLog("❌ کانتینر ویجت ایجاد نشد")
        }
      }, 2000)
    }

    script.onerror = () => {
      addLog("❌ خطا در بارگذاری اسکریپت ویجت")
      setIsWidgetLoaded(false)
    }

    document.body.appendChild(script)
    addLog("📝 اسکریپت به صفحه اضافه شد")
  }

  const testWidgetFunctions = () => {
    addLog("🧪 شروع تست عملکردهای ویجت...")

    // بررسی وجود کانتینر اصلی
    const container = document.getElementById("chatbot-widget-container")
    if (!container) {
      addLog("❌ کانتینر ویجت یافت نشد")
      return
    }

    addLog("✅ کانتینر ویجت موجود است")

    // بررسی Shadow DOM
    if (!container.shadowRoot) {
      addLog("❌ Shadow DOM یافت نشد")
      return
    }

    addLog("✅ Shadow DOM موجود است")

    // بررسی عناصر داخل Shadow DOM
    const button = container.shadowRoot.querySelector(".widget-button")
    const panel = container.shadowRoot.querySelector(".widget-panel")

    if (!button) {
      addLog("❌ دکمه ویجت یافت نشد")
      return
    }

    if (!panel) {
      addLog("❌ پنل ویجت یافت نشد")
      return
    }

    addLog("✅ تمام عناصر ویجت موجود است")

    // تست API ویجت
    if (window.ChatbotWidget) {
      addLog("✅ API ویجت موجود است")

      // تست باز کردن
      if (typeof window.ChatbotWidget.open === "function") {
        addLog("🔓 تست باز کردن ویجت...")

        const result = window.ChatbotWidget.open()
        if (result) {
          addLog("✅ ویجت باز شد")

          // بررسی کلاس open
          setTimeout(() => {
            if (panel.classList.contains("open")) {
              addLog("✅ کلاس 'open' اضافه شد")
            } else {
              addLog("❌ کلاس 'open' اضافه نشد")
            }
          }, 100)

          // تست بستن بعد از 3 ثانیه
          setTimeout(() => {
            addLog("🔒 تست بستن ویجت...")
            const closeResult = window.ChatbotWidget.close()
            if (closeResult) {
              addLog("✅ ویجت بسته شد")

              // بررسی حذف کلاس open
              setTimeout(() => {
                if (!panel.classList.contains("open")) {
                  addLog("✅ کلاس 'open' حذف شد")
                } else {
                  addLog("❌ کلاس 'open' حذف نشد")
                }
              }, 100)
            } else {
              addLog("❌ خطا در بستن ویجت")
            }
          }, 3000)
        } else {
          addLog("❌ خطا در باز کردن ویجت")
        }
      } else {
        addLog("❌ تابع open موجود نیست")
      }

      // تست سایر توابع
      if (typeof window.ChatbotWidget.isOpen === "function") {
        addLog(`ℹ️ وضعیت فعلی ویجت: ${window.ChatbotWidget.isOpen() ? "باز" : "بسته"}`)
      }
    } else {
      addLog("❌ API ویجت موجود نیست")
    }
  }

  const inspectWidget = () => {
    addLog("🔍 بررسی جزئیات ویجت...")

    const container = document.getElementById("chatbot-widget-container")
    if (container) {
      addLog(`📦 کانتینر: ${container.tagName} با ID: ${container.id}`)
      addLog(
        `📍 موقعیت: ${container.style.position} - ${container.style.bottom || container.style.top} ${container.style.right || container.style.left}`,
      )
      addLog(`🎨 Z-Index: ${container.style.zIndex}`)

      if (container.shadowRoot) {
        const button = container.shadowRoot.querySelector(".widget-button")
        const panel = container.shadowRoot.querySelector(".widget-panel")

        if (button) {
          addLog(`🔘 دکمه: نمایش ${button.style.display || "flex"} - رنگ ${button.style.backgroundColor}`)
        }

        if (panel) {
          addLog(`📱 پنل: نمایش ${panel.style.display || "none"} - ابعاد ${panel.style.width} × ${panel.style.height}`)
        }

        const styles = container.shadowRoot.querySelector("style")
        if (styles) {
          addLog("🎨 استایل‌های داخلی موجود است")
        }
      }
    } else {
      addLog("❌ کانتینر ویجت یافت نشد")
    }
  }

  const testIframe = () => {
    addLog("🖼️ بررسی iframe...")

    const container = document.getElementById("chatbot-widget-container")
    if (!container || !container.shadowRoot) {
      addLog("❌ کانتینر یا Shadow DOM یافت نشد")
      return
    }

    const iframe = container.shadowRoot.querySelector(".widget-iframe")
    if (!iframe) {
      addLog("❌ iframe یافت نشد")
      return
    }

    addLog("✅ iframe موجود است")
    addLog(`📍 آدرس iframe: ${iframe.src}`)
    addLog(`📏 ابعاد iframe: ${iframe.style.width} × ${iframe.style.height}`)

    // تست بارگذاری iframe
    iframe.onload = () => {
      addLog("✅ iframe بارگذاری شد")
    }

    iframe.onerror = () => {
      addLog("❌ خطا در بارگذاری iframe")
    }

    // تست دسترسی به محتوای iframe
    try {
      if (iframe.contentWindow) {
        addLog("✅ دسترسی به contentWindow موجود است")
      }
    } catch (error) {
      addLog("⚠️ محدودیت CORS برای دسترسی به iframe")
    }
  }

  const removeWidget = () => {
    const container = document.getElementById("chatbot-widget-container")
    const script = document.getElementById("direct-widget-script")

    if (container) {
      container.remove()
      addLog("🗑️ کانتینر ویجت حذف شد")
    }

    if (script) {
      script.remove()
      addLog("🗑️ اسکریپت ویجت حذف شد")
    }

    if (window.ChatbotWidgetLoaded) {
      window.ChatbotWidgetLoaded = false
      addLog("🔄 متغیر سراسری ریست شد")
    }

    setIsWidgetLoaded(false)
    addLog("✅ ویجت کاملاً حذف شد")
  }

  // بررسی وضعیت ویجت هر 5 ثانیه
  useEffect(() => {
    const interval = setInterval(() => {
      const container = document.getElementById("chatbot-widget-container")
      if (container && !isWidgetLoaded) {
        setIsWidgetLoaded(true)
        addLog("🔄 ویجت تشخیص داده شد")
      } else if (!container && isWidgetLoaded) {
        setIsWidgetLoaded(false)
        addLog("⚠️ ویجت از بین رفت")
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isWidgetLoaded])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">تست ویجت مستقیم (بدون iframe)</h1>
          <p className="text-gray-600">این صفحه ویجت جدید بدون iframe را تست می‌کند</p>
        </div>

        {/* کنترل‌ها */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              کنترل‌های تست
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه چت‌بات</label>
                <Input value={chatbotId} onChange={(e) => setChatbotId(e.target.value)} placeholder="1" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <div
                  className={`w-3 h-3 rounded-full ${isWidgetLoaded ? "bg-green-500" : "bg-red-500"}`}
                  title={isWidgetLoaded ? "ویجت بارگذاری شده" : "ویجت بارگذاری نشده"}
                ></div>
                <span className="text-sm text-gray-600">{isWidgetLoaded ? "بارگذاری شده" : "بارگذاری نشده"}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={loadWidget} className="bg-blue-600 hover:bg-blue-700">
                بارگذاری ویجت
              </Button>

              <Button onClick={testWidgetFunctions} variant="outline" disabled={!isWidgetLoaded}>
                تست عملکرد
              </Button>

              <Button onClick={inspectWidget} variant="outline" disabled={!isWidgetLoaded}>
                <Eye className="h-4 w-4 mr-2" />
                بررسی جزئیات
              </Button>

              <Button onClick={testIframe} variant="outline" disabled={!isWidgetLoaded}>
                🖼️ تست iframe
              </Button>

              <Button onClick={removeWidget} variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
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
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
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
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              کد Embed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">کد ساده:</h4>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js" data-chatbot-id="${chatbotId}"></script>`}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">کد پیشرفته:</h4>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js"></script>
<script>
  window.cw('init', {
    id: '${chatbotId}',
    position: 'bottom-right',
    primaryColor: '#0066FF',
    chatIcon: '💬'
  });
</script>`}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">✨ ویژگی‌های جدید:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• بدون iframe - عملکرد سریع‌تر</li>
                <li>• Shadow DOM - جداسازی کامل استایل‌ها</li>
                <li>• ریسپانسیو کامل</li>
                <li>• انیمیشن‌های روان</li>
                <li>• بدون تداخل با سایت</li>
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
                این محتوا برای تست تداخل ویجت با عناصر صفحه است. ویجت نباید با این محتوا تداخل داشته باشد.
              </p>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-lg flex items-center justify-center text-white font-bold">
                محتوای رنگی
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>محتوای تست 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                اگر ویجت درست کار می‌کند، باید در گوشه صفحه ظاهر شود و قابل کلیک باشد.
              </p>
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
