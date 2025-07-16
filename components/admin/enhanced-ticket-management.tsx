"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Send, Filter, RefreshCw, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Ticket {
  id: number
  subject: string
  message: string
  status: "open" | "in_progress" | "closed"
  priority: "low" | "normal" | "high"
  created_at: string
  updated_at: string
  name: string
  email: string
  phone: string
  user_phone: string
  image_url?: string
  is_new?: boolean
}

interface TicketResponse {
  id: number
  response: string
  created_at: string
  is_admin_response: boolean
}

interface TicketCounts {
  status: {
    all: number
    open: number
    in_progress: number
    closed: number
  }
  priority: {
    all: number
    low: number
    normal: number
    high: number
  }
  newTickets: number
}

interface EnhancedTicketManagementProps {
  chatbotId: string | number
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

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [counts, setCounts] = useState<TicketCounts>({
    status: { all: 0, open: 0, in_progress: 0, closed: 0 },
    priority: { all: 0, low: 0, normal: 0, high: 0 },
    newTickets: 0,
  })

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setRefreshing(true)

    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (priorityFilter !== "all") params.append("priority", priorityFilter)
      params.append("sortBy", "created_at")
      params.append("sortOrder", "DESC")

      const res = await fetch(`/api/tickets/chatbot/${chatbotId}?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch tickets")

      const data = await res.json()
      setTickets(data.tickets || [])
      setCounts(data.counts || counts)

      // If a ticket was selected, update it with new data
      if (selectedTicket) {
        const updatedTicket = data.tickets.find((t: Ticket) => t.id === selectedTicket.id)
        if (updatedTicket) {
          setSelectedTicket(updatedTicket)
        }
      }
    } catch (error) {
      toast.error("خطا در دریافت لیست تیکت‌ها")
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (chatbotId) {
      fetchTickets()
      // Auto-refresh every 30 seconds for real-time updates
      const interval = setInterval(() => fetchTickets(false), 30000)
      return () => clearInterval(interval)
    }
  }, [chatbotId, statusFilter, priorityFilter])

  useEffect(() => {
    if (selectedTicket) {
      const fetchResponses = async () => {
        setLoadingResponses(true)
        try {
          const res = await fetch(`/api/tickets/${selectedTicket.id}/responses`)
          if (!res.ok) throw new Error("Failed to fetch responses")
          const data = await res.json()
          setResponses(data)
        } catch (error) {
          toast.error("خطا در دریافت پاسخ‌های تیکت")
          console.error(error)
        } finally {
          setLoadingResponses(false)
        }
      }
      fetchResponses()
    } else {
      setResponses([])
    }
  }, [selectedTicket])

  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return
    setSendingResponse(true)
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: newResponse, isAdminResponse: true }),
      })
      if (!res.ok) throw new Error("Failed to send response")
      const newResponseData = await res.json()
      setResponses((prev) => [...prev, newResponseData])
      setNewResponse("")
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update status")

      // Update local state
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: status as Ticket["status"] } : t)))
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as Ticket["status"] })
      }

      toast.success("وضعیت تیکت با موفقیت به‌روزرسانی شد")

      // Refresh tickets to update counts
      fetchTickets(false)
    } catch (error) {
      toast.error("خطا در به‌روزرسانی وضعیت")
      console.error(error)
    }
  }

  const getStatusBadge = (status: string, isNew?: boolean) => {
    const baseClasses = "relative"
    let badgeContent

    switch (status) {
      case "open":
        badgeContent = (
          <Badge variant="destructive" className={baseClasses}>
            باز
          </Badge>
        )
        break
      case "in_progress":
        badgeContent = <Badge className="bg-yellow-500 text-white">در حال بررسی</Badge>
        break
      case "closed":
        badgeContent = <Badge variant="secondary">بسته شده</Badge>
        break
      default:
        badgeContent = <Badge>{status}</Badge>
    }

    return (
      <div className="flex items-center gap-2">
        {badgeContent}
        {isNew && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            <Clock className="w-3 h-3 mr-1" />
            جدید
          </Badge>
        )}
      </div>
    )
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            بالا
          </Badge>
        )
      case "normal":
        return (
          <Badge variant="secondary" className="text-xs">
            متوسط
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-xs">
            پایین
          </Badge>
        )
      default:
        return <Badge className="text-xs">{priority}</Badge>
    }
  }

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">در حال بارگذاری تیکت‌ها...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{counts.status.all}</div>
            <div className="text-sm text-gray-500">کل تیکت‌ها</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{counts.status.open}</div>
            <div className="text-sm text-gray-500">تیکت‌های باز</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{counts.status.in_progress}</div>
            <div className="text-sm text-gray-500">در حال بررسی</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
              {counts.newTickets}
              {counts.newTickets > 0 && <AlertCircle className="w-4 h-4" />}
            </div>
            <div className="text-sm text-gray-500">تیکت‌های جدید</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Label>فیلترها:</Label>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="text-sm">
              وضعیت:
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه ({counts.status.all})</SelectItem>
                <SelectItem value="open">باز ({counts.status.open})</SelectItem>
                <SelectItem value="in_progress">در حال بررسی ({counts.status.in_progress})</SelectItem>
                <SelectItem value="closed">بسته ({counts.status.closed})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="priority-filter" className="text-sm">
              اولویت:
            </Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه ({counts.priority.all})</SelectItem>
                <SelectItem value="high">بالا ({counts.priority.high})</SelectItem>
                <SelectItem value="normal">متوسط ({counts.priority.normal})</SelectItem>
                <SelectItem value="low">پایین ({counts.priority.low})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="search" className="text-sm">
              جستجو:
            </Label>
            <Input
              id="search"
              placeholder="جستجو در تیکت‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => fetchTickets(false)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              لیست تیکت‌ها
              <Badge variant="outline">{filteredTickets.length}</Badge>
            </CardTitle>
            <CardDescription>
              {statusFilter !== "all" && `فیلتر: ${statusFilter} | `}
              {priorityFilter !== "all" && `اولویت: ${priorityFilter} | `}
              {searchTerm && `جستجو: "${searchTerm}" | `}
              {filteredTickets.length} تیکت یافت شد
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`cursor-pointer rounded-lg border-l-4 p-3 transition-all ${
                    selectedTicket?.id === ticket.id
                      ? "border-blue-500 bg-blue-50"
                      : ticket.is_new
                        ? "border-green-500 bg-green-50 hover:bg-green-100"
                        : "border-transparent hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-sm">{ticket.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {ticket.name} • {ticket.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(ticket.created_at).toLocaleDateString("fa-IR")} •
                        {new Date(ticket.created_at).toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(ticket.status, ticket.is_new)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                </div>
              ))}

              {filteredTickets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>هیچ تیکتی با این فیلترها یافت نشد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>جزئیات تیکت</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedTicket.name} • {selectedTicket.email}
                      {selectedTicket.phone && ` • ${selectedTicket.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedTicket.status, selectedTicket.is_new)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                </div>

                <div className="mb-4">
                  <Label>تغییر وضعیت:</Label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-[180px] mt-1">
                      <SelectValue placeholder="تغییر وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">باز</SelectItem>
                      <SelectItem value="in_progress">در حال بررسی</SelectItem>
                      <SelectItem value="closed">بسته شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{selectedTicket.message}</p>
                </div>

                {selectedTicket.image_url && (
                  <div className="mb-4">
                    <Label>تصویر ضمیمه:</Label>
                    <a href={selectedTicket.image_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedTicket.image_url || "/placeholder.svg"}
                        alt="Ticket attachment"
                        className="max-w-xs rounded-lg mt-2 cursor-pointer hover:opacity-80"
                      />
                    </a>
                  </div>
                )}

                <hr className="my-4" />

                <div className="mb-4">
                  <Label className="text-base font-semibold">پاسخ‌ها:</Label>
                </div>

                <div className="max-h-64 space-y-4 overflow-y-auto pr-2 mb-4">
                  {loadingResponses ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="mr-2">در حال بارگذاری پاسخ‌ها...</span>
                    </div>
                  ) : responses.length > 0 ? (
                    responses.map((res) => (
                      <div
                        key={res.id}
                        className={`rounded-lg p-3 ${
                          res.is_admin_response
                            ? "bg-blue-100 border-l-4 border-blue-500"
                            : "bg-gray-100 border-l-4 border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={res.is_admin_response ? "default" : "secondary"} className="text-xs">
                            {res.is_admin_response ? "پاسخ ادمین" : "پاسخ کاربر"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(res.created_at).toLocaleString("fa-IR")}
                          </span>
                        </div>
                        <p className="text-sm">{res.response}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">هنوز پاسخی ثبت نشده است</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response">پاسخ جدید:</Label>
                  <Textarea
                    id="response"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="پاسخ خود را اینجا بنویسید..."
                    rows={3}
                  />
                  <Button
                    onClick={handleSendResponse}
                    disabled={sendingResponse || !newResponse.trim()}
                    className="w-full"
                  >
                    {sendingResponse ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Send className="h-4 w-4 ml-2" />
                    )}
                    ارسال پاسخ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500">
                <p>برای مشاهده جزئیات، یک تیکت را از لیست انتخاب کنید.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
