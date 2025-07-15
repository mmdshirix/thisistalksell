"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

export default function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
    image: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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
      const submitFormData = new FormData()
      submitFormData.append("chatbot_id", chatbotId.toString())
      submitFormData.append("name", formData.name)
      submitFormData.append("phone", formData.phone)
      submitFormData.append("message", formData.message)
      if (formData.image) {
        submitFormData.append("image", formData.image)
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: submitFormData,
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({ name: "", phone: "", message: "", image: null })
        setImagePreview(null)
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

  if (submitStatus === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">تیکت با موفقیت ارسال شد</h3>
              <p className="text-sm text-gray-600 mt-2">تیکت شما دریافت شد و به زودی پاسخ داده خواهد شد.</p>
            </div>
            <Button onClick={() => setSubmitStatus("idle")} className="w-full">
              ارسال تیکت جدید
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          ارسال تیکت پشتیبانی
        </CardTitle>
        <CardDescription>برای دریافت پشتیبانی، فرم زیر را تکمیل کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              نام و نام خانوادگی
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="نام خود را وارد کنید"
              required
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              شماره تماس
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="09123456789"
              required
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              پیام
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="توضیح مشکل یا سوال خود را بنویسید..."
              rows={4}
              required
              className="text-right resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              تصویر (اختیاری)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <label htmlFor="image" className="cursor-pointer">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded mx-auto"
                    />
                    <p className="text-sm text-gray-600">برای تغییر تصویر کلیک کنید</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">برای آپلود تصویر کلیک کنید</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {submitStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              خطا در ارسال تیکت. لطفاً دوباره تلاش کنید.
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
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
