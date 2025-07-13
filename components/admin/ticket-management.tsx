"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Clock, CheckCircle, XCircle, User, Phone, Calendar, ImageIcon } from "lucide-react"

interface Ticket {
  id: number
  chatbot_id: number
  user_name: string
  user_phone: string
  subject: string
  message: string
  image_url: string | null
  status: string
  priority: string
  created_at: string
  updated_at: string
}

interface TicketResponse {
  id: number
  ticket_id: number
  message: string
  is_admin: boolean
  created_at: string
}

interface TicketManagementProps {
  chatbotId: number
  className?: string
}

export default function TicketManagement({ chatbotId, className }: TicketManagementProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [chatbotId])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/tickets?chatbotId=${chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketDetails = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedTicket(data.ticket)
        setResponses(data.responses || [])
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error)
    }
  }

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status })
        }
      }
    } catch (error) {
      console.error("Error updating ticket status:", error)
    }
  }

  const addResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newResponse,
          isAdmin: true,
        }),
      })

      if (response.ok) {
        setNewResponse("")
        fetchTicketDetails(selectedTicket.id)
        // Auto-update status to in_progress if it was open
        if (selectedTicket.status === "open") {
          updateTicketStatus(selectedTicket.id, "in_progress")
        }
      }
    } catch (error) {
      console.error("Error adding response:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "closed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4" />
      case "closed":
        return <XCircle className="h-4 w-4" />
      case "in_progress":
        return <MessageSquare className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "باز"
      case "closed":
        return "بسته"
      case "in_progress":
        return "در حال بررسی"
      case "resolved":
        return "حل شده"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">در حال بارگذاری تیکت‌ها...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            تیکت‌های پشتیبانی
            <Badge variant="secondary">{tickets.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>تیکتی وجود ندارد</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTicket?.id === ticket.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => fetchTicketDetails(ticket.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-sm truncate flex-1">{ticket.subject}</h4>
                      <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="mr-1">{getStatusLabel(ticket.status)}</span>
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.message}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticket.user_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {ticket.user_phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                      </div>
                      {ticket.image_url && <ImageIcon className="h-3 w-3 text-blue-500" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedTicket ? "جزئیات تیکت" : "انتخاب تیکت"}
            </span>
            {selectedTicket && (
              <Select
                value={selectedTicket.status}
                onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">🆕 باز</SelectItem>
                  <SelectItem value="in_progress">⏳ در حال بررسی</SelectItem>
                  <SelectItem value="resolved">✅ حل شده</SelectItem>
                  <SelectItem value="closed">🔒 بسته</SelectItem>
                </SelectContent>
              </Select>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTicket ? (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">{selectedTicket.subject}</h3>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">نام:</span>
                    <span>{selectedTicket.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">تلفن:</span>
                    <span>{selectedTicket.user_phone}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{selectedTicket.message}</p>

                {selectedTicket.image_url && (
                  <div className="mt-3">
                    <img
                      src={selectedTicket.image_url || "/placeholder.svg"}
                      alt="ضمیمه تیکت"
                      className="max-w-xs rounded-lg border"
                    />
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-3">
                  ایجاد شده: {new Date(selectedTicket.created_at).toLocaleString("fa-IR")}
                </div>
              </div>

              {/* Responses */}
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-lg ${
                        response.is_admin
                          ? "bg-blue-50 border-r-4 border-blue-500"
                          : "bg-gray-50 border-r-4 border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{response.is_admin ? "🛡️ پشتیبانی" : "👤 کاربر"}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(response.created_at).toLocaleString("fa-IR")}
                        </span>
                      </div>
                      <p className="text-sm">{response.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Add Response */}
              {selectedTicket.status !== "closed" && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-2">پاسخ جدید</h4>
                  <Textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    className="mb-3"
                    rows={4}
                  />
                  <Button onClick={addResponse} disabled={!newResponse.trim() || submitting} className="w-full">
                    {submitting ? "در حال ارسال..." : "📤 ارسال پاسخ"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">تیکتی را برای مشاهده جزئیات انتخاب کنید</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
