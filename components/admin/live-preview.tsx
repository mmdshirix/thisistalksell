"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Send } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LivePreviewProps {
  chatbot: {
    id: number
    name: string
    primary_color: string
    text_color: string
    background_color: string
    chat_icon: string
    position: string
    margin_x: number
    margin_y: number
    welcome_message: string
    navigation_message: string
  }
}

export default function LivePreview({ chatbot }: LivePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: chatbot.welcome_message,
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    }

    // Add bot response (simulated)
    const botMessage = {
      id: messages.length + 2,
      text: "این یک پیش‌نمایش است. در حالت واقعی، پاسخ هوشمند ارائه می‌شود.",
      isBot: true,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage, botMessage])
    setInputMessage("")
  }

  const getPositionClasses = () => {
    switch (chatbot.position) {
      case "bottom-left":
        return `bottom-${chatbot.margin_y} left-${chatbot.margin_x}`
      case "top-right":
        return `top-${chatbot.margin_y} right-${chatbot.margin_x}`
      case "top-left":
        return `top-${chatbot.margin_y} left-${chatbot.margin_x}`
      default:
        return `bottom-${chatbot.margin_y} right-${chatbot.margin_x}`
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>پیش‌نمایش زنده</CardTitle>
          <CardDescription>این نمایش دقیقاً همان چیزی است که کاربران در وب‌سایت شما خواهند دید</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] relative overflow-hidden">
            <div className="text-center text-gray-500 text-sm mb-4">
              <p>شبیه‌سازی وب‌سایت شما</p>
              <Badge variant="outline">پیش‌نمایش</Badge>
            </div>

            {/* Simulated website content */}
            <div className="space-y-4 opacity-50">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>

            {/* Chatbot Widget */}
            <div
              className={`fixed ${getPositionClasses()}`}
              style={{ margin: `${chatbot.margin_y}px ${chatbot.margin_x}px` }}
            >
              {!isOpen ? (
                <Button
                  onClick={() => setIsOpen(true)}
                  className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: chatbot.primary_color,
                    color: chatbot.text_color,
                  }}
                >
                  <span className="text-2xl">{chatbot.chat_icon}</span>
                </Button>
              ) : (
                <Card className="w-80 h-96 shadow-xl">
                  <CardHeader
                    className="p-4 rounded-t-lg"
                    style={{
                      backgroundColor: chatbot.primary_color,
                      color: chatbot.text_color,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{chatbot.chat_icon}</span>
                        <span className="font-medium">{chatbot.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-current hover:bg-white/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 flex flex-col h-80">
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              message.isBot ? "bg-gray-100 text-gray-800" : "text-white"
                            }`}
                            style={
                              !message.isBot
                                ? {
                                    backgroundColor: chatbot.primary_color,
                                    color: chatbot.text_color,
                                  }
                                : {}
                            }
                          >
                            {message.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="پیام خود را بنویسید..."
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="text-sm"
                        />
                        <Button
                          onClick={handleSendMessage}
                          size="sm"
                          style={{
                            backgroundColor: chatbot.primary_color,
                            color: chatbot.text_color,
                          }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تنظیمات فعلی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">موقعیت:</span>
              <p className="text-muted-foreground">{chatbot.position}</p>
            </div>
            <div>
              <span className="font-medium">رنگ اصلی:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border" style={{ backgroundColor: chatbot.primary_color }}></div>
                <span className="text-muted-foreground font-mono">{chatbot.primary_color}</span>
              </div>
            </div>
            <div>
              <span className="font-medium">فاصله افقی:</span>
              <p className="text-muted-foreground">{chatbot.margin_x}px</p>
            </div>
            <div>
              <span className="font-medium">فاصله عمودی:</span>
              <p className="text-muted-foreground">{chatbot.margin_y}px</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
