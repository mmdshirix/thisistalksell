"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Send,
  ArrowRight,
  ArrowLeft,
  Phone,
  Plus,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Ticket {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  image_url?: string
}

interface TicketResponse {
  id: number
  message: string
  is_admin: boolean
  created_at: string
}

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

export default function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [step, setStep] = useState<"phone" | "dashboard">("phone")
  const [phone, setPhone] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // فرم تیکت جدید
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      toast({ title: "❌ خطا", description: "لطفاً شماره تلفن را وارد کنید", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/user/${encodeURIComponent(phone)}?chatbotId=${chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
        setStep("dashboard")
      } else {
        toast({ title: "❌ خطا", description: "خطا در دریافت تیکت‌ها", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "❌ خطا", description: "خطا در ارتباط با سرور", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "❌ خطا", description: "حجم فایل نباید بیشتر از 5 مگابایت باشد", variant: "destructive" })
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({ title: "❌ خطا", description: "لطفاً تمام فیلدهای الزامی را پر کنید", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      let imageUrl = null
      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", imageFile)
        const uploadResponse = await fetch("/api/upload", { method: "POST", body: uploadFormData })
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      const ticketData = {
        chatbot_id: chatbotId,
        name: formData.name,
        email: formData.email || "",
        phone: phone,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        image_url: imageUrl,
        status: "open",
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      })

      if (response.ok) {
        toast({ title: "✅ موفقیت", description: "تیکت شما با موفقیت ثبت شد!" })
        setFormData({ name: "", email: "", subject: "", message: "", priority: "normal" })
        setImageFile(null)
        setImagePreview(null)
        setShowNewTicketForm(false)

        // بروزرسانی لیست تیکت‌ها
        const userResponse = await fetch(`/api/tickets/user/${encodeURIComponent(phone)}?chatbotId=${chatbotId}`)
        if (userResponse.ok) {
          const data = await userResponse.json()
          setTickets(data.tickets || [])
        }
      } else {
        toast({ title: "❌ خطا", description: "خطا در ثبت تیکت", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "❌ خطا", description: "خطا در ارتباط با سرور", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const loadTicketResponses = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/responses`)
      if (response.ok) {
        const data = await response.json()
        setResponses(data)
      }
    } catch (error) {
      console.error("Error loading responses:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "باز", color: "bg-blue-500 text-white" },
      pending: { label: "در انتظار", color: "bg-yellow-500 text-white" },
      in_progress: { label: "در حال بررسی", color: "bg-orange-500 text-white" },
      resolved: { label: "حل شده", color: "bg-green-500 text-white" },
      closed: { label: "بسته", color: "bg-gray-500 text-white" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "in_progress":
        return <MessageCircle className="h-4 w-4 text-orange-600" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "closed":
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />
    }
  }

  if (step === "phone") {
    return (
      <div className="space-y-6">
        <Card className="border-2 rounded-xl bg-white text-gray-900">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">ورود به سیستم تیکت</CardTitle>
            <CardDescription className="text-gray-600">
              برای مشاهده تیکت‌های خود و ثبت تیکت جدید، شماره تلفن خود را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-gray-700">
                  شماره تلفن
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="rounded-xl border-2 bg-white text-gray-900"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    در حال بررسی...
                  </>
                ) : (
                  <>
                    ادامه
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* هدر داشبورد */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("phone")}
            className="rounded-xl bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 ml-1" />
            بازگشت
          </Button>
          <div>
            <h3 className="font-bold text-lg text-gray-900">داشبورد تیکت‌ها</h3>
            <p className="text-sm text-gray-600">شماره تلفن: {phone}</p>
          </div>
        </div>
        <Button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 ml-2" />
          تیکت جدید
        </Button>
      </div>

      {/* فرم تیکت جدید */}
      {showNewTicketForm && (
        <Card className="border-2 rounded-xl border-green-200 bg-white">
          <CardHeader>
            <CardTitle className="text-green-700">ثبت تیکت جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700">
                    نام و نام خانوادگی *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-2 bg-white text-gray-900"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">
                    ایمیل
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-2 bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="text-gray-700">
                  موضوع *
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="rounded-xl border-2 bg-white text-gray-900"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-700">
                  پیام *
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="rounded-xl border-2 bg-white text-gray-900"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-gray-700">
                  تصویر ضمیمه (اختیاری)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    className="rounded-xl bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    انتخاب تصویر
                  </Button>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-xs mx-auto rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      ثبت تیکت
                      <Send className="mr-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTicketForm(false)}
                  className="rounded-xl bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* لیست تیکت‌ها */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900">تیکت‌های شما ({tickets.length})</h4>
        {tickets.length === 0 ? (
          <Card className="border-2 rounded-xl bg-white">
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">هیچ تیکتی ثبت نشده است</p>
            </CardContent>
          </Card>
        ) : (
          tickets
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((ticket) => (
              <Card key={ticket.id} className="border-2 rounded-xl bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <h5 className="font-bold text-gray-900">{ticket.subject}</h5>
                        <p className="text-sm text-gray-600">
                          {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{ticket.message}</p>

                  {ticket.image_url && (
                    <div className="mb-3">
                      <img
                        src={ticket.image_url || "/placeholder.svg"}
                        alt="ضمیمه تیکت"
                        className="max-w-xs rounded-xl border"
                      />
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(ticket)
                      loadTicketResponses(ticket.id)
                    }}
                    className="rounded-xl bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    مشاهده جزئیات
                  </Button>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* جزئیات تیکت */}
      {selectedTicket && (
        <Card className="border-2 rounded-xl border-blue-200 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-700">جزئیات تیکت #{selectedTicket.id}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                بستن
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">موضوع:</Label>
                <p className="font-medium text-gray-900">{selectedTicket.subject}</p>
              </div>
              <div>
                <Label className="text-gray-700">وضعیت:</Label>
                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
              </div>
            </div>

            <div>
              <Label className="text-gray-700">پیام:</Label>
              <p className="mt-1 p-3 bg-gray-50 rounded-xl text-gray-900">{selectedTicket.message}</p>
            </div>

            {responses.length > 0 && (
              <div>
                <Label className="text-gray-700">پاسخ‌های ادمین:</Label>
                <div className="space-y-2 mt-2">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-xl ${
                        response.is_admin ? "bg-blue-50 border-r-4 border-blue-500" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600">{response.is_admin ? "ادمین" : "شما"}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(response.created_at).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
