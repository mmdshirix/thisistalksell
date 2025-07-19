"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Send, CheckCircle, AlertCircle, Phone, Plus, MessageSquare, Clock, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

interface UserTicket {
  id: number
  subject: string
  message: string
  status: string
  created_at: string
  image_url?: string
  admin_response?: string
}

export function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [currentStep, setCurrentStep] = useState<"phone" | "dashboard">("phone")
  const [userPhone, setUserPhone] = useState("")
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [userTickets, setUserTickets] = useState<UserTicket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userPhone.trim()) return

    setPhoneLoading(true)
    try {
      // Fetch user's existing tickets
      const response = await fetch(`/api/tickets/user/${encodeURIComponent(userPhone)}?chatbotId=${chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        setUserTickets(data.tickets || [])
      }
      setCurrentStep("dashboard")
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setCurrentStep("dashboard") // Still proceed to dashboard
    } finally {
      setPhoneLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: userPhone,
          chatbot_id: chatbotId,
        }),
      })

      if (!response.ok) {
        throw new Error("خطا در ارسال تیکت")
      }

      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      setShowNewTicketForm(false)

      // Refresh tickets list
      const ticketsResponse = await fetch(`/api/tickets/user/${encodeURIComponent(userPhone)}?chatbotId=${chatbotId}`)
      if (ticketsResponse.ok) {
        const data = await ticketsResponse.json()
        setUserTickets(data.tickets || [])
      }
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "خطا در ارسال تیکت")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-red-100 text-red-700 border-red-200">باز</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">در حال بررسی</Badge>
      case "closed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">بسته شده</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>
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

  // Phone input step
  if (currentStep === "phone") {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">ورود به سیستم تیکت</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              برای مشاهده تیکت‌های خود، شماره تلفن را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  شماره تلفن
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="09123456789"
                  className="h-12 text-center text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={phoneLoading || !userPhone.trim()}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {phoneLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    در حال بررسی...
                  </>
                ) : (
                  <>
                    ورود
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success message
  if (submitStatus === "success") {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تیکت با موفقیت ارسال شد</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  تیکت شما دریافت شد و به زودی پاسخ داده خواهد شد.
                </p>
              </div>
              <Button
                onClick={() => setSubmitStatus("idle")}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                بازگشت به داشبورد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard step
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">داشبورد تیکت‌ها</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">شماره تماس: {userPhone}</p>
        </div>
        <Button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          تیکت جدید
        </Button>
      </div>

      {/* New Ticket Form */}
      {showNewTicketForm && (
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">ایجاد تیکت جدید</CardTitle>
          </CardHeader>
          <CardContent>
            {submitStatus === "error" && (
              <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleNewTicketSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    نام و نام خانوادگی *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ایمیل
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  موضوع *
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="موضوع تیکت خود را وارد کنید"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  پیام *
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="min-h-[120px] rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  placeholder="توضیحات کامل مشکل یا سوال خود را بنویسید..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTicketForm(false)}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      ارسال تیکت
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Tickets */}
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            تیکت‌های شما ({userTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userTickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">هنوز تیکتی ثبت نکرده‌اید</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                برای ایجاد تیکت جدید روی دکمه "تیکت جدید" کلیک کنید
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ticket.subject}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{ticket.message}</p>

                  {ticket.image_url && (
                    <div className="mb-3">
                      <img
                        src={ticket.image_url || "/placeholder.svg"}
                        alt="ضمیمه تیکت"
                        className="max-w-xs rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}

                  {ticket.admin_response && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">پاسخ پشتیبانی:</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {ticket.admin_response}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TicketForm
