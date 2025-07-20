"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Phone, MessageSquare, Plus, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface Ticket {
  id: number
  subject: string
  message: string
  status: string
  created_at: string
  responses?: TicketResponse[]
}

interface TicketResponse {
  id: number
  message: string
  is_admin: boolean
  created_at: string
}

interface TicketFormProps {
  chatbotId: number
}

export default function TicketForm({ chatbotId }: TicketFormProps) {
  const [step, setStep] = useState<"phone" | "dashboard">("phone")
  const [userPhone, setUserPhone] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    userName: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userPhone.trim()) {
      toast.error("شماره تلفن را وارد کنید")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/user/${userPhone}`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
        setStep("dashboard")
      } else {
        toast.error("خطا در دریافت اطلاعات")
      }
    } catch (error) {
      toast.error("خطا در اتصال به سرور")
    } finally {
      setLoading(false)
    }
  }

  const handleNewTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicket.subject.trim() || !newTicket.message.trim() || !newTicket.userName.trim()) {
      toast.error("تمام فیلدها را پر کنید")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotId,
          userPhone,
          userName: newTicket.userName,
          subject: newTicket.subject,
          message: newTicket.message,
        }),
      })

      if (res.ok) {
        toast.success("تیکت با موفقیت ثبت شد")
        setNewTicket({ subject: "", message: "", userName: "" })
        setShowNewTicketForm(false)
        // بروزرسانی لیست تیکت‌ها
        const ticketsRes = await fetch(`/api/tickets/user/${userPhone}`)
        if (ticketsRes.ok) {
          const data = await ticketsRes.json()
          setTickets(data.tickets || [])
        }
      } else {
        toast.error("خطا در ثبت تیکت")
      }
    } catch (error) {
      toast.error("خطا در اتصال به سرور")
    } finally {
      setSubmitting(false)
    }
  }

  const fetchTicketDetails = async (ticketId: number) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedTicket({ ...data.ticket, responses: data.responses || [] })
      }
    } catch (error) {
      toast.error("خطا در دریافت جزئیات تیکت")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
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

  if (step === "phone") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Phone className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">ورود به سیستم تیکت</CardTitle>
          <p className="text-sm text-gray-600">شماره تلفن خود را وارد کنید</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تلفن</Label>
              <Input
                id="phone"
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="09123456789"
                className="rounded-xl border-2"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-xl">
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال بررسی...
                </>
              ) : (
                <>
                  <ArrowRight className="ml-2 h-4 w-4" />
                  ادامه
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* لیست تیکت‌ها و فرم جدید */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>تیکت‌های شما</CardTitle>
              <Badge variant="secondary">{tickets.length}</Badge>
            </div>
            <Button onClick={() => setShowNewTicketForm(!showNewTicketForm)} size="sm" className="rounded-xl">
              <Plus className="h-4 w-4 ml-1" />
              تیکت جدید
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showNewTicketForm && (
            <Card className="mb-6 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">ثبت تیکت جدید</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewTicketSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">نام شما</Label>
                    <Input
                      id="userName"
                      value={newTicket.userName}
                      onChange={(e) => setNewTicket({ ...newTicket, userName: e.target.value })}
                      placeholder="نام کامل خود را وارد کنید"
                      className="rounded-xl border-2"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">موضوع</Label>
                    <Input
                      id="subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      placeholder="موضوع تیکت را وارد کنید"
                      className="rounded-xl border-2"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">پیام</Label>
                    <Textarea
                      id="message"
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                      placeholder="توضیحات کامل مشکل یا درخواست خود را بنویسید"
                      className="rounded-xl border-2"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting} className="flex-1 rounded-xl">
                      {submitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          در حال ثبت...
                        </>
                      ) : (
                        <>
                          <Send className="ml-2 h-4 w-4" />
                          ثبت تیکت
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewTicketForm(false)}
                      className="rounded-xl"
                    >
                      انصراف
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>تیکتی وجود ندارد</p>
                  <p className="text-sm mt-1">اولین تیکت خود را ثبت کنید</p>
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
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm truncate flex-1">{ticket.subject}</h4>
                      <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{ticket.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>تیکت #{ticket.id}</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString("fa-IR")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* جزئیات تیکت */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {selectedTicket ? `جزئیات تیکت #${selectedTicket.id}` : "انتخاب تیکت"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{selectedTicket.subject}</h3>
                  <Badge className={`${getStatusColor(selectedTicket.status)}`}>
                    {getStatusLabel(selectedTicket.status)}
                  </Badge>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">{selectedTicket.message}</p>
                <div className="text-xs text-gray-500">
                  ایجاد شده: {new Date(selectedTicket.created_at).toLocaleString("fa-IR")}
                </div>
              </div>

              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    پاسخ‌ها ({selectedTicket.responses.length})
                  </h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {selectedTicket.responses
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
                              <span className="font-medium text-sm">{response.is_admin ? "🛡️ پشتیبانی" : "👤 شما"}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(response.created_at).toLocaleString("fa-IR")}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{response.message}</p>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
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
