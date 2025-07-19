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
  Smile,
  MoreVertical,
  Trash2,
  VolumeX,
  Volume2,
  ExternalLink,
  Star,
  Copy,
  Check,
  Clock,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TicketForm from "./ticket-form"
import UserTicketsView from "./user-tickets-view"
import { formatTextWithLinks } from "@/lib/format-text"
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

interface MessageExtras {
  suggestedProducts?: SuggestedProduct[]
  nextSuggestions?: NextSuggestion[]
}

const POPULAR_EMOJIS = ["😊", "👍", "❤️", "😂", "🙏", "👌", "🔥", "💯", "🎉", "✨"]
const NOTIFICATION_SOUND_URL = "/notification.wav"

export default function ChatbotWidget({ chatbot, options = [], products = [], faqs = [] }: ChatbotWidgetProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "store" | "ticket">("ai")
  const [ticketView, setTicketView] = useState<"form" | "list">("form")
  const [userPhone, setUserPhone] = useState("")
  const [showFAQs, setShowFAQs] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [storeSuggestedProducts, setStoreSuggestedProducts] = useState<SuggestedProduct[]>([])
  const [newSuggestionCount, setNewSuggestionCount] = useState(0)
  const [messageExtras, setMessageExtras] = useState<Record<string, MessageExtras>>({})
  const [copiedMessages, setCopiedMessages] = useState<Set<string>>(new Set())
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())
  const [streamingContent, setStreamingContent] = useState<string>("")
  const [isProcessingJSON, setIsProcessingJSON] = useState(false)
  const [currentMessageExtras, setCurrentMessageExtras] = useState<MessageExtras>({})
  const [cleanStreamingContent, setCleanStreamingContent] = useState<string>("")

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
    notificationAudioRef.current.volume = 0.5
  }, [])

  const playNotificationSound = () => {
    if (isSoundEnabled && notificationAudioRef.current) {
      notificationAudioRef.current.play().catch((error) => console.error("Audio play failed:", error))
    }
  }

  const processMessageContent = (content: string): { cleanContent: string } & MessageExtras => {
    const matchedProducts: SuggestedProduct[] = []
    let nextSuggestions: NextSuggestion[] = []
    let cleanContent = content

    try {
      // حذف کامل JSON blocks
      const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/gi
      const jsonMatches = content.match(jsonBlockRegex)

      if (jsonMatches) {
        jsonMatches.forEach((jsonBlock) => {
          try {
            const jsonContent = jsonBlock.replace(/```json\s*|\s*```/g, "").trim()
            const parsedData = JSON.parse(jsonContent)

            if (parsedData.SUGGESTED_PRODUCTS && Array.isArray(parsedData.SUGGESTED_PRODUCTS)) {
              // استفاده از محصولات واقعی از props
              parsedData.SUGGESTED_PRODUCTS.forEach((suggestedProduct: any) => {
                const realProduct = products.find(
                  (p) =>
                    p.name.includes(suggestedProduct.name) ||
                    suggestedProduct.name.includes(p.name) ||
                    p.id === suggestedProduct.id,
                )
                if (realProduct) {
                  matchedProducts.push({
                    id: realProduct.id,
                    name: realProduct.name,
                    description: realProduct.description,
                    price: realProduct.price,
                    image_url: realProduct.image_url,
                    product_url: realProduct.product_url,
                    button_text: realProduct.button_text,
                  })
                }
              })
            }
            if (parsedData.NEXT_SUGGESTIONS && Array.isArray(parsedData.NEXT_SUGGESTIONS)) {
              nextSuggestions = [...nextSuggestions, ...parsedData.NEXT_SUGGESTIONS]
            }

            // حذف کامل JSON block از محتوا
            cleanContent = cleanContent.replace(jsonBlock, "").trim()
          } catch (e) {
            console.error("JSON parsing error:", e)
            // در صورت خطا، JSON را حذف می‌کنیم
            cleanContent = cleanContent.replace(jsonBlock, "").trim()
          }
        })
      }

      // حذف SUGGESTED_PRODUCTS و NEXT_SUGGESTIONS بدون JSON block
      const productRegex = /SUGGESTED_PRODUCTS:\s*(\[[\s\S]*?\])/gi
      const suggestionRegex = /NEXT_SUGGESTIONS:\s*(\[[\s\S]*?\])/gi

      cleanContent = cleanContent.replace(productRegex, "").trim()
      cleanContent = cleanContent.replace(suggestionRegex, "").trim()

      // پردازش لینک‌های محصولات در متن
      products.forEach((product) => {
        if (product.product_url && cleanContent.includes(product.name)) {
          const productLinkRegex = new RegExp(`\\b${product.name}\\b`, "gi")
          cleanContent = cleanContent.replace(productLinkRegex, `[${product.name}](${product.product_url})`)
        }
      })
    } catch (error) {
      console.error("Processing error:", error)
    }

    return { cleanContent, suggestedProducts: matchedProducts, nextSuggestions }
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages } = useChat({
    id: `chatbot-${chatbot.id}`,
    api: "/api/chat",
    body: { chatbotId: chatbot.id },
    onResponse: () => {
      setShowFAQs(false)
      playNotificationSound()
      setStreamingContent("")
      setCleanStreamingContent("")
      setIsProcessingJSON(false)
      setCurrentMessageExtras({})
    },
    onChunk: (chunk) => {
      if (chunk.type === "text-delta") {
        const newContent = streamingContent + chunk.text
        setStreamingContent(newContent)

        // تشخیص شروع JSON
        const hasJsonStart =
          newContent.includes("```json") ||
          newContent.includes("SUGGESTED_PRODUCTS:") ||
          newContent.includes("NEXT_SUGGESTIONS:")

        if (hasJsonStart && !isProcessingJSON) {
          setIsProcessingJSON(true)
        }

        // پردازش محتوا
        const { cleanContent, suggestedProducts, nextSuggestions } = processMessageContent(newContent)

        // نمایش فقط محتوای پاک
        setCleanStreamingContent(cleanContent)

        // ذخیره محصولات و سوالات فعلی
        const extras: MessageExtras = {}
        if (suggestedProducts && suggestedProducts.length > 0) {
          extras.suggestedProducts = suggestedProducts
        }
        if (nextSuggestions && nextSuggestions.length > 0) {
          extras.nextSuggestions = nextSuggestions
        }

        setCurrentMessageExtras(extras)
      }
    },
    onFinish: (message) => {
      const { cleanContent, suggestedProducts, nextSuggestions } = processMessageContent(message.content)

      // آپدیت پیام آخر با محتوای پاک شده
      setMessages((prevMessages) =>
        prevMessages.map((m) => (m.id === message.id ? { ...m, content: cleanContent } : m)),
      )

      const extras: MessageExtras = {}
      if (suggestedProducts && suggestedProducts.length > 0) {
        extras.suggestedProducts = suggestedProducts

        // افزودن به تب فروشگاه
        setStoreSuggestedProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const newProducts = suggestedProducts.filter((p) => !existingIds.has(p.id))
          if (newProducts.length > 0) {
            setNewSuggestionCount((c) => c + newProducts.length)
          }
          return [...newProducts, ...prev].slice(0, 10)
        })
      }
      if (nextSuggestions && nextSuggestions.length > 0) {
        extras.nextSuggestions = nextSuggestions
      }

      if (Object.keys(extras).length > 0) {
        setMessageExtras((prev) => ({ ...prev, [message.id]: extras }))
      }

      setStreamingContent("")
      setCleanStreamingContent("")
      setIsProcessingJSON(false)
      setCurrentMessageExtras({})
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setStreamingContent("")
      setCleanStreamingContent("")
      setIsProcessingJSON(false)
      setCurrentMessageExtras({})
    },
  })

  useEffect(() => {
    // افزودن پیام خوش‌آمدگویی در صورتی که تاریخچه خالی باشد
    if (messages.length === 0 && chatbot.welcome_message) {
      setMessages([{ id: "welcome", role: "assistant", content: chatbot.welcome_message }])
    }
  }, [chatbot.welcome_message, setMessages])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(scrollToBottom, [messages, streamingContent])

  const formatTime = (timestamp: Date | undefined) => {
    if (!timestamp || !(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
      return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(new Date())
    }
    return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(timestamp)
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

  const handleLike = (messageId: string) => {
    setLikedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        // حذف از دیسلایک اگر وجود دارد
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
        // حذف از لایک اگر وجود دارد
        setLikedMessages((prevLiked) => {
          const newLikedSet = new Set(prevLiked)
          newLikedSet.delete(messageId)
          return newLikedSet
        })
      }
      return newSet
    })
  }

  const clearChatHistory = () => {
    setMessages([])
    setMessageExtras({})
    setStoreSuggestedProducts([])
    setNewSuggestionCount(0)
    setStreamingContent("")
    setCleanStreamingContent("")
    setIsProcessingJSON(false)
    setCurrentMessageExtras({})
    setLikedMessages(new Set())
    setDislikedMessages(new Set())
    localStorage.removeItem(`chat_history_chatbot-${chatbot.id}`)
    // افزودن مجدد پیام خوش‌آمدگویی
    setMessages([{ id: "welcome", role: "assistant", content: chatbot.welcome_message }])
  }

  const handleEmojiClick = (emoji: string) => {
    inputRef.current?.focus()
    handleInputChange({ target: { value: input + emoji } } as any)
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
    if (tab === "store") setNewSuggestionCount(0)
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

  // کامپوننت لودینگ 3 نقطه‌ای
  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="flex items-start gap-3 max-w-[85%]">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
          style={{ backgroundColor: chatbot.primary_color }}
        >
          {chatbot.chat_icon || "💬"}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  )

  // کامپوننت لودینگ ویژه برای پردازش محصولات
  const ProductProcessingIndicator = () => (
    <div className="flex justify-start mt-2">
      <div className="flex items-start gap-3 max-w-[85%]">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
          style={{ backgroundColor: chatbot.primary_color }}
        >
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              در حال یافتن بهترین محصولات برای شما...
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const ProductCard = ({
    product,
    isCompact = false,
    isSuggested = false,
  }: { product: any; isCompact?: boolean; isSuggested?: boolean }) => {
    const handleProductClick = () => {
      if (product.product_url) {
        window.open(product.product_url, "_blank", "noopener,noreferrer")
      }
    }

    if (isCompact) {
      return (
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-xl border p-3 hover:shadow-md transition-all duration-200 cursor-pointer group shadow-sm",
            isSuggested ? "border-blue-200 dark:border-blue-800" : "border-gray-200 dark:border-gray-700",
          )}
          onClick={handleProductClick}
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
        onClick={handleProductClick}
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
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7"
              onClick={(e) => {
                e.stopPropagation()
                handleProductClick()
              }}
            >
              {product.button_text || "خرید"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // تابع برای نمایش محتوای در حال stream شدن
  const getDisplayContent = (message: any, isLastMessage: boolean) => {
    if (isLastMessage && isLoading && cleanStreamingContent) {
      return cleanStreamingContent
    }
    return message.content
  }

  return (
    <div
      className="w-full flex flex-col overflow-hidden font-sans sm:shadow-2xl sm:rounded-2xl bg-white dark:bg-gray-900"
      dir="rtl"
      style={{
        fontFamily: "'Vazir', sans-serif",
        height: "100vh",
        maxHeight: "100vh",
      }}
    >
      {/* Header */}
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
                <Trash2 className="w-4 h-4 ml-2" /> پاک کردن مکالمه
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
                {isSoundEnabled ? (
                  <>
                    <VolumeX className="w-4 h-4 ml-2" /> قطع صدا
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 ml-2" /> وصل صدا
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

      {/* Content Area */}
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
            {messages.map((message, index) => {
              const extras = messageExtras[message.id]
              const isLastMessage = index === messages.length - 1
              const displayContent = getDisplayContent(message, isLastMessage)

              return (
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
                              {formatTextWithLinks(displayContent)}
                              {isLoading && isLastMessage && !isProcessingJSON && (
                                <span className="inline-block w-1 h-4 bg-gray-600 dark:bg-gray-300 animate-pulse ml-1"></span>
                              )}
                            </div>
                          </div>
                          {/* Message Actions Bar */}
                          <div className="flex items-center gap-2 px-2">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(message.createdAt)}</span>
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
                                onClick={() => handleCopy(message.id, displayContent)}
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
                        <div className="flex justify-end px-2">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Check className="w-3 h-3" />
                            <span>{formatTime(message.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* نمایش محصولات پیشنهادی */}
                  {(extras?.suggestedProducts || (isLastMessage && currentMessageExtras.suggestedProducts)) && (
                    <div className="mt-3 space-y-2 w-11/12 mx-auto animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2 px-2">
                        <Star className="w-4 h-4 text-blue-500" />
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          محصولات پیشنهادی برای شما:
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {(extras?.suggestedProducts || currentMessageExtras.suggestedProducts || [])
                          .slice(0, 2)
                          .map((product) => (
                            <ProductCard key={product.id} product={product} isCompact={true} isSuggested={true} />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* نمایش سوالات پیشنهادی */}
                  {(extras?.nextSuggestions || (isLastMessage && currentMessageExtras.nextSuggestions)) && (
                    <div className="mt-3 space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2 px-2">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">سوالات پیشنهادی:</p>
                      </div>
                      <div className="space-y-1.5">
                        {(extras?.nextSuggestions || currentMessageExtras.nextSuggestions || [])
                          .slice(0, 3)
                          .map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full h-auto p-3 text-right justify-start bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl text-sm transition-all duration-200 hover:shadow-sm min-h-[44px]"
                            >
                              <div className="flex items-center gap-2.5 w-full">
                                <span className="text-lg flex-shrink-0">{suggestion.emoji}</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium leading-snug text-right flex-1 whitespace-normal break-words">
                                  {suggestion.text}
                                </span>
                              </div>
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* نمایش لودینگ عادی */}
            {isLoading && !isProcessingJSON && <TypingIndicator />}

            {/* نمایش لودینگ ویژه برای پردازش محصولات */}
            {isLoading && isProcessingJSON && <ProductProcessingIndicator />}

            {showFAQs && messages.length <= 1 && faqs.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    {faqs.slice(0, 4).map((faq) => (
                      <Button
                        key={faq.id}
                        variant="outline"
                        onClick={() => handleFAQClick(faq)}
                        className="h-auto px-3 py-2.5 text-right justify-start bg-white dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 border-0 rounded-2xl text-xs transition-all duration-300 hover:scale-105 group w-full"
                        style={{
                          boxShadow: `0 4px 12px ${chatbot.primary_color}35, 0 2px 5px ${chatbot.primary_color}25`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base group-hover:scale-110 transition-transform duration-200">
                            {faq.emoji}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium leading-tight text-right">
                            {faq.question}
                          </span>
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
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">فروشگاه محصولات</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">محصولات ما را مشاهده کنید</p>
            </div>

            {storeSuggestedProducts.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-orange-500" />
                  <h4 className="text-md font-semibold text-gray-800 dark:text-white">محصولات پیشنهادی برای شما</h4>
                  <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs px-2 py-1 rounded-full">
                    {storeSuggestedProducts.length} محصول
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {storeSuggestedProducts.map((product) => (
                    <ProductCard key={`suggested-${product.id}`} product={product} isSuggested={true} />
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">سایر محصولات</h4>
                </div>
              </div>
            )}

            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products
                  .filter((product) => !storeSuggestedProducts.some((sp) => sp.id === product.id))
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🛍️</div>
                <p className="text-gray-500 dark:text-gray-400">هیچ محصولی در حال حاضر موجود نیست</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "ticket" && (
          <div className="p-4">
            {ticketView === "form" ? (
              <TicketForm chatbotId={chatbot.id} onClose={() => {}} onShowTickets={handleShowTickets} />
            ) : (
              <UserTicketsView chatbotId={chatbot.id} phone={userPhone} onBack={handleBackToForm} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
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
              activeTab === "ai"
                ? "text-gray-800 dark:text-white border-b-2"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
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
              activeTab === "store"
                ? "text-gray-800 dark:text-white border-b-2"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
            )}
            style={{ borderBottomColor: activeTab === "store" ? chatbot.primary_color : "transparent" }}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-1" />
              {newSuggestionCount > 0 && (
                <div className="absolute -top-1 -right-2 w-3 h-3 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center border border-white dark:border-gray-900 font-bold">
                  {newSuggestionCount > 9 ? "9+" : newSuggestionCount}
                </div>
              )}
            </div>
            <span>فروشگاه</span>
          </button>
          <button
            onClick={() => handleTabChange("ticket")}
            className={cn(
              "flex-1 flex flex-col items-center py-3 text-xs transition-colors relative",
              activeTab === "ticket"
                ? "text-gray-800 dark:text-white border-b-2"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
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
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-5 gap-2">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleFormSubmit}>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700 min-h-[44px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 border-0 bg-transparent text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 h-8 text-gray-900 dark:text-white"
                  disabled={isLoading}
                />
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
          </div>
        )}
      </footer>
    </div>
  )
}
