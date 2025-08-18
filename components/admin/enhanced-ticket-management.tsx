"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  MessageCircle,
  Clock,
  User,
  Phone,
  Mail,
  ImageIcon,
  Send,
  RefreshCw,
  Search,
  ChevronLeft,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Ticket {
  id: number
  name: string
  phone: string
  email?: string
  subject: string
  message: string
  image_url?: string
  status: "open" | "pending" | "answered" | "closed"
  created_at: string
  updated_at: string
  response_count: number
  last_response_at?: string
  responses?: Array<{
    id: number
    message: string
    is_admin: boolean
    created_at: string
  }>
}

interface EnhancedTicketManagementProps {
  chatbotId: string
}

const statusColors = {
  open: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  answered: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
}

const statusLabels = {
  open: "جدید",
  pending: "در انتظار پاسخ",
  answered: "پاسخ داده شده",
  closed: "بسته شده",
}

export default function EnhancedTicketManagement({ chatbotId }: EnhancedTicketManagementProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)
  const [newResponse, setNewResponse] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadTickets()
  }, [chatbotId])

  const loadTickets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tickets/chatbot/${chatbotId}`)
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error loading tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTicketDetails = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`)
      const data = await response.json()

      if (data.success) {
        setSelectedTicket(data.ticket)
      }
    } catch (error) {
      console.error("Error loading ticket details:", error)
    }
  }

  const handleResponseSubmit = async () => {
    if (!selectedTicket || !newResponse.trim()) return

    setIsSubmittingResponse(true)
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newResponse,
          isAdmin: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewResponse("")
        // Reload ticket details
        await loadTicketDetails(selectedTicket.id)
        // Reload tickets list
        await loadTickets()
      }
    } catch (error) {
      console.error("Error submitting response:", error)
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        // Update selected ticket if it's the one being changed
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus as any } : null))
        }
        // Reload tickets list
        await loadTickets()
      }
    } catch (error) {
      console.error("Error updating ticket status:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesSearch =
      searchQuery === "" ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.phone.includes(searchQuery)

    return matchesStatus && matchesSearch
  })

  const getStatusPriority = (status: string) => {
    switch (status) {
      case "open":
        return 1
      case "pending":
        return 2
      case "answered":
        return 3
      case "closed":
        return 4
      default:
        return 5
    }
  }

  const sortedTickets = filteredTickets.sort((a, b) => {
    const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600">در حال بارگذاری تیکت‌ها...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Tickets List */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                تیکت‌ها ({tickets.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadTickets}
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw className="w-4 h-4" />
                بروزرسانی
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="جستجو در تیکت‌ها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="فیلتر وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="open">جدید</SelectItem>
                  <SelectItem value="pending">در انتظار پاسخ</SelectItem>
                  <SelectItem value="answered">پاسخ داده شده</SelectItem>
                  <SelectItem value="closed">بسته شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Tickets List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedTickets.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">هیچ تیکتی یافت نشد</p>
                </div>
              ) : (
                sortedTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedTicket?.id === ticket.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50",
                    )}
                    onClick={() => {
                      setSelectedTicket(ticket)
                      loadTicketDetails(ticket.id)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            #{ticket.id} - {ticket.subject}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {ticket.name} • {ticket.phone}
                          </p>
                        </div>
                        <Badge className={cn("text-xs", statusColors[ticket.status])}>
                          {statusLabels[ticket.status]}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">{ticket.message}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(ticket.created_at)}
                        </span>
                        {ticket.response_count > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {ticket.response_count} پاسخ
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Details */}
      <div className="lg:col-span-2">
        {selectedTicket ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ChevronLeft className="w-5 h-5" />
                  تیکت #{selectedTicket.id}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-sm", statusColors[selectedTicket.status])}>
                    {statusLabels[selectedTicket.status]}
                  </Badge>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">جدید</SelectItem>
                      <SelectItem value="pending">در انتظار پاسخ</SelectItem>
                      <SelectItem value="answered">پاسخ داده شده</SelectItem>
                      <SelectItem value="closed">بسته شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">نام:</span>
                  <span className="text-sm">{selectedTicket.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">تلفن:</span>
                  <span className="text-sm">{selectedTicket.phone}</span>
                </div>
                {selectedTicket.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">ایمیل:</span>
                    <span className="text-sm">{selectedTicket.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">تاریخ:</span>
                  <span className="text-sm">{formatDate(selectedTicket.created_at)}</span>
                </div>
              </div>

              {/* Original Message */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">موضوع: {selectedTicket.subject}</h4>
                <div className="p-4 bg-blue-50 rounded-lg border-r-4 border-blue-400">
                  <p className="text-gray-800">{selectedTicket.message}</p>
                  {selectedTicket.image_url && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">ضمیمه:</span>
                      </div>
                      <img
                        src={selectedTicket.image_url || "/placeholder.svg"}
                        alt="ضمیمه تیکت"
                        className="max-w-full h-48 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Responses */}
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    پاسخ‌ها ({selectedTicket.responses.length})
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedTicket.responses.map((response) => (
                      <div
                        key={response.id}
                        className={cn(
                          "p-4 rounded-lg",
                          response.is_admin
                            ? "bg-green-50 border-r-4 border-green-400"
                            : "bg-gray-50 border-r-4 border-gray-300",
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-1 rounded",
                              response.is_admin ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
                            )}
                          >
                            {response.is_admin ? "پشتیبانی" : "کاربر"}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(response.created_at)}</span>
                        </div>
                        <p className="text-gray-800">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Response */}
              {selectedTicket.status !== "closed" && (
                <div>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">پاسخ جدید</h4>
                    <Textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="پاسخ خود را بنویسید..."
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleResponseSubmit}
                        disabled={!newResponse.trim() || isSubmittingResponse}
                        className="flex items-center gap-2"
                      >
                        {isSubmittingResponse ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            در حال ارسال...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            ارسال پاسخ
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">تیکتی انتخاب نشده</h3>
                <p className="text-gray-500">برای مشاهده جزئیات و پاسخگویی، یک تیکت از لیست انتخاب کنید</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
