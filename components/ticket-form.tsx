"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Send, MessageCircle, Clock, CheckCircle, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

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
  responses?: Array<{
    id: number
    message: string
    is_admin: boolean
    created_at: string
  }>
}

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  open: "باز",
  pending: "در انتظار",
  answered: "پاسخ داده شده",
  closed: "بسته شده",
}

export default function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [activeView, setActiveView] = useState<"form" | "history">("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newResponse, setNewResponse] = useState("")
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
    imageUrl: "",
  })

  // Load user's tickets when switching to history view
  useEffect(() => {
    if (activeView === "history" && formData.phone) {
      loadUserTickets()
    }
  }, [activeView, formData.phone])

  const loadUserTickets = async () => {
    if (!formData.phone) return

    setIsLoadingTickets(true)
    try {
      const response = await fetch(`/api/tickets/user/${formData.phone}?chatbotId=${chatbotId}`)
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error loading tickets:", error)
    } finally {
      setIsLoadingTickets(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }))
      }
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotId,
          ...formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitSuccess(true)
        setFormData({
          name: "",
          phone: "",
          email: "",
          subject: "",
          message: "",
          imageUrl: "",
        })

        // Auto switch to history after 2 seconds
        setTimeout(() => {
          setActiveView("history")
          setSubmitSuccess(false)
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResponseSubmit = async (ticketId: number) => {
    if (!newResponse.trim()) return

    setIsSubmittingResponse(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newResponse,
          isAdmin: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewResponse("")
        // Reload ticket details
        if (selectedTicket) {
          const ticketResponse = await fetch(`/api/tickets/${ticketId}`)
          const ticketData = await ticketResponse.json()
          if (ticketData.success) {
            setSelectedTicket(ticketData.ticket)
          }
        }
        // Reload tickets list
        loadUserTickets()
      }
    } catch (error) {
      console.error("Error submitting response:", error)
    } finally {
      setIsSubmittingResponse(false)
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

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">تیکت شما ثبت شد!</h3>
        <p className="text-sm text-gray-600 mb-4">به زودی با شما تماس خواهیم گرفت</p>
        <div className="w-8 h-1 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ color: "white" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant={activeView === "form" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("form")}
            className={cn(
              "text-xs",
              activeView === "form"
                ? "bg-white text-gray-900"
                : "bg-transparent border-white text-white hover:bg-white/10",
            )}
          >
            تیکت جدید
          </Button>
          <Button
            variant={activeView === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("history")}
            className={cn(
              "text-xs",
              activeView === "history"
                ? "bg-white text-gray-900"
                : "bg-transparent border-white text-white hover:bg-white/10",
            )}
          >
            تیکت‌های من
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeView === "form" ? (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">ارسال تیکت جدید</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      name="name"
                      placeholder="نام و نام خانوادگی"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
                    />
                  </div>
                  <div>
                    <Input
                      name="phone"
                      placeholder="شماره تماس"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
                    />
                  </div>
                </div>

                <Input
                  name="email"
                  type="email"
                  placeholder="ایمیل (اختیاری)"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
                />

                <Input
                  name="subject"
                  placeholder="موضوع تیکت"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
                />

                <Textarea
                  name="message"
                  placeholder="پیام شما..."
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/70 resize-none"
                />

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">ضمیمه تصویر</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {formData.imageUrl && <span className="text-xs text-green-300">✓ تصویر آپلود شد</span>}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-gray-900 hover:bg-white/90"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      در حال ارسال...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      ارسال تیکت
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {!formData.phone ? (
              <Card className="bg-white/10 border-white/20">
                <CardContent className="pt-6">
                  <p className="text-white/80 text-center mb-4">
                    برای مشاهده تیکت‌های خود، ابتدا شماره تماس را وارد کنید
                  </p>
                  <Input
                    name="phone"
                    placeholder="شماره تماس"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
                  />
                </CardContent>
              </Card>
            ) : selectedTicket ? (
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">تیکت #{selectedTicket.id}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTicket(null)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[selectedTicket.status]}>{statusLabels[selectedTicket.status]}</Badge>
                    <span className="text-white/60 text-sm">{formatDate(selectedTicket.created_at)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">{selectedTicket.subject}</h4>
                    <p className="text-white/80 text-sm">{selectedTicket.message}</p>
                    {selectedTicket.image_url && (
                      <img
                        src={selectedTicket.image_url || "/placeholder.svg"}
                        alt="ضمیمه تیکت"
                        className="mt-2 max-w-full h-32 object-cover rounded"
                      />
                    )}
                  </div>

                  {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                    <>
                      <Separator className="bg-white/20" />
                      <div className="space-y-3">
                        <h5 className="text-white font-medium flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          پاسخ‌ها
                        </h5>
                        {selectedTicket.responses.map((response) => (
                          <div
                            key={response.id}
                            className={cn(
                              "p-3 rounded-lg",
                              response.is_admin
                                ? "bg-blue-500/20 border-r-2 border-blue-400"
                                : "bg-white/10 border-r-2 border-white/30",
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-white/60">{response.is_admin ? "پشتیبانی" : "شما"}</span>
                              <span className="text-xs text-white/40">{formatDate(response.created_at)}</span>
                            </div>
                            <p className="text-white/90 text-sm">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {selectedTicket.status !== "closed" && (
                    <>
                      <Separator className="bg-white/20" />
                      <div className="space-y-3">
                        <h5 className="text-white font-medium">پاسخ جدید</h5>
                        <Textarea
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                          placeholder="پاسخ خود را بنویسید..."
                          rows={3}
                          className="bg-white/10 border-white/30 text-white placeholder:text-white/70 resize-none"
                        />
                        <Button
                          onClick={() => handleResponseSubmit(selectedTicket.id)}
                          disabled={!newResponse.trim() || isSubmittingResponse}
                          className="bg-white text-gray-900 hover:bg-white/90"
                        >
                          {isSubmittingResponse ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              در حال ارسال...
                            </div>
                          ) : (
                            "ارسال پاسخ"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div>
                {isLoadingTickets ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : tickets.length === 0 ? (
                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
                      <p className="text-white/80">هیچ تیکتی یافت نشد</p>
                      <p className="text-white/60 text-sm mt-1">
                        تیکت جدید ایجاد کنید تا بتوانید آن را اینجا مشاهده کنید
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <Card
                        key={ticket.id}
                        className="bg-white/10 border-white/20 cursor-pointer hover:bg-white/15 transition-colors"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">
                              #{ticket.id} - {ticket.subject}
                            </h4>
                            <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                          </div>
                          <p className="text-white/70 text-sm line-clamp-2 mb-2">{ticket.message}</p>
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(ticket.created_at)}
                            </span>
                            {ticket.responses && ticket.responses.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {ticket.responses.length} پاسخ
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
