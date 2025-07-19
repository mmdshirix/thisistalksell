"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatbotLauncherProps {
  chatbot: {
    id: number
    name: string
    primary_color: string
    chat_icon: string
    position: string
    margin_x: number
    margin_y: number
  }
}

export default function ChatbotLauncher({ chatbot }: ChatbotLauncherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Show welcome notification after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcome(true)
      // Hide welcome notification after 5 seconds
      setTimeout(() => setShowWelcome(false), 5000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const toggleWidget = () => {
    setIsOpen(!isOpen)
    // Send message to parent window
    window.parent.postMessage(
      {
        type: isOpen ? "TALKSELL_WIDGET_CLOSE" : "TALKSELL_WIDGET_OPEN",
      },
      "*",
    )
  }

  const handleClose = () => {
    setIsOpen(false)
    window.parent.postMessage({ type: "TALKSELL_WIDGET_CLOSE" }, "*")
  }

  // Enable pointer events when widget is open
  useEffect(() => {
    window.parent.postMessage(
      {
        type: isOpen ? "TALKSELL_ENABLE_POINTER" : "TALKSELL_DISABLE_POINTER",
      },
      "*",
    )
  }, [isOpen])

  return (
    <div className="relative w-full h-full">
      {/* Welcome Notification */}
      {showWelcome && !isOpen && (
        <div
          className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg p-3 max-w-xs animate-bounce"
          style={{ transform: "translateX(-10px)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{chatbot.chat_icon}</span>
            <div>
              <p className="text-sm font-medium text-gray-900">سلام! 👋</p>
              <p className="text-xs text-gray-600">چطور می‌توانم کمکتان کنم؟</p>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-gray-400 hover:text-gray-600 ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-2xl overflow-hidden">
          <iframe src={`/widget/${chatbot.id}`} className="w-full h-full border-0" title={`چت‌بات ${chatbot.name}`} />
        </div>
      )}

      {/* Launcher Button */}
      <Button
        onClick={toggleWidget}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: chatbot.primary_color,
          color: "white",
        }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <span className="text-2xl">{chatbot.chat_icon}</span>}
      </Button>
    </div>
  )
}
