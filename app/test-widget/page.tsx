"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestWidgetPage() {
  const [widgetId, setWidgetId] = useState("1")
  const [scriptAdded, setScriptAdded] = useState(false)

  const addWidgetScript = () => {
    if (scriptAdded) {
      // اگر اسکریپت قبلاً اضافه شده، آن را حذف کنیم
      const existingScript = document.getElementById("chatbot-widget-script")
      if (existingScript) {
        existingScript.remove()
      }

      // اگر ویجت قبلاً ایجاد شده، آن را حذف کنیم
      if (window.ChatbotWidget && typeof window.ChatbotWidget.destroy === "function") {
        window.ChatbotWidget.destroy()
      }

      // حذف کانتینر اضافی اگر وجود دارد
      const container = document.getElementById("chatbot-widget-container")
      if (container) {
        container.remove()
      }
    }

    // ایجاد اسکریپت جدید
    const script = document.createElement("script")
    script.id = "chatbot-widget-script"
    script.src = "/widget-loader.js"
    script.setAttribute("data-chatbot-id", widgetId)
    document.body.appendChild(script)

    setScriptAdded(true)
  }

  const openWidget = () => {
    if (window.cw) {
      window.cw("open")
    }
  }

  const closeWidget = () => {
    if (window.cw) {
      window.cw("close")
    }
  }

  const toggleWidget = () => {
    if (window.cw) {
      window.cw("toggle")
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">تست ویجت چت‌بات</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">افزودن ویجت</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={widgetId}
            onChange={(e) => setWidgetId(e.target.value)}
            placeholder="شناسه چت‌بات"
            className="border rounded px-3 py-2 w-32"
          />
          <Button onClick={addWidgetScript}>{scriptAdded ? "بارگذاری مجدد ویجت" : "افزودن ویجت"}</Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={openWidget} variant="outline">
            باز کردن
          </Button>
          <Button onClick={closeWidget} variant="outline">
            بستن
          </Button>
          <Button onClick={toggleWidget} variant="outline">
            تغییر وضعیت
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">کد نمونه</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
          {`<script 
  src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js" 
  data-chatbot-id="${widgetId}"
  data-position="bottom-right"
  data-color="#0066FF">
</script>`}
        </pre>

        <h3 className="text-lg font-semibold mt-6 mb-2">یا با استفاده از JavaScript:</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
          {`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js"></script>
<script>
  window.ChatbotWidgetInit({
    id: "${widgetId}",
    position: "bottom-right",
    primaryColor: "#0066FF"
  });
</script>`}
        </pre>
      </div>
    </div>
  )
}
