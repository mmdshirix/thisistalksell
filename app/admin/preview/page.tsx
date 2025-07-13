"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, RefreshCw } from "lucide-react"

interface Message {
  id: number
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function PreviewPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "سلام! 👋 به فروشگاه تکنولوژی خوش آمدید! من دستیار هوشمند شما هستم. چطور می‌تونم کمکتون کنم؟",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const faqs = [
    { emoji: "📱", text: "محصولات موجود" },
    { emoji: "🛒", text: "نحوه سفارش" },
    { emoji: "🛡️", text: "گارانتی و خدمات" },
    { emoji: "🚚", text: "ارسال و تحویل" },
    { emoji: "💬", text: "پشتیبانی" },
  ]

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      content,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    setTimeout(() => {
      const botResponse = "این یک پیش‌نمایش است. پاسخ‌های واقعی توسط هوش مصنوعی تولید می‌شوند."
      const botMessage: Message = {
        id: Date.now() + 1,
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleFaqClick = (faqText: string) => {
    handleSendMessage(faqText)
  }

  const handleReset = () => {
    setMessages([
      {
        id: 1,
        content: "سلام! 👋 به فروشگاه تکنولوژی خوش آمدید! من دستیار هوشمند شما هستم. چطور می‌تونم کمکتون کنم؟",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">پیش‌نمایش چت‌بات</h1>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="ml-2 h-4 w-4" />
          شروع مجدد
        </Button>
      </div>

      <div className="flex justify-center">
        <Card className="w-[350px] h-[600px] flex flex-col">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">🤖</div>
              <div>
                <CardTitle className="text-lg">چت‌بات فروشگاه تکنولوژی</CardTitle>
                <CardDescription className="text-blue-100">آنلاین • پاسخگویی سریع</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start gap-2 max-w-xs ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FAQ Buttons */}
            {messages.length === 1 && (
              <div className="px-4 pb-4 flex-shrink-0">
                <p className="text-sm text-gray-600 mb-3">
                  چه چیزی شما را به اینجا آورده است؟ لطفاً از گزینه‌های زیر استفاده کنید:
                </p>
                <div className="flex flex-wrap gap-2">
                  {faqs.map((faq, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFaqClick(faq.text)}
                      className="text-xs"
                    >
                      {faq.emoji} {faq.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t p-4 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage(inputMessage)
                    }
                  }}
                  disabled={isTyping}
                />
                <Button onClick={() => handleSendMessage(inputMessage)} disabled={isTyping || !inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
