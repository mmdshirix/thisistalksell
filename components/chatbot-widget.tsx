"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Send } from "lucide-react"
import { buildApiUrl } from "@/lib/api-config"

interface ChatbotWidgetProps {
  chatbotId: string
  config?: {
    primaryColor?: string
    textColor?: string
    backgroundColor?: string
    chatIcon?: string
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
    marginX?: number
    marginY?: number
    welcomeMessage?: string
    navigationMessage?: string
  }
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface FAQ {
  id: number
  question: string
  answer: string
}

interface Product {
  id: number
  name: string
  description: string
  price: string
  image_url?: string
  product_url?: string
}

interface QuickOption {
  id: number
  label: string
  emoji?: string
}

export default function ChatbotWidget({ chatbotId, config }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<"chat" | "faqs" | "products" | "ticket">("chat")
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [quickOptions, setQuickOptions] = useState<QuickOption[]>([])
  const [showWelcome, setShowWelcome] = useState(true)
  const [userTickets, setUserTickets] = useState<any[]>([])
  const [userPhone, setUserPhone] = useState("")

  // Ticket form state
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    image: null as File | null,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && showWelcome) {
      const welcomeMsg = config?.welcomeMessage || "سلام! چطور می‌توانم کمکتان کنم؟"
      setMessages([
        {
          id: "1",
          text: welcomeMsg,
          isUser: false,
          timestamp: new Date(),
        },
      ])

      // Load initial data
      loadFAQs()
      loadProducts()
      loadQuickOptions()
    }
  }, [isOpen, showWelcome, config?.welcomeMessage])

  const loadFAQs = async () => {
    try {
      const response = await fetch(buildApiUrl(`/api/chatbots/${chatbotId}/faqs`))
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
      }
    } catch (error) {
      console.error("Error loading FAQs:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch(buildApiUrl(`/api/chatbots/${chatbotId}/products`))
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const loadQuickOptions = async () => {
    try {
      const response = await fetch(buildApiUrl(`/api/chatbots/${chatbotId}/options`))
      if (response.ok) {
        const data = await response.json()
        setQuickOptions(data)
      }
    } catch (error) {
      console.error("Error loading quick options:", error)
    }
  }

  const loadUserTickets = async (phone: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/tickets/user/${encodeURIComponent(phone)}?chatbotId=${chatbotId}`))
      if (response.ok) {
        const data = await response.json()
        setUserTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error loading user tickets:", error)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setShowWelcome(false)

    try {
      const response = await fetch(buildApiUrl("/api/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text.trim(),
          chatbotId: chatbotId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "متاسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickOptionClick = (option: QuickOption) => {
    sendMessage(option.label)
  }

  const handleFAQClick = (faq: FAQ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: faq.question,
      isUser: true,
      timestamp: new Date(),
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: faq.answer,
      isUser: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, botMessage])
    setCurrentView("chat")
    setShowWelcome(false)
  }

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(buildApiUrl("/api/upload"), {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      }
    } catch (error) {
      console.error("Error uploading image:", error)
    }
    return null
  }

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = null
      if (ticketForm.image) {
        imageUrl = await handleImageUpload(ticketForm.image)
      }

      const response = await fetch(buildApiUrl("/api/tickets"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbot_id: chatbotId,
          name: ticketForm.name,
          email: ticketForm.email,
          phone: ticketForm.phone,
          subject: ticketForm.subject,
          message: ticketForm.message,
          image_url: imageUrl,
        }),
      })

      if (response.ok) {
        alert("تیکت شما با موفقیت ارسال شد!")
        setTicketForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          image: null,
        })
        setCurrentView("chat")
      } else {
        throw new Error("Failed to submit ticket")
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
      alert("خطا در ارسال تیکت. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userPhone.trim()) {
      loadUserTickets(userPhone.trim())
    }
  }

  const primaryColor = config?.primaryColor || "#3B82F6"
  const textColor = config?.textColor || "#FFFFFF"
  const backgroundColor = config?.backgroundColor || "#FFFFFF"
  const chatIcon = config?.chatIcon || "💬"
  const position = config?.position || "bottom-right"
  const marginX = config?.marginX || 20
  const marginY = config?.marginY || 20

  const positionClasses = {
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50`}
      style={{
        margin: `${marginY}px ${marginX}px`,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform"
          style={{ backgroundColor: primaryColor, color: textColor }}
        >
          <span className="text-2xl">{chatIcon}</span>
        </Button>
      )}

      {isOpen && (
        <Card className="w-80 h-96 shadow-xl border-0" style={{ backgroundColor }}>
          <CardHeader className="p-3 rounded-t-lg" style={{ backgroundColor: primaryColor, color: textColor }}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">پشتیبانی آنلاین</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView("chat")}
                    className={`text-xs px-2 py-1 h-auto ${currentView === "chat" ? "bg-white/20" : ""}`}
                    style={{ color: textColor }}
                  >
                    چت
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView("faqs")}
                    className={`text-xs px-2 py-1 h-auto ${currentView === "faqs" ? "bg-white/20" : ""}`}
                    style={{ color: textColor }}
                  >
                    سوالات
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView("products")}
                    className={`text-xs px-2 py-1 h-auto ${currentView === "products" ? "bg-white/20" : ""}`}
                    style={{ color: textColor }}
                  >
                    محصولات
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView("ticket")}
                    className={`text-xs px-2 py-1 h-auto ${currentView === "ticket" ? "bg-white/20" : ""}`}
                    style={{ color: textColor }}
                  >
                    تیکت
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 h-auto"
                  style={{ color: textColor }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-full flex flex-col">
            {currentView === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          message.isUser ? "text-white" : "bg-gray-100 text-gray-800"
                        }`}
                        style={message.isUser ? { backgroundColor: primaryColor } : {}}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}

                  {showWelcome && quickOptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 text-center">
                        {config?.navigationMessage || "لطفاً یکی از گزینه‌های زیر را انتخاب کنید:"}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickOptions.map((option) => (
                          <Button
                            key={option.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickOptionClick(option)}
                            className="text-xs"
                          >
                            {option.emoji && <span className="mr-1">{option.emoji}</span>}
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="پیام خود را بنویسید..."
                      className="flex-1 text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isLoading || !inputValue.trim()}
                      style={{ backgroundColor: primaryColor, color: textColor }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {currentView === "faqs" && (
              <div className="flex-1 overflow-y-auto p-3">
                <h3 className="font-medium mb-3 text-center">سوالات متداول</h3>
                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <Button
                      key={faq.id}
                      variant="outline"
                      className="w-full text-right justify-start text-sm h-auto p-3 bg-transparent"
                      onClick={() => handleFAQClick(faq)}
                    >
                      {faq.question}
                    </Button>
                  ))}
                  {faqs.length === 0 && <p className="text-center text-gray-500 text-sm">سوالی موجود نیست</p>}
                </div>
              </div>
            )}

            {currentView === "products" && (
              <div className="flex-1 overflow-y-auto p-3">
                <h3 className="font-medium mb-3 text-center">محصولات</h3>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3">
                      {product.image_url && (
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      )}
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="text-xs">
                          {product.price}
                        </Badge>
                        {product.product_url && (
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(product.product_url, "_blank")}
                            style={{ backgroundColor: primaryColor, color: textColor }}
                          >
                            مشاهده
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-center text-gray-500 text-sm">محصولی موجود نیست</p>}
                </div>
              </div>
            )}

            {currentView === "ticket" && (
              <div className="flex-1 overflow-y-auto p-3">
                <h3 className="font-medium mb-3 text-center">ارسال تیکت پشتیبانی</h3>

                {userTickets.length === 0 && !userPhone && (
                  <form onSubmit={handlePhoneSubmit} className="mb-4">
                    <Label htmlFor="phone" className="text-sm">
                      شماره تلفن برای مشاهده تیکت‌های قبلی:
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="phone"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="09123456789"
                        className="text-sm"
                      />
                      <Button type="submit" size="sm">
                        بررسی
                      </Button>
                    </div>
                  </form>
                )}

                {userTickets.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">تیکت‌های شما:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {userTickets.map((ticket: any) => (
                        <div key={ticket.id} className="border rounded p-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-medium">{ticket.subject}</span>
                            <Badge variant={ticket.status === "open" ? "destructive" : "secondary"} className="text-xs">
                              {ticket.status === "open" ? "باز" : "بسته"}
                            </Badge>
                          </div>
                          {ticket.admin_response && <p className="text-xs text-green-600 mt-1">✓ پاسخ داده شده</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleTicketSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="name" className="text-xs">
                        نام
                      </Label>
                      <Input
                        id="name"
                        value={ticketForm.name}
                        onChange={(e) => setTicketForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs">
                        تلفن
                      </Label>
                      <Input
                        id="phone"
                        value={ticketForm.phone}
                        onChange={(e) => setTicketForm((prev) => ({ ...prev, phone: e.target.value }))}
                        required
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs">
                      ایمیل
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-xs">
                      موضوع
                    </Label>
                    <Input
                      id="subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-xs">
                      پیام
                    </Label>
                    <Textarea
                      id="message"
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm((prev) => ({ ...prev, message: e.target.value }))}
                      required
                      className="text-sm h-16"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image" className="text-xs">
                      تصویر (اختیاری)
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setTicketForm((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
                      className="text-sm"
                      ref={fileInputRef}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-sm"
                    disabled={isLoading}
                    style={{ backgroundColor: primaryColor, color: textColor }}
                  >
                    {isLoading ? "در حال ارسال..." : "ارسال تیکت"}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
