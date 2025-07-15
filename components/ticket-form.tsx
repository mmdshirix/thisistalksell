"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Phone, User, MessageSquare, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

interface TicketData {
  name: string
  phone: string
  message: string
  image?: File
}

export default function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [formData, setFormData] = useState<TicketData>({
    name: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleInputChange = (field: keyof TicketData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("حجم فایل نباید بیشتر از 5 مگابایت باشد")
        return
      }

      setFormData((prev) => ({ ...prev, image: file }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage("لطفاً نام خود را وارد کنید")
      return false
    }
    if (!formData.phone.trim()) {
      setErrorMessage("لطفاً شماره تلفن خود را وارد کنید")
      return false
    }
    if (!/^09\d{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      setErrorMessage("شماره تلفن وارد شده معتبر نیست")
      return false
    }
    if (!formData.message.trim()) {
      setErrorMessage("لطفاً پیام خود را وارد کنید")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append("chatbot_id", chatbotId.toString())
      submitData.append("name", formData.name)
      submitData.append("phone", formData.phone)
      submitData.append("message", formData.message)

      if (formData.image) {
        submitData.append("image", formData.image)
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        throw new Error("خطا در ارسال تیکت")
      }

      const result = await response.json()

      if (result.success) {
        setSubmitStatus("success")
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({ name: "", phone: "", message: "" })
          setImagePreview(null)
          setSubmitStatus("idle")
        }, 3000)
      } else {
        throw new Error(result.message || "خطا در ارسال تیکت")
      }
    } catch (error) {
      console.error("Ticket submission error:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "خطا در ارسال تیکت")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">تیکت شما با موفقیت ارسال شد</h3>
          <p className="text-sm text-gray-600 mb-4">تیکت شما ثبت شد و به زودی پاسخ داده خواهد شد</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700">شماره پیگیری: #{Date.now().toString().slice(-6)}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          ارسال تیکت پشتیبانی
        </CardTitle>
        <p className="text-sm text-gray-600">برای دریافت پشتیبانی تخصصی، فرم زیر را تکمیل کنید</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 text-sm">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              نام و نام خانوادگی
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="نام خود را وارد کنید"
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              شماره تلفن
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="09xxxxxxxxx"
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              پیام شما
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="توضیح کاملی از مشکل یا سوال خود ارائه دهید..."
              className="w-full min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              تصویر (اختیاری)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isSubmitting}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-xs text-gray-600">برای تغییر کلیک کنید</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">برای آپلود تصویر کلیک کنید</p>
                    <p className="text-xs text-gray-500">حداکثر 5 مگابایت</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                در حال ارسال...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                ارسال تیکت
              </>
            )}
          </Button>
        </form>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-700 text-center">
            پس از ارسال تیکت، پاسخ شما از طریق شماره تلفن ارسال خواهد شد
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
