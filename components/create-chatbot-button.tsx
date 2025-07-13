"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Plus } from "lucide-react"

export default function CreateChatbotButton() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chatbotName, setChatbotName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!chatbotName || chatbotName.trim() === "") {
      setError("نام چت‌بات الزامی است")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chatbots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: chatbotName.trim(),
          welcome_message: "سلام! چطور می‌توانم به شما کمک کنم؟",
          primary_color: "#0066FF",
          text_color: "#333333",
          background_color: "#FFFFFF",
          chat_icon: "💬",
          position: "bottom-right",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || "خطا در ایجاد چت‌بات")
      }

      const chatbot = await response.json()
      router.push(`/chatbots/${chatbot.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating chatbot:", error)
      setError(error instanceof Error ? error.message : "خطای غیرمنتظره‌ای رخ داده است")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="mr-2 h-4 w-4" />
        ایجاد چت‌بات جدید
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">ایجاد چت‌بات جدید</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="chatbot-name" className="block mb-2">
                    نام چت‌بات
                  </Label>
                  <Input
                    id="chatbot-name"
                    value={chatbotName}
                    onChange={(e) => setChatbotName(e.target.value)}
                    placeholder="مثال: چت‌بات پشتیبانی"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    انصراف
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        در حال ایجاد...
                      </div>
                    ) : (
                      "ایجاد چت‌بات"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
