"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Loader2,
  Send,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Calendar,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"

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

interface EnhancedTicketManagementProps {
  chatbotId: number
}

export default function EnhancedTicketManagement({ chatbotId }: EnhancedTicketManagementProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [sendingResponse, setSendingResponse] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets?chatbotId=${chatbotId}`)
      if (!res.ok) throw new Error("Failed to fetch tickets")
      const data = await res.json() // Corrected variable name from response to res
      // مرتب‌سازی تیکت‌ها بر اساس تاریخ ایجاد (جدیدترین در بالا)
      const sortedTickets = (data.tickets || []).sort(
        (a: Ticket, b: Ticket) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      setTickets(sortedTickets)
    } catch (error) {
      toast.error("خطا در دریافت لیست تیکت‌ها")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const refreshTickets = async () => {
    setRefreshing(true)
    await fetchTickets()
    setRefreshing(false)
    toast.success("لیست تیکت‌ها بروزرسانی شد")
  }

  useEffect(() => {
    if (chatbotId) {
      fetchTickets()
      // بروزرسانی خودکار هر 30 ثانیه
      const interval = setInterval(fetchTickets, 30000)
      return () => clearInterval(interval)
    }
  }, [chatbotId])

  const fetchTicketDetails = async (ticketId: number) => {
    setLoadingResponses(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`)
      if (!res.ok) throw new Error("Failed to fetch ticket details")
      const data = await res.json()
      setSelectedTicket(data.ticket)
      setResponses(data.responses || [])
    } catch (error) {
      toast.error("خطا در دریافت جزئیات تیکت")
      console.error(error)
    } finally {
      setLoadingResponses(false)
    }
  }

  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return
    setSendingResponse(true)
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newResponse, isAdmin: true }),
      })
      if (!res.ok) throw new Error("Failed to send response")

      setNewResponse("")
      await fetchTicketDetails(selectedTicket.id)

      // اگر تیکت باز بود، وضعیت را به "در حال بررسی" تغییر دهیم
      if (selectedTicket.status === "open") {
        await handleStatusChange(selectedTicket.id, "in_progress")
      }

      toast.success("پاسخ با موفقیت ارسال شد")
    } catch (error) {
      toast.error("خطا در ارسال پاسخ")
      console.error(error)
    } finally {
      setSendingResponse(false)
    }
  }

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update status")

      // بروزرسانی لیست تیکت‌ها
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)))

      // بروزرسانی تیکت انتخاب شده
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status } : null))
      }

      toast.success("وضعیت تیکت با موفقیت به‌روزرسانی شد")
    } catch (error) {
      toast.error("خطا در به‌روزرسانی وضعیت")
      console.error(error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <XCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "باز"
      case "in_progress":
        return "در حال بررسی"
      case "resolved":
        return "حل شده"
      case "closed":
        return "بسته"
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">در حال بارگذاری تیکت‌ها...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* لیست تیکت‌ها */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>تیکت‌های پشتیبانی</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {tickets.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTickets}
              disabled={refreshing}
              className="rounded-xl bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <CardDescription>مدیریت و پاسخگویی به درخواست‌های پشتیبانی کاربران</CardDescription>
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
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedTicket?.id === ticket.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => fetchTicketDetails(ticket.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">{ticket.subject}</h4>
                          {ticket.priority && (
                            <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority === "high" ? "فوری" : ticket.priority === "medium" ? "متوسط" : "عادی"}
                            </Badge>
                          )}
                        </div>
                      </div>
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

      {/* جزئیات تیکت */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedTicket ? `جزئیات تیکت #${selectedTicket.id}` : "انتخاب تیکت"}
            </span>
            {selectedTicket && (
              <Select
                value={selectedTicket.status}
                onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
              >
                <SelectTrigger className="w-40 rounded-xl">
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
              {/* اطلاعات تیکت */}
              <div className="bg-gray-50 rounded-xl p-4">
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

                <p className="text-gray-700 mb-3 leading-relaxed">{selectedTicket.message}</p>

                {selectedTicket.image_url && (
                  <div className="mt-3">
                    <img
                      src={selectedTicket.image_url || "/placeholder.svg"}
                      alt="ضمیمه تیکت"
                      className="max-w-xs rounded-xl border shadow-sm"
                    />
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
                  <span>ایجاد شده: {new Date(selectedTicket.created_at).toLocaleString("fa-IR")}</span>
                  <span>آخرین بروزرسانی: {new Date(selectedTicket.updated_at).toLocaleString("fa-IR")}</span>
                </div>
              </div>

              {/* پاسخ‌ها */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  گفتگو ({responses.length})
                </h4>
                <ScrollArea className="h-[250px] mb-4">
                  {loadingResponses ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {responses
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((response) => (
                          <div
                            key={response.id}
                            className={`p-3 rounded-xl ${
                              response.is_admin
                                ? "bg-blue-50 border-r-4 border-blue-500 ml-4"
                                : "bg-gray-50 border-r-4 border-gray-300 mr-4"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {response.is_admin ? "🛡️ پشتیبانی" : "👤 کاربر"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(response.created_at).toLocaleString("fa-IR")}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{response.message}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* فرم پاسخ جدید */}
              {selectedTicket.status !== "closed" && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">پاسخ جدید</h4>
                  <div className="space-y-3">
                    <Textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="پاسخ خود را بنویسید..."
                      className="rounded-xl border-2 resize-none"
                      rows={4}
                    />
                    <Button
                      onClick={handleSendResponse}
                      disabled={!newResponse.trim() || sendingResponse}
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                    >
                      {sendingResponse ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <Send className="ml-2 h-4 w-4" />
                          ارسال پاسخ
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">تیکتی را برای مشاهده جزئیات انتخاب کنید</p>
              <p className="text-sm mt-2">تیکت‌های جدید در بالای لیست نمایش داده می‌شوند</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
