"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { fa } from "date-fns/locale"

interface Ticket {
  id: number
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  user_email?: string
  admin_response?: string
}

interface TicketManagerProps {
  tickets: Ticket[]
  onUpdateTicket: (ticketId: number, updates: Partial<Ticket>) => Promise<void>
  className?: string
}

const statusLabels = {
  open: { label: "باز", color: "bg-blue-100 text-blue-800", emoji: "🆕" },
  in_progress: { label: "در حال بررسی", color: "bg-yellow-100 text-yellow-800", emoji: "⏳" },
  resolved: { label: "حل شده", color: "bg-green-100 text-green-800", emoji: "✅" },
  closed: { label: "بسته", color: "bg-gray-100 text-gray-800", emoji: "🔒" },
}

const priorityLabels = {
  low: { label: "کم", color: "bg-gray-100 text-gray-800", emoji: "⬇️" },
  medium: { label: "متوسط", color: "bg-blue-100 text-blue-800", emoji: "➡️" },
  high: { label: "بالا", color: "bg-orange-100 text-orange-800", emoji: "⬆️" },
  urgent: { label: "فوری", color: "bg-red-100 text-red-800", emoji: "🚨" },
}

export default function TicketManager({ tickets, onUpdateTicket, className }: TicketManagerProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [response, setResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRespond = async () => {
    if (!selectedTicket || !response.trim()) return

    setIsSubmitting(true)
    try {
      await onUpdateTicket(selectedTicket.id, {
        admin_response: response,
        status: "resolved",
      })
      setResponse("")
      setSelectedTicket(null)
    } catch (error) {
      console.error("Error responding to ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    await onUpdateTicket(ticketId, { status: newStatus as Ticket["status"] })
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎫 تیکت‌های پشتیبانی
              <Badge variant="secondary">{tickets.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>تیکتی وجود ندارد</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedTicket?.id === ticket.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{ticket.subject}</h3>
                        <div className="flex gap-2">
                          <Badge className={statusLabels[ticket.status].color}>
                            {statusLabels[ticket.status].emoji} {statusLabels[ticket.status].label}
                          </Badge>
                          <Badge className={priorityLabels[ticket.priority].color}>
                            {priorityLabels[ticket.priority].emoji} {priorityLabels[ticket.priority].label}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.message}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{ticket.user_email}</span>
                        <span>
                          {formatDistanceToNow(new Date(ticket.created_at), {
                            addSuffix: true,
                            locale: fa,
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Ticket Details & Response */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedTicket ? "📝 پاسخ به تیکت" : "📋 جزئیات تیکت"}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-6">
                {/* Ticket Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{selectedTicket.subject}</h3>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, { label, emoji }]) => (
                          <SelectItem key={key} value={key}>
                            {emoji} {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-gray-700 mb-3">{selectedTicket.message}</p>

                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>📧 {selectedTicket.user_email}</span>
                    <span>
                      📅 {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true, locale: fa })}
                    </span>
                  </div>
                </div>

                {/* Previous Response */}
                {selectedTicket.admin_response && (
                  <div className="bg-green-50 rounded-lg p-4 border-r-4 border-green-500">
                    <h4 className="font-medium text-green-800 mb-2">✅ پاسخ قبلی:</h4>
                    <p className="text-gray-700">{selectedTicket.admin_response}</p>
                  </div>
                )}

                {/* Response Form */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="پاسخ خود را اینجا بنویسید..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />

                  <div className="flex gap-2">
                    <Button onClick={handleRespond} disabled={!response.trim() || isSubmitting} className="flex-1">
                      {isSubmitting ? "⏳ در حال ارسال..." : "📤 ارسال پاسخ"}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                      ❌ لغو
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🎫</div>
                <p className="text-lg">تیکتی را برای مشاهده جزئیات انتخاب کنید</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
