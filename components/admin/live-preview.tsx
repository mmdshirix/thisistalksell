"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

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
  knowledge_base_text: string | null
  knowledge_base_url: string | null
  store_url: string | null
  ai_url: string | null
}

interface LivePreviewProps {
  chatbot: ChatbotConfig
}

export default function LivePreview({ chatbot }: LivePreviewProps) {
  const [embedCode, setEmbedCode] = useState("")
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined" && chatbot) {
      const currentAppUrl = window.location.origin
      setEmbedCode(`<script src="${currentAppUrl}/api/widget-loader?id=${chatbot.id}" defer></script>`)
      // Force iframe reload when chatbot data changes
      setPreviewKey((prev) => prev + 1)
    }
  }, [chatbot])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success("کد با موفقیت کپی شد!")
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">در حال بارگذاری پیش‌نمایش...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chatbot Info Display */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">تنظیمات فعلی چت‌بات:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">نام:</span>
            <div className="font-medium">{chatbot.name}</div>
          </div>
          <div>
            <span className="text-gray-600">رنگ اصلی:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: chatbot.primary_color }} />
              <span className="font-mono text-xs">{chatbot.primary_color}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-600">موقعیت:</span>
            <div className="font-medium">{chatbot.position}</div>
          </div>
          <div>
            <span className="text-gray-600">آیکون:</span>
            <div className="font-medium">{chatbot.chat_icon}</div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="relative h-[600px] w-full rounded-lg border bg-gray-100 overflow-hidden">
        <iframe
          key={previewKey}
          src={`/launcher/${chatbot.id}?preview=true&t=${Date.now()}`}
          className="h-full w-full"
          title={`پیش‌نمایش چت‌بات ${chatbot.name}`}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          پیش‌نمایش زنده - {chatbot.name}
        </div>
      </div>

      {/* Embed Code */}
      <div>
        <h3 className="text-lg font-semibold mb-2">کد امبد</h3>
        <p className="text-sm text-gray-600 mb-4">
          این کد را در تگ &lt;head&gt; یا &lt;body&gt; سایت خود قرار دهید تا چت‌بات نمایش داده شود.
        </p>
        <div className="flex items-center gap-2">
          <Input readOnly value={embedCode} className="font-mono text-sm bg-gray-100" />
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
