"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Clock, CheckCircle, XCircle, ImageIcon } from "lucide-react"

interface Ticket {
  id: number
  chatbot_id: number
  subject: string
  message: string
  image_url: string | null
  status: string
  priority: string
  created_at: string
  user_ip: string | null
}

interface TicketResponse {
  id: number
  ticket_id: number
  message: string
  is_admin: boolean
  created_at: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      // For demo purposes, we'll fetch tickets for chatbot ID 1
      // In a real app, you'd get this from the current chatbot context
      const response = await fetch("/api/tickets?chatbotId=1")
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
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
        setResponses(data.responses)
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
      }
    } catch (error) {
      console.error("Error adding response:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4" />
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
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
    <div className="container mx-auto p-6">
      <div className="flex gap-6">
        {/* Tickets List */}
        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                تیکت‌های پشتیبانی ({tickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">تیکتی وجود ندارد</p>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedTicket?.id === ticket.id ? "border-blue-500 bg-blue-50" : ""
                      }`}
                      onClick={() => fetchTicketDetails(ticket.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm truncate">{ticket.subject}</h4>
                        <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="mr-1">
                            {ticket.status === "open" ? "باز" : ticket.status === "closed" ? "بسته" : "در حال بررسی"}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{ticket.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                        </span>
                        {ticket.image_url && <ImageIcon className="h-3 w-3 text-gray-400" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="w-2/3">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {selectedTicket.subject}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTicketStatus(selectedTicket.id, "in_progress")}
                      disabled={selectedTicket.status === "in_progress"}
                    >
                      در حال بررسی
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTicketStatus(selectedTicket.id, "closed")}
                      disabled={selectedTicket.status === "closed"}
                    >
                      بستن تیکت
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">پیام اصلی</span>
                      <span className="text-xs text-gray-500">
                        {new Date(selectedTicket.created_at).toLocaleString("fa-IR")}
                      </span>
                    </div>
                    <p className="text-sm">{selectedTicket.message}</p>
                    {selectedTicket.image_url && (
                      <div className="mt-2">
                        <img
                          src={selectedTicket.image_url || "/placeholder.svg"}
                          alt="Ticket attachment"
                          className="max-w-xs rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  {/* Responses */}
                  <div className="space-y-3">
                    {responses.map((response) => (
                      <div
                        key={response.id}
                        className={`p-3 rounded-lg ${
                          response.is_admin ? "bg-blue-50 border-r-4 border-blue-500" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{response.is_admin ? "پشتیبانی" : "کاربر"}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(response.created_at).toLocaleString("fa-IR")}
                          </span>
                        </div>
                        <p className="text-sm">{response.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Response */}
                  {selectedTicket.status !== "closed" && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-2">پاسخ جدید</h4>
                      <Textarea
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        placeholder="پاسخ خود را بنویسید..."
                        className="mb-2"
                        rows={3}
                      />
                      <Button onClick={addResponse} disabled={!newResponse.trim()}>
                        ارسال پاسخ
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>تیکتی را انتخاب کنید</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
