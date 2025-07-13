"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Chatbot } from "@/lib/db"
import { X, MessageSquare } from "lucide-react"

const NOTIFICATION_SOUND_URL = "https://talksellapi.vercel.app/sounds/notification.mp3"

export default function ChatbotLauncher({ chatbot }: { chatbot: Chatbot }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [hasBeenOpened, setHasBeenOpened] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const primaryColor = chatbot.primary_color || "#3b82f6"
  const appUrl = "https://talksellapi.vercel.app"

  // Handle user interaction for audio
  const handleUserInteraction = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true)
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [userInteracted])

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Preload audio
      notificationAudioRef.current = new Audio(NOTIFICATION_SOUND_URL)
      notificationAudioRef.current.volume = 0.5
      notificationAudioRef.current.preload = "auto"

      // Listen for user interaction
      document.addEventListener("click", handleUserInteraction, { passive: true })
      document.addEventListener("touchstart", handleUserInteraction, { passive: true })
      document.addEventListener("keydown", handleUserInteraction, { passive: true })

      // Enable pointer events for the launcher area
      window.parent.postMessage({ type: "TALKSELL_ENABLE_POINTER" }, "*")
    }

    // Show notification after delay
    notificationTimeoutRef.current = setTimeout(() => {
      if (!isOpen && !hasBeenOpened) {
        setShowNotification(true)

        // Try to play sound only if user has interacted
        if (userInteracted && notificationAudioRef.current) {
          notificationAudioRef.current.play().catch((error) => {
            console.log("Audio play failed:", error)
          })
        }
      }
    }, 3000)

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [isOpen, hasBeenOpened, userInteracted, handleUserInteraction])

  const toggleChat = useCallback(() => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)

    if (newIsOpen) {
      setHasBeenOpened(true)
      setShowNotification(false)
      window.parent.postMessage({ type: "TALKSELL_WIDGET_OPEN" }, "*")
    } else {
      window.parent.postMessage({ type: "TALKSELL_WIDGET_CLOSE" }, "*")
    }
  }, [isOpen])

  const handleNotificationClick = useCallback(() => {
    setShowNotification(false)
    toggleChat()
  }, [toggleChat])

  const handleButtonMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "scale(1.1)"
  }, [])

  const handleButtonMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "scale(1)"
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        bottom: "0px",
        right: "0px",
        zIndex: 9999,
        pointerEvents: "auto",
        background: "transparent",
      }}
    >
      {/* Chat Widget */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "0px",
            width: "370px",
            height: "600px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            transform: isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            opacity: isOpen ? 1 : 0,
            transition: "all 0.3s ease-in-out",
            pointerEvents: "auto",
          }}
        >
          <iframe
            src={`${appUrl}/widget/${chatbot.id}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "16px",
            }}
            title="Chatbot Widget"
            loading="lazy"
          />
        </div>
      )}

      {/* Notification */}
      {showNotification && !isOpen && (
        <div
          onClick={handleNotificationClick}
          style={{
            position: "absolute",
            bottom: "80px",
            right: "0px",
            maxWidth: "280px",
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            fontSize: "14px",
            color: "#374151",
            cursor: "pointer",
            transform: showNotification ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
            opacity: showNotification ? 1 : 0,
            transition: "all 0.4s ease-out",
            pointerEvents: "auto",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{chatbot.name || "پشتیبانی"}</div>
          <div>{chatbot.welcome_message || "سلام! چطور میتونم کمکتون کنم؟"}</div>
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: "-5px",
              right: "24px",
              width: "12px",
              height: "12px",
              backgroundColor: "white",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}

      {/* Launcher Button */}
      <div style={{ position: "relative" }}>
        <button
          onClick={toggleChat}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: primaryColor,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transition: "all 0.3s ease",
            color: "white",
            pointerEvents: "auto",
          }}
          aria-label={isOpen ? "بستن چت" : "باز کردن چت"}
        >
          {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
        </button>

        {/* Notification Badge */}
        {showNotification && !isOpen && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "24px",
              height: "24px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              color: "white",
              border: "2px solid white",
              transform: showNotification ? "scale(1)" : "scale(0)",
              transition: "transform 0.3s ease",
            }}
          >
            1
          </div>
        )}
      </div>
    </div>
  )
}
