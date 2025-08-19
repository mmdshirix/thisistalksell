"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Phone, User, MessageSquare, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface Ticket {
  id: number
  subject: string
  message: string
  phone: string
  name: string
  status: "open" | "in_progress" | "resolved" | "closed"
  created_at: string
  responses?: Array<{
    id: number
    message: string
    is_admin: boolean
    created_at: string
  }>
}

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

export default function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [activeView, setActiveView] = useState<"create" | "list">("create")
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    phone: "",
    name: "",
  })
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newResponse, setNewResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.message.trim() || !formData.phone.trim() || !formData.name.trim()) {
      return
    }

    setIsSubmitting(true)
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
        setFormData({ subject: "", message: "", phone: "", name: "" })
        alert("تیکت شما با موفقیت ثبت شد!")
        loadUserTickets(formData.phone)
        setActiveView("list")
      } else {
        alert("خطا در ثبت تیکت")
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
      alert("خطا در ثبت تیکت")
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadUserTickets = async (phone: string) => {
    if (!phone.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tickets/user/${phone}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
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
      if (response.ok) {
        const ticket = await response.json()
        setSelectedTicket(ticket)
      }
    } catch (error) {
      console.error("Error loading ticket details:", error)
    }
  }

  const submitResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return

    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newResponse,
          is_admin: false,
        }),
      })

      if (response.ok) {
        setNewResponse("")
        loadTicketDetails(selectedTicket.id)
      }
    } catch (error) {
      console.error("Error submitting response:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "باز", variant: "default" as const, icon: AlertCircle },
      in_progress: { label: "در حال بررسی", variant: "secondary" as const, icon: Clock },
      resolved: { label: "حل شده", variant: "default" as const, icon: CheckCircle },
      closed: { label: "بسته شده", variant: "destructive" as const, icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
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

  if (selectedTicket) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedTicket(null)}>
            بازگشت به لیست
          </Button>
          {getStatusBadge(selectedTicket.status)}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {selectedTicket.subject}
            </CardTitle>
            <CardDescription>
              ارسال شده توسط {selectedTicket.name} در {formatDate(selectedTicket.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{selectedTicket.message}</p>

            {selectedTicket.responses && selectedTicket.responses.length > 0 && (
              <>
                <Separator className="my-4" />
                <h4 className="font-semibold mb-3">پاسخ‌ها:</h4>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-3">
                    {selectedTicket.responses.map((response) => (
                      <div
                        key={response.id}
                        className={`p-3 rounded-lg ${
                          response.is_admin
                            ? "bg-blue-50 border-r-4 border-blue-500"
                            : "bg-gray-50 border-r-4 border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {response.is_admin ? "پشتیبانی" : selectedTicket.name}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(response.created_at)}</span>
                        </div>
                        <p className="text-gray-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}

            {selectedTicket.status !== "closed" && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <h4 className="font-semibold">پاسخ جدید:</h4>
                  <Textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    className="min-h-[100px]"
                  />
                  <Button onClick={submitResponse} disabled={!newResponse.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    ارسال پاسخ
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">سیستم تیکت پشتیبانی</h2>
        <div className="flex gap-2">
          <Button
            variant={activeView === "create" ? "default" : "outline"}
            onClick={() => setActiveView("create")}
            size="sm"
          >
            تیکت جدید
          </Button>
          <Button
            variant={activeView === "list" ? "default" : "outline"}
            onClick={() => setActiveView("list")}
            size="sm"
          >
            تیکت‌های من
          </Button>
        </div>
      </div>

      {activeView === "create" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              ثبت تیکت جدید
            </CardTitle>
            <CardDescription>برای دریافت پشتیبانی، فرم زیر را تکمیل کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    نام و نام خانوادگی
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="نام خود را وارد کنید"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    شماره تماس
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="09123456789"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">موضوع</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="موضوع تیکت را وارد کنید"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">پیام</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="توضیحات کامل مشکل یا سوال خود را بنویسید..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "در حال ارسال..." : "ثبت تیکت"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مشاهده تیکت‌های قبلی</CardTitle>
              <CardDescription>برای مشاهده تیکت‌های خود، شماره تماس را وارد کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="شماره تماس خود را وارد کنید"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
                <Button onClick={() => loadUserTickets(formData.phone)} disabled={!formData.phone.trim() || isLoading}>
                  {isLoading ? "در حال بارگذاری..." : "جستجو"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {tickets.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">تیکت‌های شما:</h3>
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4" onClick={() => loadTicketDetails(ticket.id)}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{ticket.subject}</h4>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>ثبت شده در {formatDate(ticket.created_at)}</span>
                      <span>کلیک برای مشاهده جزئیات</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tickets.length === 0 && formData.phone && !isLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">هیچ تیکتی برای این شماره تماس یافت نشد</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
