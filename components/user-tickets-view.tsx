"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Clock, MessageSquare, Send, User, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Ticket {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: "open" | "closed" | "pending" | "in_progress" | "resolved"
  priority: "low" | "normal" | "high"
  created_at: string
  image_url?: string
}

interface TicketResponse {
  id: number
  message: string
  is_admin: boolean
  created_at: string
}

interface UserTicketsViewProps {
  chatbotId: number
  phone: string
  onBack: () => void
}

const statusConfig = {
  open: { label: "باز", color: "bg-blue-500", icon: AlertCircle },
  pending: { label: "در انتظار", color: "bg-yellow-500", icon: Clock },
  in_progress: { label: "در حال بررسی", color: "bg-orange-500", icon: MessageSquare },
  resolved: { label: "حل شده", color: "bg-green-500", icon: CheckCircle },
  closed: { label: "بسته", color: "bg-gray-500", icon: XCircle },
}

const priorityConfig = {
  low: { label: "کم", color: "text-green-600 bg-green-50 dark:bg-green-900/30" },
  normal: { label: "متوسط", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
  high: { label: "بالا", color: "text-red-600 bg-red-50 dark:bg-red-900/30" },
}

export default function UserTicketsView({ chatbotId, phone, onBack }: UserTicketsViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUserTickets()
  }, [chatbotId, phone])

  const fetchUserTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/user/${encodeURIComponent(phone)}?chatbot_id=${chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error fetching user tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketResponses = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/responses`)
      if (response.ok) {
        const data = await response.json()
        setResponses(data.responses || [])
      }
    } catch (error) {
      console.error("Error fetching ticket responses:", error)
    }
  }

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    fetchTicketResponses(ticket.id)
  }

  const handleBackToList = () => {
    setSelectedTicket(null)
    setResponses([])
    setNewResponse("")
  }

  const handleSubmitResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/tickets/${selectedTicket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newResponse.trim(),
          is_admin: false,
        }),
      })

      if (response.ok) {
        setNewResponse("")
        fetchTicketResponses(selectedTicket.id)
      }
    } catch (error) {
      console.error("Error submitting response:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری تیکت‌ها...</p>
        </div>
      </div>
    )
  }

  if (selectedTicket) {
    const StatusIcon = statusConfig[selectedTicket.status].icon

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Button variant="ghost" size="sm" onClick={handleBackToList} className="p-2">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">جزئیات تیکت</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">#{selectedTicket.id}</p>
          </div>
        </div>

        {/* Ticket Details */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">{selectedTicket.subject}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-white", statusConfig[selectedTicket.status].color)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[selectedTicket.status].label}
                  </Badge>
                  <Badge variant="outline" className={priorityConfig[selectedTicket.priority].color}>
                    {priorityConfig[selectedTicket.priority].label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{selectedTicket.message}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(selectedTicket.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{selectedTicket.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responses */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            پاسخ‌ها ({responses.length})
          </h4>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {responses.map((response) => (
              <div key={response.id} className={cn("flex", response.is_admin ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    response.is_admin
                      ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tr-md"
                      : "bg-blue-500 text-white rounded-tl-md",
                  )}
                >
                  <p className="leading-relaxed">{response.message}</p>
                  <div
                    className={cn(
                      "text-xs mt-2 flex items-center gap-1",
                      response.is_admin ? "text-gray-500 dark:text-gray-400" : "text-blue-100",
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(response.created_at)}</span>
                    {response.is_admin && <span className="mr-2 text-blue-600 dark:text-blue-400">• پشتیبانی</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Response Form */}
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
              className="min-h-[80px] resize-none border-gray-300 dark:border-gray-600 rounded-xl"
              disabled={submitting}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitResponse}
                disabled={!newResponse.trim() || submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                ) : (
                  <Send className="w-4 h-4 ml-2" />
                )}
                ارسال پاسخ
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">تیکت‌های شما</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tickets.length} تیکت برای شماره {phone}
          </p>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">هیچ تیکتی یافت نشد</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">شما هنوز هیچ تیکتی ارسال نکرده‌اید</p>
          <Button onClick={onBack} variant="outline" className="rounded-xl bg-transparent">
            ارسال تیکت جدید
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const StatusIcon = statusConfig[ticket.status].icon
            return (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                onClick={() => handleTicketClick(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{ticket.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-3">
                      <Badge className={cn("text-white text-xs", statusConfig[ticket.status].color)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[ticket.status].label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", priorityConfig[ticket.priority].color)}>
                        {priorityConfig[ticket.priority].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>#{ticket.id}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
