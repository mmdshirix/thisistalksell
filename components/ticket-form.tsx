"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Send, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

interface TicketData {
  name: string
  phone: string
  email: string
  subject: string
  priority: "low" | "medium" | "high"
  message: string
  image?: File
}

export default function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [formData, setFormData] = useState<TicketData>({
    name: "",
    phone: "",
    email: "",
    subject: "",
    priority: "medium",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleInputChange = (field: keyof TicketData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("chatbot_id", chatbotId.toString())
      formDataToSend.append("name", formData.name)
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("subject", formData.subject)
      formDataToSend.append("priority", formData.priority)
      formDataToSend.append("message", formData.message)

      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        setSubmitStatus("success")
        setTimeout(() => {
          setFormData({
            name: "",
            phone: "",
            email: "",
            subject: "",
            priority: "medium",
            message: "",
          })
          setImagePreview(null)
          setSubmitStatus("idle")
        }, 2000)
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name && formData.phone && formData.subject && formData.message

  if (submitStatus === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">تیکت با موفقیت ارسال شد</h3>
          <p className="text-sm text-gray-600">تیکت شما ثبت شد و به زودی پاسخ داده خواهد شد.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 text-center">ارسال تیکت پشتیبانی</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                نام و نام خانوادگی *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="نام خود را وارد کنید"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                شماره تماس *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="09123456789"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              ایمیل
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="example@email.com"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                موضوع *
              </Label>
              <Input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="موضوع تیکت"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                اولویت
              </Label>
              <Select value={formData.priority} onValueChange={(value: any) => handleInputChange("priority", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">کم</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">بالا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              پیام *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="توضیحات کامل مشکل یا درخواست خود را بنویسید..."
              className="mt-1 min-h-[100px] resize-none"
              required
            />
          </div>

          <div>
            <Label htmlFor="image" className="text-sm font-medium text-gray-700">
              ضمیمه تصویر
            </Label>
            <div className="mt-1">
              <input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                className="w-full h-10 border-dashed border-2 border-gray-300 hover:border-gray-400"
              >
                <Upload className="w-4 h-4 ml-2" />
                انتخاب تصویر
              </Button>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {submitStatus === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">خطا در ارسال تیکت. لطفاً دوباره تلاش کنید.</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={cn(
              "w-full h-11 font-medium transition-all",
              isFormValid && !isSubmitting
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed",
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  )
}
