"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Send, CheckCircle, AlertCircle } from "lucide-react"

interface TicketFormProps {
  chatbotId: number
  onClose?: () => void
}

export function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("حجم فایل نباید بیشتر از 5 مگابایت باشد")
        return
      }
      setSelectedFile(file)
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const submitFormData = new FormData()
      submitFormData.append("chatbotId", chatbotId.toString())
      submitFormData.append("name", formData.name)
      submitFormData.append("phone", formData.phone)
      submitFormData.append("email", formData.email)
      submitFormData.append("subject", formData.subject)
      submitFormData.append("message", formData.message)

      if (selectedFile) {
        submitFormData.append("image", selectedFile)
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: submitFormData,
      })

      if (!response.ok) {
        throw new Error("خطا در ارسال تیکت")
      }

      setSubmitStatus("success")
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      })
      setSelectedFile(null)

      // Auto close after 3 seconds
      setTimeout(() => {
        setSubmitStatus("idle")
        onClose?.()
      }, 3000)
    } catch (error) {
      console.error("Error submitting ticket:", error)
      setSubmitStatus("error")
      setErrorMessage("خطا در ارسال تیکت. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === "success") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">تیکت با موفقیت ارسال شد</h3>
          <p className="text-sm text-gray-600">تیکت شما ثبت شد و به زودی پاسخ داده خواهد شد.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200">
      <CardHeader className="bg-white">
        <CardTitle className="text-lg font-semibold text-gray-900">ارسال تیکت پشتیبانی</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          لطفاً اطلاعات خود را تکمیل کنید تا بتوانیم به شما کمک کنیم
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              نام و نام خانوادگی *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="نام خود را وارد کنید"
              className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              شماره تماس *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="09123456789"
              className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              ایمیل
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              موضوع *
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              required
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="موضوع تیکت خود را وارد کنید"
              className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              پیام *
            </Label>
            <Textarea
              id="message"
              name="message"
              required
              value={formData.message}
              onChange={handleInputChange}
              placeholder="توضیحات کامل مشکل یا درخواست خود را بنویسید..."
              rows={4}
              className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium text-gray-700">
              ضمیمه تصویر (اختیاری)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                <Upload className="w-4 h-4" />
                انتخاب فایل
              </Button>
              {selectedFile && <span className="text-xs text-gray-600 truncate max-w-32">{selectedFile.name}</span>}
            </div>
            <p className="text-xs text-gray-500">حداکثر حجم: 5 مگابایت - فرمت‌های مجاز: JPG, PNG, GIF</p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.phone || !formData.subject || !formData.message}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

export default TicketForm
