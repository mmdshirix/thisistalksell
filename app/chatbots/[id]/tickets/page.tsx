"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import EnhancedTicketManagement from "@/components/admin/enhanced-ticket-management"

export default function ChatbotTicketsPage() {
  const params = useParams()
  const chatbotId = params.id as string

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/chatbots/${chatbotId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 ml-2" />
            بازگشت
          </Button>
        </Link>
      </div>

      <EnhancedTicketManagement chatbotId={Number.parseInt(chatbotId)} />
    </div>
  )
}
