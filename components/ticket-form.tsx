"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Send, User, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

interface UserInfo {
  name: string
  email: string
  phone: string
}

interface Ticket {
  id: number
  subject: string
  message: string
  status: string
  created_at: string
  image_url?: string
  admin_response?: string
}

export function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [step, setStep] = useState<"info" | "ticket" | "history">("info")
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "", phone: "" })
  const [ticketData, setTicketData] = useState({ subject: "", message: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userTickets, setUserTickets] = useState<Ticket[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)

  // Load saved user info on component mount
  useEffect(() => {
    const savedInfo = localStorage.getItem("chatbot_user_info")
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo)
        setUserInfo(parsed)
        if (parsed.phone) {
          loadUserTickets(parsed.phone)
        }
      } catch (error) {
        console.error("Error parsing saved user info:", error)
      }
    }
  }, [])

  const loadUserTickets = async (phone: string) => {
    if (!phone) return

    setIsLoadingTickets(true)
    try {
      const response = await fetch(`/api/tickets/user/${encodeURIComponent(phone)}?chatbotId=${chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        setUserTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error loading user tickets:", error)
    } finally {
      setIsLoadingTickets(false)
    }
  }

  const handleUserInfoSubmit = () => {
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      alert("لطفاً تمام فیلدها را پر کنید")
      return
    }

    // Save user info to localStorage
    localStorage.setItem("chatbot_user_info", JSON.stringify(userInfo))

    // Load user's previous tickets
    loadUserTickets(userInfo.phone)

    setStep("ticket")
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم فایل نباید بیشتر از 5 مگابایت باشد")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("فقط فایل‌های تصویری مجاز هستند")
        return
      }

      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    const formData = new FormData()
    formData.append("file", imageFile)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  const handleTicketSubmit = async () => {
    if (!ticketData.subject || !ticketData.message) {
      alert("لطفاً موضوع و پیام تیکت را وارد کنید")
      return
    }

    setIsSubmitting(true)
    try {
      let imageUrl = null

      // Upload image if exists
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      // Submit ticket
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbot_id: chatbotId,
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          subject: ticketData.subject,
          message: ticketData.message,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit ticket")
      }

      alert("تیکت شما با موفقیت ارسال شد")

      // Reset form
      setTicketData({ subject: "", message: "" })
      setImageFile(null)
      setImagePreview(null)

      // Reload user tickets
      loadUserTickets(userInfo.phone)

      // Show history
      setStep("history")
    } catch (error) {
      console.error("Error submitting ticket:", error)
      alert("خطا در ارسال تیکت. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: "باز", variant: "default" as const, icon: AlertCircle },
      in_progress: { label: "در حال بررسی", variant: "secondary" as const, icon: Clock },
      resolved: { label: "حل شده", variant: "default" as const, icon: CheckCircle },
      closed: { label: "بسته", variant: "outline" as const, icon: CheckCircle },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.open
    const IconComponent = statusInfo.icon

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (step === "info") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-200">
        <CardHeader className="bg-white">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <User className="w-5 h-5 text-gray-700" />
            اطلاعات شخصی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">نام و نام خانوادگی</label>
            <Input
              value={userInfo.name}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="نام خود را وارد کنید"
              className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">ایمیل</label>
            <Input
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="example@email.com"
              className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">شماره تماس</label>
            <Input
              value={userInfo.phone}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="09xxxxxxxxx"
              className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUserInfoSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              ادامه
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
            >
              انصراف
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === "history") {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white border border-gray-200">
        <CardHeader className="bg-white">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <MessageSquare className="w-5 h-5 text-gray-700" />
            تیکت‌های شما
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          {isLoadingTickets ? (
            <div className="text-center py-4 text-gray-900">در حال بارگذاری...</div>
          ) : userTickets.length === 0 ? (
            <div className="text-center py-4 text-gray-500">هیچ تیکتی یافت نشد</div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {userTickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{ticket.message}</p>

                  {ticket.image_url && (
                    <div className="mb-2">
                      <img
                        src={ticket.image_url || "/placeholder.svg"}
                        alt="تصویر پیوست"
                        className="max-w-32 h-auto rounded border border-gray-200"
                      />
                    </div>
                  )}

                  {ticket.admin_response && (
                    <div className="bg-blue-50 p-3 rounded mt-2 border border-blue-100">
                      <p className="text-sm font-medium text-blue-800">پاسخ پشتیبانی:</p>
                      <p className="text-sm text-blue-700">{ticket.admin_response}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">{formatDate(ticket.created_at)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={() => setStep("ticket")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              تیکت جدید
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
            >
              بستن
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200">
      <CardHeader className="bg-white">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <MessageSquare className="w-5 h-5 text-gray-700" />
          ارسال تیکت جدید
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 bg-white">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">موضوع</label>
          <Input
            value={ticketData.subject}
            onChange={(e) => setTicketData((prev) => ({ ...prev, subject: e.target.value }))}
            placeholder="موضوع تیکت را وارد کنید"
            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">پیام</label>
          <Textarea
            value={ticketData.message}
            onChange={(e) => setTicketData((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="توضیحات کامل مشکل یا درخواست خود را بنویسید"
            rows={4}
            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">تصویر (اختیاری)</label>
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
            <label
              htmlFor="image-upload"
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white text-gray-900"
            >
              <Upload className="w-4 h-4 text-gray-700" />
              انتخاب تصویر
            </label>
            {imageFile && <span className="text-sm text-green-600">{imageFile.name}</span>}
          </div>

          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="پیش‌نمایش"
                className="max-w-full h-32 object-cover rounded border border-gray-200"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleTicketSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              "در حال ارسال..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                ارسال تیکت
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("history")}
            className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
          >
            تیکت‌های قبلی
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TicketForm
