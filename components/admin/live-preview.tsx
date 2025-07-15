"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

export default function LivePreview() {
  const params = useParams()
  const chatbotId = params.id as string
  const [embedCode, setEmbedCode] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentAppUrl = window.location.origin
      setEmbedCode(`<script src="${currentAppUrl}/api/widget-loader?id=${chatbotId}" defer></script>`)
    }
  }, [chatbotId])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success("کد با موفقیت کپی شد!")
  }

  return (
    <div className="space-y-6">
      <div className="relative h-[600px] w-full rounded-lg border bg-gray-100 overflow-hidden">
        <iframe
          src={`/launcher/${chatbotId}`}
          className="h-full w-full"
          title="Chatbot Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
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
