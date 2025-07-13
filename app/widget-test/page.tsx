"use client"

import { useState, useEffect } from "react"

export default function WidgetTestPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [chatbotId, setChatbotId] = useState<string>("1")

  useEffect(() => {
    const testWidget = async () => {
      try {
        setStatus("loading")

        // Test 1: Check if the widget-loader.js is accessible
        try {
          const loaderResponse = await fetch("/widget-loader.js")
          if (!loaderResponse.ok) {
            throw new Error(`widget-loader.js returned ${loaderResponse.status}`)
          }
          console.log("widget-loader.js is accessible")
        } catch (error) {
          console.error("Error accessing widget-loader.js:", error)
          setErrorMessage(
            `خطا در دسترسی به widget-loader.js: ${error instanceof Error ? error.message : String(error)}`,
          )
          setStatus("error")
          return
        }

        // Test 2: Check if the chatbot API is accessible
        try {
          const chatbotResponse = await fetch(`/api/chatbots/${chatbotId}`)
          if (!chatbotResponse.ok) {
            throw new Error(`Chatbot API returned ${chatbotResponse.status}`)
          }
          const chatbot = await chatbotResponse.json()
          console.log("Chatbot API is accessible:", chatbot)
        } catch (error) {
          console.error("Error accessing chatbot API:", error)
          setErrorMessage(`خطا در دسترسی به API چت‌بات: ${error instanceof Error ? error.message : String(error)}`)
          setStatus("error")
          return
        }

        // Test 3: Check if the widget iframe is accessible
        try {
          const widgetResponse = await fetch(`/widget/${chatbotId}`)
          if (!widgetResponse.ok) {
            throw new Error(`Widget iframe returned ${widgetResponse.status}`)
          }
          console.log("Widget iframe is accessible")
        } catch (error) {
          console.error("Error accessing widget iframe:", error)
          setErrorMessage(`خطا در دسترسی به iframe ویجت: ${error instanceof Error ? error.message : String(error)}`)
          setStatus("error")
          return
        }

        setStatus("success")
      } catch (error) {
        console.error("Unexpected error in widget test:", error)
        setErrorMessage(`خطای غیرمنتظره: ${error instanceof Error ? error.message : String(error)}`)
        setStatus("error")
      }
    }

    testWidget()
  }, [chatbotId])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">تست وضعیت ویجت چت‌بات</h1>

        <div className="mb-4">
          <label htmlFor="chatbotId" className="block text-sm font-medium text-gray-700 mb-1">
            شناسه چت‌بات:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="chatbotId"
              value={chatbotId}
              onChange={(e) => setChatbotId(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2"
            />
            <button onClick={() => testWidget()} className="bg-blue-600 text-white px-4 py-2 rounded-md">
              تست مجدد
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">وضعیت تست:</h2>

          {status === "loading" && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              در حال تست...
            </div>
          )}

          {status === "success" && (
            <div className="text-green-600 font-medium">
              ✓ همه تست‌ها با موفقیت انجام شدند. ویجت باید به درستی کار کند.
            </div>
          )}

          {status === "error" && (
            <div className="text-red-600">
              <div className="font-medium">❌ خطا در تست ویجت:</div>
              <div className="mt-1">{errorMessage}</div>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">پیش‌نمایش ویجت:</h2>

          <div className="bg-gray-100 p-4 rounded-lg h-[400px] flex items-center justify-center">
            <iframe
              src={`/widget/${chatbotId}`}
              className="w-full h-full border-0 rounded-lg shadow-md"
              title="Widget Preview"
            ></iframe>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>اگر ویجت به درستی نمایش داده نمی‌شود، موارد زیر را بررسی کنید:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>مطمئن شوید که شناسه چت‌بات صحیح است.</li>
              <li>کش مرورگر را پاک کنید و صفحه را مجدداً بارگذاری کنید.</li>
              <li>کنسول مرورگر را برای خطاهای احتمالی بررسی کنید.</li>
              <li>مطمئن شوید که متغیر محیطی NEXT_PUBLIC_APP_URL به درستی تنظیم شده است.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  function testWidget() {
    setStatus("loading")
    // This will trigger the useEffect again
    setChatbotId((prev) => prev)
  }
}
