"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useChat } from "ai/react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TicketForm from "./ticket-form"
import UserTicketsView from "./user-tickets-view"
import { formatTextWithLinks } from "@/lib/format-text"
import { findMatchingProducts } from "@/lib/product-matcher"
import { cn } from "@/lib/utils"

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
  const [ticketView, setTicketView] = useState<"form" | "list">("form")
  const [userPhone, setUserPhone] = useState("")
  const [showFAQs, setShowFAQs] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([])
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())
  const [copiedMessages, setCopiedMessages] = useState<Set<string>>(new Set())
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
    if (tab === "ticket") {
      setTicketView("form")
      setUserPhone("")
    }
  }

  const handleProductClick = (product: any) => {
    if (product.product_url) {
      window.open(product.product_url, "_blank", "noopener,noreferrer")
    }
  }

  const handleShowTickets = (phone: string) => {
    setUserPhone(phone)
    setTicketView("list")
  }

  const handleBackToForm = () => {
    setTicketView("form")
    setUserPhone("")
  }

  const ProductSearchingLoader = () => (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 mx-2 mt-2">
      <Search className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-pulse" />
      <span className="text-sm text-blue-600 dark:text-blue-300 font-medium">
        در حال پیدا کردن بهترین محصول برای شما
      </span>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
        <div
          className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
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
            "bg-white dark:bg-gray-800 rounded-xl border p-3 hover:shadow-md transition-all duration-200 cursor-pointer group shadow-sm",
            isSuggested ? "border-blue-200 dark:border-blue-800" : "border-gray-200 dark:border-gray-700",
          )}
          onClick={() => handleProductClick(product)}
        >
          {isSuggested && (
            <div className="flex items-center gap-1 mb-2 bg-blue-50 dark:bg-blue-900/30 rounded-md px-2 py-1">
              <Star className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">پیشنهاد هوشمند</span>
            </div>
          )}
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
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
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs mb-1 line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                {product.price && (
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">
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
          "bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group shadow-sm",
          isSuggested
            ? "border-orange-200 dark:border-orange-800 ring-1 ring-orange-100 dark:ring-orange-900"
            : "border-gray-200 dark:border-gray-700",
        )}
        onClick={() => handleProductClick(product)}
      >
        {isSuggested && (
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs px-3 py-1 flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>پیشنهاد ویژه</span>
          </div>
        )}
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
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
        <div className="p-3 bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm line-clamp-2">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            {product.price && (
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat("fa-IR").format(product.price)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">تومان</span>
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
      className="w-full flex flex-col overflow-hidden font-sans sm:shadow-2xl sm:rounded-2xl bg-white dark:bg-gray-900"
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
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <DropdownMenuItem onClick={clearChatHistory} className="text-red-600 dark:text-red-400">
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
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
                                  ? "text-green-500 bg-green-50 dark:bg-green-900/30"
                                  : "text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30",
                              )}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDislike(message.id)}
                              className={cn(
                                "p-1 rounded-full transition-all duration-200 hover:scale-110",
                                dislikedMessages.has(message.id)
                                  ? "text-red-500 bg-red-50 dark:bg-red-900/30"
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30",
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
                                  ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                  : "text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30",
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

                {/* Show product searching loader */}
                {processingProductsForMessage === message.id && <ProductSearchingLoader />}

                {/* Show suggested products */}
                {message.role === "assistant" && (
                  <>
                    {(() => {
                      const chatMessage = chatHistory.find((msg) => msg.id === message.id)
                      return chatMessage?.suggestedProducts && chatMessage.suggestedProducts.length > 0 ? (
                        <div className="mr-11 mt-3">
                          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Star className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                                محصولات پیشنهادی
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {chatMessage.suggestedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} isCompact={true} isSuggested={true} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null
                    })()}

                    {/* Show next suggestions */}
                    {(() => {
                      const chatMessage = chatHistory.find((msg) => msg.id === message.id)
                      return chatMessage?.nextSuggestions && chatMessage.nextSuggestions.length > 0 ? (
                        <div className="mr-11 mt-3">
                          <div className="flex flex-wrap gap-2">
                            {chatMessage.nextSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:scale-105"
                              >
                                {suggestion.emoji} {suggestion.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null
                    })()}
                  </>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: chatbot.primary_color }}
                  >
                    {chatbot.chat_icon || "💬"}
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
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

            {/* FAQ Section */}
            {showFAQs && faqs.length > 0 && (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">سوالات متداول:</p>
                </div>
                <div className="grid gap-2">
                  {faqs.slice(0, 4).map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFAQClick(faq)}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-right transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{faq.emoji}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {faq.question}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === "store" && (
          <div className="p-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">فروشگاه محصولات</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">محصولات پیشنهادی و کاتالوگ کامل</p>
            </div>

            {/* Suggested Products Section */}
            {suggestedProducts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">پیشنهادات هوشمند</h4>
                  <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full text-xs font-medium">
                    {suggestedProducts.length} محصول
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {suggestedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} isSuggested={true} />
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    تمام محصولات
                  </h4>
                </div>
              </div>
            )}

            {/* All Products */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">محصولی یافت نشد</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">در حال حاضر محصولی در فروشگاه موجود نیست</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "ticket" && (
          <div className="p-4">
            {ticketView === "form" ? (
              <TicketForm chatbotId={chatbot.id} onClose={handleClose} onShowTickets={handleShowTickets} />
            ) : (
              <UserTicketsView chatbotId={chatbot.id} phone={userPhone} onBack={handleBackToForm} />
            )}
          </div>
        )}
      </main>

      {/* Footer: Fixed, does not shrink */}
      <footer
        className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sm:rounded-b-2xl"
        style={{
          minHeight: "max(140px, env(safe-area-inset-bottom, 0px) + 140px)",
        }}
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange("ai")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors relative",
              activeTab === "ai"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>چت هوشمند</span>
            </div>
            {activeTab === "ai" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: chatbot.primary_color }}
              />
            )}
          </button>
          <button
            onClick={() => handleTabChange("store")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors relative",
              activeTab === "store"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>فروشگاه</span>
              {suggestionCount > 0 && (
                <div className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {suggestionCount}
                </div>
              )}
            </div>
            {activeTab === "store" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: chatbot.primary_color }}
              />
            )}
          </button>
          <button
            onClick={() => handleTabChange("ticket")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium transition-colors relative",
              activeTab === "ticket"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" />
              <span>پشتیبانی</span>
            </div>
            {activeTab === "ticket" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: chatbot.primary_color }}
              />
            )}
          </button>
        </div>

        {/* Input Area - Only show for AI tab */}
        {activeTab === "ai" && (
          <div className="p-4">
            <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="پیام خود را بنویسید..."
                  className="pr-4 pl-12 py-3 rounded-2xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none min-h-[44px] max-h-[120px]"
                  disabled={isLoading}
                />
                <div className="absolute left-2 bottom-2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-8 h-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className={cn(
                      "w-8 h-8 transition-colors",
                      isRecording
                        ? "text-red-500 bg-red-50 dark:bg-red-900/30"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                    )}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 rounded-2xl flex-shrink-0 text-white"
                style={{ backgroundColor: chatbot.primary_color }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg z-50">
                <div className="grid grid-cols-10 gap-2">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  )
}
