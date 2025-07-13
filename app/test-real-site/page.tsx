"use client"

import { useState, useEffect } from "react"

export default function TestRealSitePage() {
  const [chatbotId, setChatbotId] = useState("1")
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const loadWidget = () => {
    // حذف ویجت قبلی اگر وجود دارد
    const existingScript = document.getElementById("chatbot-widget-script")
    if (existingScript) {
      existingScript.remove()
      addTestResult("ویجت قبلی حذف شد")
    }

    const existingContainer = document.getElementById("chatbot-widget-container")
    if (existingContainer) {
      existingContainer.remove()
      addTestResult("کانتینر قبلی حذف شد")
    }

    // بارگذاری ویجت جدید
    const script = document.createElement("script")
    script.id = "chatbot-widget-script"
    script.src = "/widget-loader.js"
    script.setAttribute("data-chatbot-id", chatbotId)
    script.setAttribute("data-position", "bottom-right")
    script.setAttribute("data-primary-color", "#0066FF")

    script.onload = () => {
      setIsScriptLoaded(true)
      addTestResult("اسکریپت ویجت بارگذاری شد")
    }

    script.onerror = () => {
      addTestResult("خطا در بارگذاری اسکریپت ویجت")
    }

    document.body.appendChild(script)
    addTestResult("اسکریپت ویجت اضافه شد")
  }

  const testWidgetFunctions = () => {
    if (window.cw) {
      addTestResult("تابع cw در دسترس است")

      // تست باز کردن
      if (window.ChatbotWidget?.openWidget) {
        window.ChatbotWidget.openWidget()
        addTestResult("ویجت باز شد")
      }

      // تست بستن بعد از 3 ثانیه
      setTimeout(() => {
        if (window.ChatbotWidget?.closeWidget) {
          window.ChatbotWidget.closeWidget()
          addTestResult("ویجت بسته شد")
        }
      }, 3000)
    } else {
      addTestResult("تابع cw در دسترس نیست")
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  useEffect(() => {
    // بررسی وجود ویجت در صفحه
    const checkWidget = setInterval(() => {
      const container = document.getElementById("chatbot-widget-container")
      const button = document.getElementById("chatbot-widget-button")
      const iframe = document.getElementById("chatbot-widget-iframe")

      if (container && button && iframe) {
        addTestResult("تمام عناصر ویجت یافت شدند")
        clearInterval(checkWidget)
      }
    }, 1000)

    return () => clearInterval(checkWidget)
  }, [isScriptLoaded])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* هدر سایت شبیه‌سازی شده */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">سایت تست</h1>
            </div>
            <nav className="hidden md:flex space-x-8 space-x-reverse">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                خانه
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                محصولات
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                درباره ما
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                تماس
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* پنل کنترل */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">کنترل ویجت چت‌بات</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شناسه چت‌بات</label>
                  <input
                    type="text"
                    value={chatbotId}
                    onChange={(e) => setChatbotId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={loadWidget}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    بارگذاری ویجت
                  </button>

                  <button
                    onClick={testWidgetFunctions}
                    disabled={!isScriptLoaded}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    تست عملکرد ویجت
                  </button>

                  <button
                    onClick={clearResults}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    پاک کردن نتایج
                  </button>
                </div>

                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isScriptLoaded ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span>وضعیت اسکریپت: {isScriptLoaded ? "بارگذاری شده" : "بارگذاری نشده"}</span>
                  </div>
                </div>
              </div>

              {/* نتایج تست */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">نتایج تست:</h3>
                <div className="bg-gray-50 rounded-md p-3 max-h-64 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <p className="text-sm text-gray-500">هنوز تستی انجام نشده</p>
                  ) : (
                    <div className="space-y-1">
                      {testResults.map((result, index) => (
                        <div key={index} className="text-xs text-gray-700 font-mono">
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* محتوای سایت */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* بخش هیرو */}
              <section className="bg-white rounded-lg shadow p-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">به سایت تست خوش آمدید</h2>
                <p className="text-lg text-gray-600 mb-6">این صفحه برای تست ویجت چت‌بات در محیط واقعی طراحی شده است.</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  شروع کنید
                </button>
              </section>

              {/* بخش محصولات */}
              <section className="bg-white rounded-lg shadow p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">محصولات ما</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="border border-gray-200 rounded-lg p-4">
                      <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
                      <h4 className="font-semibold text-gray-900 mb-2">محصول {item}</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        توضیحات محصول {item} که شامل ویژگی‌های مختلف و جذاب است.
                      </p>
                      <button className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition-colors">
                        مشاهده جزئیات
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* بخش درباره ما */}
              <section className="bg-white rounded-lg shadow p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">درباره ما</h3>
                <div className="prose prose-gray max-w-none">
                  <p>
                    ما یک شرکت نوآور در زمینه فناوری هستیم که بر روی ایجاد راه‌حل‌های هوشمند برای کسب‌وکارها تمرکز داریم.
                    ویجت چت‌بات ما یکی از محصولات پیشرفته‌ای است که توسط تیم ما توسعه یافته است.
                  </p>
                  <p>
                    این ویجت قابلیت‌های زیادی دارد از جمله پاسخگویی هوشمند، پیشنهاد محصولات، و ارائه پشتیبانی 24 ساعته.
                    همچنین کاملاً ریسپانسیو است و روی تمام دستگاه‌ها به خوبی کار می‌کند.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* فوتر */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">شرکت ما</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    درباره ما
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    تیم ما
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    فرصت‌های شغلی
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">محصولات</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    چت‌بات هوشمند
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    سیستم مدیریت
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    تحلیل داده
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">پشتیبانی</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    مرکز راهنمایی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    تماس با ما
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    گزارش مشکل
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">تماس</h4>
              <div className="text-gray-300 space-y-2">
                <p>تهران، ایران</p>
                <p>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
                <p>ایمیل: info@example.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; ۲۰۲۴ شرکت ما. تمام حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
