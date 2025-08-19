"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Send,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  User,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Ticket {
  id: number
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  updated_at: string
  user_phone: string
  user_name: string
  chatbot_id: number
  responses?: TicketResponse[]
}

interface TicketResponse {
  id: number
  ticket_id: number
  message: string
  is_admin: boolean
  created_at: string
  admin_name?: string
}

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

const statusConfig = {
  open: { label: "باز", color: "bg-blue-500", icon: AlertCircle },
  in_progress: { label: "در حال بررسی", color: "bg-yellow-500", icon: Clock },
  resolved: { label: "حل شده", color: "bg-green-500", icon: CheckCircle },
  closed: { label: "بسته شده", color: "bg-gray-500", icon: XCircle },
}

const priorityConfig = {
  low: { label: "کم", color: "bg-gray-500" },
  medium: { label: "متوسط", color: "bg-blue-500" },
  high: { label: "بالا", color: "bg-orange-500" },
  urgent: { label: "فوری", color: "bg-red-500" },
}

export default function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [view, setView] = useState<"list" | "create" | "detail">("list")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchPhone, setSearchPhone] = useState("")

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
    priority: "medium" as const,
  })

  // Response form
  const [responseMessage, setResponseMessage] = useState("")
  const [sendingResponse, setSendingResponse] = useState(false)

  // Load tickets when phone number is entered
  useEffect(() => {
    if (searchPhone.length >= 10) {
      loadTickets(searchPhone)
    } else {
      setTickets([])
    }
  }, [searchPhone])

  const loadTickets = async (phone: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/user/${phone}?chatbotId=${chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error loading tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTicketDetails = async (ticketId: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedTicket(data.ticket)
        setView("detail")
      }
    } catch (error) {
      console.error("Error loading ticket details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          chatbot_id: chatbotId,
        }),
      })

      if (response.ok) {
        setFormData({ name: "", phone: "", subject: "", message: "", priority: "medium" })
        setView("list")
        // Reload tickets if we have a phone number
        if (searchPhone) {
          loadTickets(searchPhone)
        }
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !responseMessage.trim()) return

    setSendingResponse(true)
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: responseMessage,
          is_admin: false,
        }),
      })

      if (response.ok) {
        setResponseMessage("")
        // Reload ticket details
        loadTicketDetails(selectedTicket.id)
      }
    } catch (error) {
      console.error("Error sending response:", error)
    } finally {
      setSendingResponse(false)
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

  // List View
  if (view === "list") {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">تیکت‌های پشتیبانی</h2>
          <Button onClick={() => setView("create")} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 ml-2" />
            تیکت جدید
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">جستجوی تیکت‌ها</CardTitle>
            <CardDescription>شماره تلفن خود را وارد کنید تا تیکت‌های قبلی را مشاهده کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="tel"
                placeholder="شماره تلفن (مثال: 09123456789)"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="pr-10"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">در حال بارگذاری...</p>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">تیکت‌های شما ({tickets.length})</h3>
            {tickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status].icon
              return (
                <Card
                  key={ticket.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => loadTicketDetails(ticket.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{ticket.subject}</h4>
                          <Badge className={cn("text-white text-xs", statusConfig[ticket.status].color)}>
                            <StatusIcon className="w-3 h-3 ml-1" />
                            {statusConfig[ticket.status].label}
                          </Badge>
                          <Badge className={cn("text-white text-xs", priorityConfig[ticket.priority].color)}>
                            {priorityConfig[ticket.priority].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{ticket.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(ticket.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.user_name}
                          </div>
                        </div>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-gray-400 flex-shrink-0 mr-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {searchPhone.length >= 10 && tickets.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">هیچ تیکتی برای این شماره تلفن یافت نشد</p>
              <Button onClick={() => setView("create")} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                ایجاد اولین تیکت
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Create View
  if (view === "create") {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("list")} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-gray-800">ایجاد تیکت جدید</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات تیکت</CardTitle>
            <CardDescription>لطفاً اطلاعات کامل خود و مشکل مورد نظر را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="نام کامل خود را وارد کنید"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شماره تلفن *</label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="09123456789"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اولویت</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">کم</option>
                  <option value="medium">متوسط</option>
                  <option value="high">بالا</option>
                  <option value="urgent">فوری</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">موضوع *</label>
                <Input
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="موضوع مشکل یا درخواست خود را بنویسید"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">پیام *</label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="توضیح کاملی از مشکل یا درخواست خود ارائه دهید..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? "در حال ارسال..." : "ارسال تیکت"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setView("list")}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Detail View
  if (view === "detail" && selectedTicket) {
    const StatusIcon = statusConfig[selectedTicket.status].icon

    return (
      <div className="space-y-4" dir="rtl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("list")} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-gray-800">جزئیات تیکت</h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                <CardDescription className="mt-1">
                  تیکت #{selectedTicket.id} • {formatDate(selectedTicket.created_at)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={cn("text-white", statusConfig[selectedTicket.status].color)}>
                  <StatusIcon className="w-3 h-3 ml-1" />
                  {statusConfig[selectedTicket.status].label}
                </Badge>
                <Badge className={cn("text-white", priorityConfig[selectedTicket.priority].color)}>
                  {priorityConfig[selectedTicket.priority].label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">اطلاعات کاربر:</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{selectedTicket.user_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span dir="ltr">{selectedTicket.user_phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">پیام اولیه:</h4>
                <div className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-500">
                  <p className="text-gray-800 leading-relaxed">{selectedTicket.message}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responses */}
        {selectedTicket.responses && selectedTicket.responses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">پاسخ‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {selectedTicket.responses.map((response) => (
                    <div
                      key={response.id}
                      className={cn("flex gap-3", response.is_admin ? "flex-row" : "flex-row-reverse")}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback
                          className={cn(
                            response.is_admin ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600",
                          )}
                        >
                          {response.is_admin ? "A" : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("flex-1 max-w-[80%]", response.is_admin ? "text-right" : "text-left")}>
                        <div
                          className={cn(
                            "p-3 rounded-lg",
                            response.is_admin
                              ? "bg-green-50 border border-green-200"
                              : "bg-blue-50 border border-blue-200",
                          )}
                        >
                          <p className="text-gray-800 text-sm leading-relaxed">{response.message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>
                            {response.is_admin ? response.admin_name || "پشتیبانی" : selectedTicket.user_name}
                          </span>
                          <span>•</span>
                          <span>{formatDate(response.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Response Form */}
        {selectedTicket.status !== "closed" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ارسال پاسخ</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendResponse} className="space-y-4">
                <Textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="پاسخ خود را بنویسید..."
                  rows={3}
                  required
                />
                <Button
                  type="submit"
                  disabled={sendingResponse || !responseMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 ml-2" />
                  {sendingResponse ? "در حال ارسال..." : "ارسال پاسخ"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return null
}
