"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
}

export function TicketForm({ chatbotId, onClose }: TicketFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
          chatbot_id: chatbotId,
        }),
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
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "خطا در ارسال تیکت")
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
        <CardTitle className="text-right">ارسال تیکت پشتیبانی</CardTitle>
        <CardDescription className="text-right">
          لطفاً اطلاعات خود را وارد کنید تا بتوانیم به شما کمک کنیم
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitStatus === "error" && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">
              نام و نام خانوادگی *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="text-right"
              placeholder="نام خود را وارد کنید"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-right block">
              شماره تماس *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="text-right"
              placeholder="09123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-right block">
              ایمیل
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="text-right"
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-right block">
              موضوع *
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="text-right"
              placeholder="موضوع تیکت خود را وارد کنید"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-right block">
              پیام *
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              className="text-right min-h-[100px]"
              placeholder="توضیحات کامل مشکل یا سوال خود را بنویسید..."
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
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
        </form>
      </CardContent>
    </Card>
  )
}

export default TicketForm
