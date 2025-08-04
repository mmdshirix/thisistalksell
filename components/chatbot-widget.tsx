"use client"
import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react" // Corrected import path
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot } from "lucide-react"
import { TypingEffect } from "./typing-effect"
import { ProductSuggestionCard } from "./product-suggestion-card"
import { QuickOptions } from "./quick-options"
import { Textarea } from "@/components/ui/textarea"

interface ChatbotWidgetProps {
  chatbotId: string
  initialMessage?: string
  initialOptions?: string[]
  appearance?: {
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    textColor?: string
    fontFamily?: string
    borderRadius?: string
    widgetPosition?: "bottom-right" | "bottom-left"
    widgetIcon?: string
    chatHeader?: string
    chatWelcomeMessage?: string
  }
}

export function ChatbotWidget({
  chatbotId,
  initialMessage = "Hello! How can I help you today?",
  initialOptions = [],
  appearance,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [quickOptions, setQuickOptions] = useState<string[]>(initialOptions)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages } = useChat({
    api: `/api/chat`,
    body: { chatbotId },
    onFinish: (message) => {
      if (message.content.includes("PRODUCT_SUGGESTION:")) {
        const productData = JSON.parse(message.content.replace("PRODUCT_SUGGESTION:", ""))
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, prevMessages.length - 1),
          {
            id: message.id,
            role: "assistant",
            content: "Here is a product suggestion:",
            ui: <ProductSuggestionCard product={productData} />,
          },
        ])
      }
    },
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: "welcome-message",
          role: "assistant",
          content: appearance?.chatWelcomeMessage || initialMessage,
        },
      ])
    }
  }, [initialMessage, messages.length, setMessages, appearance?.chatWelcomeMessage])

  const handleQuickOptionClick = (option: string) => {
    append({ role: "user", content: option })
  }

  const widgetPositionClasses = appearance?.widgetPosition === "bottom-left" ? "bottom-4 left-4" : "bottom-4 right-4"

  return (
    <div className={cn("fixed z-50", widgetPositionClasses)}>
      <Button
        className="rounded-full w-16 h-16 shadow-lg"
        style={{ backgroundColor: appearance?.primaryColor || "#6366F1" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {appearance?.widgetIcon ? (
          <img src={appearance.widgetIcon || "/placeholder.svg"} alt="Widget Icon" className="w-8 h-8" />
        ) : (
          <Bot className="w-8 h-8 text-white" />
        )}
      </Button>

      {isOpen && (
        <Card
          className="fixed bottom-24 right-4 w-[350px] h-[500px] flex flex-col shadow-xl"
          style={{
            backgroundColor: appearance?.backgroundColor || "#FFFFFF",
            borderRadius: appearance?.borderRadius || "0.75rem",
            fontFamily: appearance?.fontFamily || "sans-serif",
          }}
        >
          <CardHeader
            className="flex flex-row items-center justify-between p-4 border-b"
            style={{ backgroundColor: appearance?.secondaryColor || "#F3F4F6" }}
          >
            <CardTitle style={{ color: appearance?.textColor || "#1F2937" }}>
              {appearance?.chatHeader || "AI Chatbot"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: appearance?.textColor || "#1F2937" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <ScrollArea className="h-full pr-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex items-start gap-3 mb-4", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  {m.role === "assistant" && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={appearance?.widgetIcon || "/placeholder-logo.png"} />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] p-3 rounded-lg",
                      m.role === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none",
                    )}
                    style={{
                      backgroundColor:
                        m.role === "user"
                          ? appearance?.primaryColor || "#6366F1"
                          : appearance?.secondaryColor || "#F3F4F6",
                      color: m.role === "user" ? "#FFFFFF" : appearance?.textColor || "#1F2937",
                    }}
                  >
                    {m.ui ? m.ui : m.role === "assistant" ? <TypingEffect text={m.content} /> : m.content}
                  </div>
                  {m.role === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={appearance?.widgetIcon || "/placeholder-logo.png"} />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div
                    className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none"
                    style={{
                      backgroundColor: appearance?.secondaryColor || "#F3F4F6",
                      color: appearance?.textColor || "#1F2937",
                    }}
                  >
                    <TypingEffect text="Thinking..." />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                className="flex-1 resize-none"
                style={{
                  backgroundColor: appearance?.backgroundColor || "#FFFFFF",
                  color: appearance?.textColor || "#1F2937",
                  borderColor: appearance?.secondaryColor || "#E5E7EB",
                }}
              />
              <Button
                type="submit"
                style={{ backgroundColor: appearance?.primaryColor || "#6366F1" }}
                disabled={isLoading}
              >
                Send
              </Button>
            </form>
            {quickOptions.length > 0 && <QuickOptions options={quickOptions} onOptionClick={handleQuickOptionClick} />}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
