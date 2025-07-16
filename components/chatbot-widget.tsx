"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Send, Minimize2, Maximize2 } from "lucide-react"
import type React from "react"
import { useChat } from "ai/react"
import { ExternalLink, Star, Search } from "lucide-react"
import { findMatchingProducts } from "@/lib/product-matcher"
import { cn } from "@/lib/utils"

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
  emoji: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  button_text: string
  secondary_text: string
  product_url: string
}

interface ChatbotConfig {
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
  knowledge_base_text: string
  knowledge_base_url: string
  store_url: string
  ai_url: string
}

interface ChatbotWidgetProps {
  chatbotId: number
  config?: ChatbotConfig
}

interface SuggestedProduct {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  button_text: string
}

interface NextSuggestion {
  text: string
  emoji: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestedProducts?: SuggestedProduct[]
  nextSuggestions?: NextSuggestion[]
  isProcessingProducts?: boolean
}

const POPULAR_EMOJIS = ["😊", "👍", "❤️", "😂", "🙏", "👌", "🔥", "💯", "🎉", "✨"]
const NOTIFICATION_SOUND_URL = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"

export default function ChatbotWidget({ chatbotId, config }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(config || null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showFAQs, setShowFAQs] = useState(true)
  const [showProducts, setShowProducts] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<"ai" | "store" | "ticket">("ai")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [suggestedProductsAI, setSuggestedProducts] = useState<SuggestedProduct[]>([])
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())
  const [copiedMessages, setCopiedMessages] = useState<Set<string>>(new Set())
  const [processingProductsForMessage, setProcessingProductsForMessage] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)

  // Get user IP for tracking
  const getUserIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch {
      return "unknown"
    }
  }

  useEffect(() => {
    const fetchChatbotData = async () => {
      if (!config) {
        try {
          const response = await fetch(`/api/chatbots/${chatbotId}`)
          if (response.ok) {
            const data = await response.json()
            setChatbotConfig(data.chatbot)
            setFaqs(data.faqs || [])
            setProducts(data.products || [])
          }
        } catch (error) {
          console.error("Error fetching chatbot data:", error)
        }
      } else {
        // If config is provided, fetch FAQs and products separately
        try {
          const [faqsResponse, productsResponse] = await Promise.all([
            fetch(`/api/chatbots/${chatbotId}/faqs`),
            fetch(`/api/chatbots/${chatbotId}/products`),
          ])

          if (faqsResponse.ok) {
            const faqsData = await faqsResponse.json()
            setFaqs(faqsData)
          }

          if (productsResponse.ok) {
            const productsData = await productsResponse.json()
            setProducts(productsData)
          }
        } catch (error) {
          console.error("Error fetching FAQs and products:", error)
        }
      }
    }

    fetchChatbotData()
  }, [chatbotId, config])

  useEffect(() => {
    if (isOpen && chatbotConfig && messages.length === 0) {
      // Add welcome message when chat opens
      const welcomeMessage: Message = {
        id: "welcome",
        text: chatbotConfig.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, chatbotConfig])

  useEffect(() => {
    // Handle mobile viewport and keyboard
    const handleResize = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [])

  useEffect(() => {
    notificationAudioRef.current = new Audio(NOTIFICATION_SOUND_URL)
    notificationAudioRef.current.volume = 0.3
  }, [])

  useEffect(() => {
    const savedHistory = localStorage.getItem(`chatbot-${chatbotId}-history`)
    const savedSuggestions = localStorage.getItem(`chatbot-${chatbotId}-suggestions`)

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setChatHistory(parsedHistory)
      } catch (error) {
        console.error("Error loading chat history:", error)
      }
    } else if (chatbotConfig?.welcome_message) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: chatbotConfig.welcome_message,
        timestamp: new Date(),
      }
      setChatHistory([welcomeMessage])
    }

    if (savedSuggestions) {
      try {
        const parsedSuggestions = JSON.parse(savedSuggestions)
        setSuggestedProducts(parsedSuggestions)
        setSuggestionCount(parsedSuggestions.length)
      } catch (error) {
        console.error("Error loading suggestions:", error)
      }
    }
  }, [chatbotId, chatbotConfig?.welcome_message])

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(`chatbot-${chatbotId}-history`, JSON.stringify(chatHistory))
    }
  }, [chatHistory, chatbotId])

  useEffect(() => {
    localStorage.setItem(`chatbot-${chatbotId}-suggestions`, JSON.stringify(suggestedProductsAI))
  }, [suggestedProductsAI, chatbotId])

  // Ultra-fast JSON processing with instant extraction
  const processMessageInstantly = (content: string) => {
    let matchedProducts: SuggestedProduct[] = []
    let nextSuggestions: NextSuggestion[] = []
    let cleanContent = content

    // Lightning-fast regex extraction
    try {
      // Extract products instantly
      const productRegex = /SUGGESTED_PRODUCTS:\s*(\[.*?\])/
      const productMatch = content.match(productRegex)
      if (productMatch) {
        try {
          matchedProducts = JSON.parse(productMatch[1])
          cleanContent = cleanContent.replace(productRegex, "").trim()
        } catch (e) {
          console.error("Product parsing error:", e)
        }
      }

      // Extract suggestions instantly
      const suggestionRegex = /NEXT_SUGGESTIONS:\s*(\[.*?\])/
      const suggestionMatch = content.match(suggestionRegex)
      if (suggestionMatch) {
        try {
          nextSuggestions = JSON.parse(suggestionMatch[1])
          cleanContent = cleanContent.replace(suggestionRegex, "").trim()
        } catch (e) {
          console.error("Suggestion parsing error:", e)
        }
      }

      // Ultra-fast cleanup
      cleanContent = cleanContent
        .replace(/SUGGESTED_PRODUCTS.*$/s, "")
        .replace(/NEXT_SUGGESTIONS.*$/s, "")
        .replace(/\[.*?\]/g, "")
        .replace(/\{.*?\}/g, "")
        .trim()
    } catch (error) {
      console.error("Processing error:", error)
    }

    return { cleanContent, matchedProducts, nextSuggestions }
  }

  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isAiLoading,
    append,
  } = useChat({
    api: "/api/chat",
    body: { chatbotId: chatbotId },
    initialMessages: chatHistory.map((msg) => ({ id: msg.id, role: msg.role, content: msg.content })),
    onResponse: () => {
      setShowFAQs(false)
      playNotificationSound()
    },
    onFinish: (message) => {
      // First add the message to chat history
      const { cleanContent, matchedProducts, nextSuggestions } = processMessageInstantly(message.content)

      // Add message without products first
      const newMessage: ChatMessage = {
        id: message.id,
        role: "assistant",
        content: cleanContent,
        timestamp: new Date(),
        isProcessingProducts: true, // Show that we're processing products
      }

      setChatHistory((prev) => [...prev, newMessage])

      // Start product processing
      setProcessingProductsForMessage(message.id)

      // Simulate product processing delay
      setTimeout(() => {
        // Only use fallback matching if AI didn't suggest products AND user has strong intent
        let finalProducts = matchedProducts
        if (finalProducts.length === 0) {
          const lastUserMessage = aiMessages[aiMessages.length - 1]?.content || ""
          if (lastUserMessage.trim()) {
            // Use our strict matching system
            finalProducts = findMatchingProducts(lastUserMessage, products)
          }
        }

        // Update the message with products
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? {
                  ...msg,
                  suggestedProducts: finalProducts.length > 0 ? finalProducts : undefined,
                  nextSuggestions: nextSuggestions.length > 0 ? nextSuggestions : undefined,
                  isProcessingProducts: false,
                }
              : msg,
          ),
        )

        // Update suggested products for store tab (only if we have products)
        if (finalProducts.length > 0) {
          setSuggestedProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const newProducts = finalProducts.filter((p) => !existingIds.has(p.id))
            const updated = [...newProducts, ...prev].slice(0, 4) // Reduced to max 4
            setSuggestionCount(updated.length)
            return updated
          })
        }

        setProcessingProductsForMessage(null)
      }, 1500) // 1.5 second delay for product processing

      playNotificationSound()
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setProcessingProductsForMessage(null)
    },
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const playNotificationSound = () => {
    if (isSoundEnabled && notificationAudioRef.current) {
      notificationAudioRef.current.play().catch(console.error)
    }
  }

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp)
  }

  const handleLike = (messageId: string) => {
    setLikedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        setDislikedMessages((prevDisliked) => {
          const newDislikedSet = new Set(prevDisliked)
          newDislikedSet.delete(messageId)
          return newDislikedSet
        })
      }
      return newSet
    })
  }

  const handleDislike = (messageId: string) => {
    setDislikedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        setLikedMessages((prevLiked) => {
          const newLikedSet = new Set(prevLiked)
          newLikedSet.delete(messageId)
          return newLikedSet
        })
      }
      return newSet
    })
  }

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessages((prev) => new Set(prev).add(messageId))
      setTimeout(() => {
        setCopiedMessages((prev) => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
      }, 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const clearChatHistory = () => {
    setChatHistory([])
    setSuggestedProducts([])
    setSuggestionCount(0)
    setLikedMessages(new Set())
    setDislikedMessages(new Set())
    setCopiedMessages(new Set())
    setProcessingProductsForMessage(null)
    localStorage.removeItem(`chatbot-${chatbotId}-history`)
    localStorage.removeItem(`chatbot-${chatbotId}-suggestions`)
    window.location.reload()
  }

  const handleEmojiClick = (emoji: string) => {
    const target = inputRef.current
    if (target) {
      const newValue = target.value + emoji
      handleInputChange({ target: { value: newValue } } as any)
    }
    setShowEmojiPicker(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data)
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const transcribedText = "متن تبدیل شده از صدا"
        append({ role: "user", content: transcribedText })
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFAQClickAI = (faq: (typeof faqs)[0]) => {
    setShowFAQs(false)
    append({ role: "user", content: faq.question })
  }

  const handleSuggestionClick = (suggestion: NextSuggestion) => {
    append({ role: "user", content: suggestion.text })
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    setShowFAQs(false)
    handleSubmit(e)
  }

  const handleClose = () => window.parent.postMessage({ type: "orion-chatbot-close" }, "*")

  const handleTabChange = (tab: "ai" | "store" | "ticket") => {
    setActiveTab(tab)
    if (tab === "store") setSuggestionCount(0)
  }

  const handleProductClick = (product: any) => {
    if (product.product_url) {
      window.open(product.product_url, "_blank", "noopener,noreferrer")
    }
  }

  const ProductSearchingLoader = () => (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 rounded-xl border border-blue-200 mx-2 mt-2">
      <Search className="w-4 h-4 text-blue-500 animate-pulse" />
      <span className="text-sm text-blue-600 font-medium">در حال پیدا کردن بهترین محصول برای شما</span>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
    </div>
  )

  const ProductCard = ({
    product,
    isCompact = false,
    isSuggested = false,
  }: { product: any; isCompact?: boolean; isSuggested?: boolean }) => {
    if (isCompact) {
      return (
        <div
          className={cn(
            "bg-white rounded-xl border p-3 hover:shadow-md transition-all duration-200 cursor-pointer group shadow-sm",
            isSuggested ? "border-blue-200" : "border-gray-200",
          )}
          onClick={() => handleProductClick(product)}
        >
          {isSuggested && (
            <div className="flex items-center gap-1 mb-2 bg-blue-50 rounded-md px-2 py-1">
              <Star className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">پیشنهاد هوشمند</span>
            </div>
          )}
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={product.image_url || "/placeholder.svg?height=48&width=48"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=48&width=48&text=محصول"
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                {product.price && (
                  <span className="text-xs font-bold text-green-600">
                    {new Intl.NumberFormat("fa-IR").format(product.price)} تومان
                  </span>
                )}
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          "bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group shadow-sm",
          isSuggested ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-200",
        )}
        onClick={() => handleProductClick(product)}
      >
        {isSuggested && (
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs px-3 py-1 flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>پیشنهاد ویژه</span>
          </div>
        )}
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={product.image_url || "/placeholder.svg?height=200&width=300"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=300&text=محصول"
            }}
          />
        </div>
        <div className="p-3 bg-white">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">{product.name}</h3>
          {product.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>}
          <div className="flex items-center justify-between">
            {product.price && (
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-green-600">
                  {new Intl.NumberFormat("fa-IR").format(product.price)}
                </span>
                <span className="text-xs text-gray-500">تومان</span>
              </div>
            )}
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7">
              {product.button_text || "خرید"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !chatbotConfig) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setShowFAQs(false)
    setShowProducts(false)

    try {
      const userIP = await getUserIP()

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText.trim(),
          chatbotId: chatbotConfig.id,
          userIp: userIP,
        }),
      })

      if (!response.ok) {
        throw new Error("خطا در ارسال پیام")
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFAQClick = (faq: FAQ) => {
    sendMessage(faq.question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  if (!chatbotConfig) {
    return null
  }

  const getPositionStyles = () => {
    const margin = {
      x: chatbotConfig.margin_x || 20,
      y: chatbotConfig.margin_y || 20,
    }

    switch (chatbotConfig.position) {
      case "bottom-left":
        return { bottom: margin.y, left: margin.x }
      case "bottom-right":
        return { bottom: margin.y, right: margin.x }
      case "top-left":
        return { top: margin.y, left: margin.x }
      case "top-right":
        return { top: margin.y, right: margin.x }
      default:
        return { bottom: margin.y, right: margin.x }
    }
  }

  return (
    <div className="fixed z-50" style={getPositionStyles()}>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          style={{
            backgroundColor: chatbotConfig.primary_color,
            color: chatbotConfig.text_color,
          }}
        >
          <span className="text-2xl">{chatbotConfig.chat_icon}</span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={`w-80 shadow-2xl transition-all duration-300 ${isMinimized ? "h-14" : "h-96"}`}
          style={{ backgroundColor: chatbotConfig.background_color }}
        >
          {/* Header */}
          <CardHeader className="py-3 px-4 rounded-t-lg" style={{ backgroundColor: chatbotConfig.primary_color }}>
            <div className="flex items-center justify-between">
              <CardTitle
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: chatbotConfig.text_color }}
              >
                <span>{chatbotConfig.chat_icon}</span>
                {chatbotConfig.name}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                  style={{ color: chatbotConfig.text_color }}
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                  style={{ color: chatbotConfig.text_color }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-80">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        message.isUser ? "text-white" : "bg-gray-100 text-gray-800"
                      }`}
                      style={message.isUser ? { backgroundColor: chatbotConfig.primary_color } : {}}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {/* FAQs */}
                {showFAQs && faqs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 text-center">
                      {chatbotConfig.navigation_message || "سوالات متداول:"}
                    </p>
                    {faqs.slice(0, 3).map((faq) => (
                      <Button
                        key={faq.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleFAQClick(faq)}
                        className="w-full text-xs h-auto py-2 px-3 justify-start"
                      >
                        <span className="ml-2">{faq.emoji}</span>
                        {faq.question}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Products */}
                {showProducts && products.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 text-center">محصولات پیشنهادی:</p>
                    {products.slice(0, 2).map((product) => (
                      <div key={product.id} className="border rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          {product.image_url && (
                            <img
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-xs font-medium">{product.name}</p>
                            {product.price && <p className="text-xs text-gray-500">{product.price} تومان</p>}
                          </div>
                        </div>
                        {product.product_url && (
                          <Button
                            size="sm"
                            className="w-full mt-2 text-xs"
                            style={{ backgroundColor: chatbotConfig.primary_color }}
                            onClick={() => window.open(product.product_url, "_blank")}
                          >
                            {product.button_text || "مشاهده"}
                          </Button>
                        )}
                      </div>
                    ))}
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

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="پیام خود را بنویسید..."
                    disabled={isLoading}
                    className="text-sm"
                  />
                  <Button
                    onClick={() => sendMessage(inputValue)}
                    disabled={isLoading || !inputValue.trim()}
                    size="sm"
                    style={{ backgroundColor: chatbotConfig.primary_color }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
