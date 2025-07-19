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
  const [step, setStep] = useState<"phone" | "dashboard">(1)
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
      const response = await fetch(`/api/tickets/user/${encodeURIComponent(phone)}`)
      if (response.ok) {
        const userTickets = await response.json()
        setTickets(userTickets)
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
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
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
        email: formData.email,
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
        const userResponse = await fetch(`/api/tickets/user/${encodeURIComponent(phone)}`)
        if (userResponse.ok) {
          const userTickets = await userResponse.json()
          setTickets(userTickets)
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
      open: { label: "باز", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      pending: { label: "در انتظار", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      in_progress: {
        label: "در حال بررسی",
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      },
      resolved: { label: "حل شده", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      closed: { label: "بسته", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
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
        <Card className="border-2 rounded-xl dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl dark:text-white">ورود به سیستم تیکت</CardTitle>
            <CardDescription className="dark:text-gray-300">
              برای مشاهده تیکت‌های خود و ثبت تیکت جدید، شماره تلفن خود را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phone" className="dark:text-gray-200">
                  شماره تلفن
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="rounded-xl border-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "در حال بررسی..." : "ادامه"}
                <ArrowRight className="mr-2 h-4 w-4" />
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
            className="rounded-xl dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 ml-1" />
            بازگشت
          </Button>
          <div>
            <h3 className="font-bold text-lg dark:text-white">داشبورد تیکت‌ها</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">شماره تلفن: {phone}</p>
          </div>
        </div>
        <Button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="rounded-xl bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
        >
          <Plus className="h-4 w-4 ml-2" />
          تیکت جدید
        </Button>
      </div>

      {/* فرم تیکت جدید */}
      {showNewTicketForm && (
        <Card className="border-2 rounded-xl border-green-200 dark:border-green-800 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">ثبت تیکت جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="dark:text-gray-200">
                    نام و نام خانوادگی *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="dark:text-gray-200">
                    ایمیل *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="dark:text-gray-200">
                  موضوع *
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="rounded-xl border-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message" className="dark:text-gray-200">
                  پیام *
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="rounded-xl border-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image" className="dark:text-gray-200">
                  تصویر ضمیمه (اختیاری)
                </Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
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
                    className="rounded-xl dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
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
                  className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  {submitting ? "در حال ارسال..." : "ثبت تیکت"}
                  <Send className="mr-2 h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTicketForm(false)}
                  className="rounded-xl dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
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
        <h4 className="font-bold dark:text-white">تیکت‌های شما ({tickets.length})</h4>
        {tickets.length === 0 ? (
          <Card className="border-2 rounded-xl dark:border-gray-700 dark:bg-gray-800">
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">هیچ تیکتی ثبت نشده است</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="border-2 rounded-xl dark:border-gray-700 dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <h5 className="font-bold dark:text-white">{ticket.subject}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{ticket.message}</p>

                {ticket.image_url && (
                  <div className="mb-3">
                    <img
                      src={ticket.image_url || "/placeholder.svg"}
                      alt="ضمیمه تیکت"
                      className="max-w-xs rounded-xl border dark:border-gray-600"
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
                  className="rounded-xl dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
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
        <Card className="border-2 rounded-xl border-blue-200 dark:border-blue-800 dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-700 dark:text-blue-400">جزئیات تیکت #{selectedTicket.id}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                بستن
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-200">موضوع:</Label>
                <p className="font-medium dark:text-white">{selectedTicket.subject}</p>
              </div>
              <div>
                <Label className="dark:text-gray-200">وضعیت:</Label>
                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
              </div>
            </div>

            <div>
              <Label className="dark:text-gray-200">پیام:</Label>
              <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl dark:text-white">
                {selectedTicket.message}
              </p>
            </div>

            {responses.length > 0 && (
              <div>
                <Label className="dark:text-gray-200">پاسخ‌های ادمین:</Label>
                <div className="space-y-2 mt-2">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-xl ${
                        response.is_admin
                          ? "bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500"
                          : "bg-gray-50 dark:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {response.is_admin ? "ادمین" : "شما"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(response.created_at).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                      <p className="text-sm dark:text-white">{response.message}</p>
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
