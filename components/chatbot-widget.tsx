"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react" // Corrected import path
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TicketForm from "./ticket-form"
import { formatTextWithLinks } from "@/lib/format-text"
import { findMatchingProducts } from "@/lib/product-matcher"
import { cn } from "@/lib/utils"
import {
  ShoppingCart,
  Send,
  X,
  MessageCircle,
  Ticket,
  Mic,
  MicOff,
  Smile,
  MoreVertical,
  Trash2,
  VolumeX,
  Volume2,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Clock,
  Search,
} from "lucide-react"

interface ChatbotWidgetProps {
  chatbot: {
    id: number
    name: string
    welcome_message: string
    navigation_message: string
    primary_color: string
    text_color: string
    background_color: string
    chat_icon: string
    position: string
    store_url?: string
    ai_url?: string
  }
  options?: Array<{
    id: number
    label: string
    emoji: string
  }>
  products?: Array<{
    id: number
    name: string
    description: string
    price: number
    image_url: string
    button_text: string
    product_url: string
  }>
  faqs?: Array<{
    id: number
    question: string
    answer: string
    emoji: string
  }>
}

interface SuggestedProduct {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  product_url: string
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

export default function ChatbotWidget({ chatbot, options = [], products = [], faqs = [] }: ChatbotWidgetProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "store" | "ticket">("ai")
  const [showFAQs, setShowFAQs] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([])
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [likedMessages, setLikedMessages] = useState(new Set<string>())
  const [dislikedMessages, setDislikedMessages] = useState(new Set<string>())
  const [copiedMessages, setCopiedMessages] = useState(new Set<string>())
  const [processingProductsForMessage, setProcessingProductsForMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)

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
    const savedHistory = localStorage.getItem(`chatbot-${chatbot.id}-history`)
    const savedSuggestions = localStorage.getItem(`chatbot-${chatbot.id}-suggestions`)

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setChatHistory(parsedHistory)
      } catch (error) {
        console.error("Error loading chat history:", error)
      }
    } else if (chatbot.welcome_message) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: chatbot.welcome_message,
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
  }, [chatbot.id, chatbot.welcome_message])

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(`chatbot-${chatbot.id}-history`, JSON.stringify(chatHistory))
    }
  }, [chatHistory, chatbot.id])

  useEffect(() => {
    localStorage.setItem(`chatbot-${chatbot.id}-suggestions`, JSON.stringify(suggestedProducts))
  }, [suggestedProducts, chatbot.id])

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

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/chat",
    body: { chatbotId: chatbot.id },
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
          const lastUserMessage = messages[messages.length - 1]?.content || ""
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

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(scrollToBottom, [messages, processingProductsForMessage])

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
    localStorage.removeItem(`chatbot-${chatbot.id}-history`)
    localStorage.removeItem(`chatbot-${chatbot.id}-suggestions`)
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

  const handleFAQClick = (faq: (typeof faqs)[0]) => {
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

  return (
    <div
      className="w-full flex flex-col overflow-hidden font-sans sm:shadow-2xl sm:rounded-2xl"
      dir="rtl"
      style={{
        fontFamily: "'Vazirmatn', sans-serif",
        height: "100vh",
        maxHeight: "100vh",
      }}
    >
      {/* Header: Fixed, does not shrink */}
      <header
        className="px-4 py-2 flex items-center justify-between flex-shrink-0 sm:rounded-t-2xl"
        style={{
          backgroundColor: chatbot.primary_color,
          minHeight: "max(60px, env(safe-area-inset-top, 0px) + 60px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl">{chatbot.chat_icon || "💬"}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{chatbot.name}</h3>
            <p className="text-white/80 text-xs">آنلاین</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem onClick={clearChatHistory} className="text-red-600">
                <Trash2 className="w-4 h-4 ml-2" /> پاک کردن حافظه مکالمه
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
                {isSoundEnabled ? (
                  <>
                    <VolumeX className="w-4 h-4 ml-2" /> خاموش کردن صدا
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 ml-2" /> روشن کردن صدا
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Content Area: Flexible, scrollable */}
      <main
        className="flex-1 min-h-0 overflow-y-auto"
        style={{
          backgroundColor: chatbot.background_color || "#f9fafb",
          height: "calc(100vh - max(60px, env(safe-area-inset-top, 0px) + 60px) - 140px)",
          maxHeight: "calc(100vh - max(60px, env(safe-area-inset-top, 0px) + 60px) - 140px)",
        }}
      >
        {activeTab === "ai" && (
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" ? (
                    <div className="flex items-start gap-3 max-w-[85%]">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                        style={{ backgroundColor: chatbot.primary_color }}
                      >
                        {chatbot.chat_icon || "💬"}
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm border">
                          <div className="text-sm text-gray-800 leading-relaxed">
                            {formatTextWithLinks(processMessageInstantly(message.content).cleanContent)}
                          </div>
                        </div>
                        {/* Message Actions Bar */}
                        <div className="flex items-center gap-2 px-2">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(new Date())}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleLike(message.id)}
                              className={cn(
                                "p-1 rounded-full transition-all duration-200 hover:scale-110",
                                likedMessages.has(message.id)
                                  ? "text-green-500 bg-green-50"
                                  : "text-gray-400 hover:text-green-500 hover:bg-green-50",
                              )}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDislike(message.id)}
                              className={cn(
                                "p-1 rounded-full transition-all duration-200 hover:scale-110",
                                dislikedMessages.has(message.id)
                                  ? "text-red-500 bg-red-50"
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50",
                              )}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                handleCopy(message.id, processMessageInstantly(message.content).cleanContent)
                              }
                              className={cn(
                                "p-1 rounded-full transition-all duration-200 hover:scale-110",
                                copiedMessages.has(message.id)
                                  ? "text-blue-500 bg-blue-50"
                                  : "text-gray-400 hover:text-blue-500 hover:bg-blue-50",
                              )}
                            >
                              {copiedMessages.has(message.id) ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-w-[90%]">
                      <div
                        className="rounded-2xl rounded-tl-md px-4 py-3 text-white text-sm shadow-sm"
                        style={{ backgroundColor: chatbot.primary_color }}
                      >
                        {message.content}
                      </div>
                      {/* User Message Time */}
                      <div className="flex justify-end px-2">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Check className="w-3 h-3" />
                          <span>{formatTime(new Date())}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Processing Loading - Show after AI message */}
                {message.role === "assistant" && processingProductsForMessage === message.id && (
                  <ProductSearchingLoader />
                )}

                {/* نمایش محصولات و سوالات پیشنهادی */}
                {message.role === "assistant" && (
                  <>
                    {chatHistory.find((msg) => msg.id === message.id)?.suggestedProducts && (
                      <div className="mt-3 space-y-2 w-11/12 mx-auto">
                        <div className="flex items-center gap-2 px-2">
                          <Star className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-blue-600 font-medium">محصولات پیشنهادی برای شما:</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {chatHistory
                            .find((msg) => msg.id === message.id)
                            ?.suggestedProducts?.slice(0, 2) // Reduced to max 2
                            .map((product) => (
                              <ProductCard key={product.id} product={product} isCompact={true} isSuggested={true} />
                            ))}
                        </div>
                      </div>
                    )}

                    {/* باکس‌های سوالات پیشنهادی گردتر */}
                    {chatHistory.find((msg) => msg.id === message.id)?.nextSuggestions && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 px-2">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-green-600 font-medium">سوالات پیشنهادی:</p>
                        </div>
                        <div className="space-y-1.5">
                          {chatHistory
                            .find((msg) => msg.id === message.id)
                            ?.nextSuggestions?.slice(0, 3) // Max 3 suggestions
                            .map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full h-auto p-3 text-right justify-start bg-white hover:bg-green-50 border border-green-200 rounded-2xl text-sm transition-all duration-200 hover:shadow-sm min-h-[44px]"
                              >
                                <div className="flex items-center gap-2.5 w-full">
                                  <span className="text-lg flex-shrink-0">{suggestion.emoji}</span>
                                  <span className="text-gray-700 font-medium leading-snug text-right flex-1 whitespace-normal break-words">
                                    {suggestion.text}
                                  </span>
                                </div>
                              </Button>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: chatbot.primary_color }}
                  >
                    {chatbot.chat_icon || "💬"}
                  </div>
                  <div className="bg-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm border">
                    <div className="flex gap-1 items-center">
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
              </div>
            )}
            {showFAQs && messages.length <= 1 && faqs.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    {faqs.slice(0, 4).map((faq) => (
                      <Button
                        key={faq.id}
                        variant="outline"
                        onClick={() => handleFAQClick(faq)}
                        className="h-auto px-3 py-2.5 text-right justify-start bg-white hover:bg-white border-0 rounded-2xl text-xs transition-all duration-300 hover:scale-105 group w-full"
                        style={{
                          boxShadow: `0 4px 12px ${chatbot.primary_color}35, 0 2px 5px ${chatbot.primary_color}25`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = `0 6px 20px ${chatbot.primary_color}45, 0 3px 8px ${chatbot.primary_color}35`
                          e.currentTarget.style.backgroundColor = `${chatbot.primary_color}05`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = `0 4px 12px ${chatbot.primary_color}35, 0 2px 5px ${chatbot.primary_color}25`
                          e.currentTarget.style.backgroundColor = "white"
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base group-hover:scale-110 transition-transform duration-200">
                            {faq.emoji}
                          </span>
                          <span className="text-gray-700 font-medium leading-tight text-right">{faq.question}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === "store" && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">فروشگاه محصولات</h3>
              <p className="text-sm text-gray-600">محصولات ما را مشاهده کنید</p>
            </div>

            {/* Suggested Products Section */}
            {suggestedProducts.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-orange-500" />
                  <h4 className="text-md font-semibold text-gray-800">پیشنهادات ویژه شما</h4>
                  <div className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                    {suggestedProducts.length} محصول
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {suggestedProducts.slice(0, 4).map((product) => (
                    <ProductCard key={`suggested-${product.id}`} product={product} isSuggested={true} />
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">سایر محصولات</h4>
                </div>
              </div>
            )}

            {/* All Products Section */}
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products
                  .filter((product) => !suggestedProducts.some((sp) => sp.id === product.id))
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🛍️</div>
                <p className="text-gray-500">هیچ محصولی در حال حاضر موجود نیست</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "ticket" && (
          <div className="p-4">
            <TicketForm chatbotId={chatbot.id} onClose={() => {}} />
          </div>
        )}
      </main>

      {/* Footer: Fixed, does not shrink */}
      <footer
        className="flex-shrink-0 bg-white border-t border-gray-100"
        style={{
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
          position: "sticky",
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div className="flex">
          <button
            onClick={() => handleTabChange("ai")}
            className={cn(
              "flex-1 flex flex-col items-center py-3 text-xs transition-colors",
              activeTab === "ai" ? "text-gray-800 border-b-2" : "text-gray-400 hover:text-gray-600",
            )}
            style={{ borderBottomColor: activeTab === "ai" ? chatbot.primary_color : "transparent" }}
          >
            <MessageCircle className="w-5 h-5 mb-1" />
            <span>هوش مصنوعی</span>
          </button>
          <button
            onClick={() => handleTabChange("store")}
            className={cn(
              "flex-1 flex flex-col items-center py-3 text-xs transition-colors relative",
              activeTab === "store" ? "text-gray-800 border-b-2" : "text-gray-400 hover:text-gray-600",
            )}
            style={{ borderBottomColor: activeTab === "store" ? chatbot.primary_color : "transparent" }}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-1" />
              {(products && products.length > 0) || suggestedProducts.length > 0 ? (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {(products?.length || 0) + suggestedProducts.length}
                </div>
              ) : null}
            </div>
            <span>فروشگاه</span>
          </button>
          <button
            onClick={() => handleTabChange("ticket")}
            className={cn(
              "flex-1 flex flex-col items-center py-3 text-xs transition-colors relative",
              activeTab === "ticket" ? "text-gray-800 border-b-2" : "text-gray-400 hover:text-gray-600",
            )}
            style={{ borderBottomColor: activeTab === "ticket" ? chatbot.primary_color : "transparent" }}
          >
            <Ticket className="w-5 h-5 mb-1" />
            <span>تیکت</span>
          </button>
        </div>
        {activeTab === "ai" && (
          <div className="p-3">
            {showEmojiPicker && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl border">
                <div className="grid grid-cols-5 gap-2">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-xl p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleFormSubmit}>
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 min-h-[44px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 border-0 bg-transparent text-sm placeholder:text-gray-500 focus-visible:ring-0 h-8 text-gray-900"
                  disabled={isLoading}
                  style={{ color: "#111827" }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  className={cn(
                    "p-1 h-8 w-8 rounded-full transition-colors",
                    isRecording
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200",
                  )}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="rounded-full w-8 h-8 p-0 transition-all"
                  style={{ backgroundColor: !input.trim() || isLoading ? "#9CA3AF" : chatbot.primary_color }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400">ارائه شده توسط {chatbot.name}</p>
            </div>
          </div>
        )}
      </footer>
    </div>
  )
}
