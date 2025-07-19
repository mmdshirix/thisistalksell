"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Send, User, Mail, Phone, MessageSquare, Search, Plus } from "lucide-react"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
  onShowTickets: (phone: string) => void
}

export default function TicketForm({ chatbotId, onClose, onShowTickets }: TicketFormProps) {
  const [step, setStep] = useState<"phone" | "form">("phone")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [phoneInput, setPhoneInput] = useState("")

  const handlePhoneSubmit = () => {
    if (phoneInput.trim()) {
      setFormData({ ...formData, phone: phoneInput.trim() })
      setStep("form")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)

      let imageUrl = null
      if (image) {
        const imageFormData = new FormData()
        imageFormData.append("file", image)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        })
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          chatbot_id: chatbotId,
          image_url: imageUrl,
        }),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          priority: "normal",
        })
        setImage(null)
        setImagePreview(null)
        setStep("phone")
        setPhoneInput("")
        onClose()
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const priorityOptions = [
    { value: "low", label: "کم", color: "text-green-600 dark:text-green-400" },
    { value: "normal", label: "متوسط", color: "text-blue-600 dark:text-blue-400" },
    { value: "high", label: "بالا", color: "text-red-600 dark:text-red-400" },
  ]

  if (step === "phone") {
    return (
      <Card className="w-full max-w-md mx-auto border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            ارتباط با پشتیبانی
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">لطفاً شماره تلفن خود را وارد کنید</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              شماره تلفن
            </Label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                id="phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="09123456789"
                className="pr-10 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePhoneSubmit}
              disabled={!phoneInput.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 ml-2" />
              ارسال تیکت جدید
            </Button>
            <Button
              onClick={() => onShowTickets(phoneInput.trim())}
              disabled={!phoneInput.trim()}
              variant="outline"
              className="flex-1 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Search className="w-4 h-4 ml-2" />
              مشاهده تیکت‌ها
            </Button>
          </div>

          <div className="text-center pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              بازگشت به چت
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          ارسال تیکت جدید
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">لطفاً اطلاعات خود و مشکل را شرح دهید</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              نام و نام خانوادگی *
            </Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="نام کامل خود را وارد کنید"
                className="pr-10 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ایمیل
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className="pr-10 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                dir="ltr"
              />
            </div>
          </div>

          {/* Phone Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="phone-display" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              شماره تلفن
            </Label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                id="phone-display"
                value={formData.phone}
                className="pr-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                readOnly
                dir="ltr"
              />
            </div>
          </div>

          {/* Priority Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">اولویت</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className="border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-gray-900 dark:text-white">
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              موضوع *
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="موضوع تیکت را خلاصه کنید"
              className="border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              required
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              پیام *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="مشکل یا سوال خود را به تفصیل شرح دهید..."
              className="min-h-[100px] resize-none border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">ضمیمه تصویر (اختیاری)</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center bg-gray-50 dark:bg-gray-800">
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-full h-32 object-cover rounded-lg mx-auto"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                    }}
                    className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    حذف تصویر
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">برای آپلود تصویر کلیک کنید</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    انتخاب فایل
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("phone")}
              className="flex-1 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              بازگشت
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.name || !formData.subject || !formData.message}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
              ) : (
                <Send className="w-4 h-4 ml-2" />
              )}
              ارسال تیکت
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
