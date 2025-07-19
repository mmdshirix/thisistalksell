"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  Mail,
  MessageSquare,
  FileText,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TicketFormProps {
  chatbotId: number
  onClose: () => void
  onShowTickets: (phone: string) => void
}

export function TicketForm({ chatbotId, onClose, onShowTickets }: TicketFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [phone, setPhone] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.trim()) {
      setStep(2)
    }
  }

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
          phone,
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
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "خطا در ارسال تیکت")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewTickets = () => {
    onShowTickets(phone)
  }

  const handleNewTicket = () => {
    setSubmitStatus("idle")
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
  }

  if (submitStatus === "success") {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تیکت با موفقیت ارسال شد</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  تیکت شما دریافت شد و به زودی پاسخ داده خواهد شد.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleNewTicket}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  ارسال تیکت جدید
                </Button>
                <Button
                  onClick={handleViewTickets}
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                >
                  مشاهده تیکت‌های من
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">پشتیبانی و تیکت</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">شماره تماس خود را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right block text-gray-700 dark:text-gray-300 font-medium">
                  شماره تماس
                </Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pr-10 text-right rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="09123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-medium"
                  disabled={!phone.trim()}
                >
                  ادامه
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>

                <Button
                  type="button"
                  onClick={handleViewTickets}
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 rounded-xl h-12 font-medium bg-transparent"
                  disabled={!phone.trim()}
                >
                  مشاهده تیکت‌های قبلی
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">ارسال تیکت جدید</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">اطلاعات تیکت خود را تکمیل کنید</CardDescription>
        </CardHeader>
        <CardContent>
          {submitStatus === "error" && (
            <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right block text-gray-700 dark:text-gray-300 font-medium">
                نام و نام خانوادگی *
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="pr-10 text-right rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="نام خود را وارد کنید"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block text-gray-700 dark:text-gray-300 font-medium">
                ایمیل
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pr-10 text-right rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-right block text-gray-700 dark:text-gray-300 font-medium">
                موضوع *
              </Label>
              <div className="relative">
                <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="pr-10 text-right rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="موضوع تیکت خود را وارد کنید"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-right block text-gray-700 dark:text-gray-300 font-medium">
                پیام *
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                className="text-right min-h-[100px] rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                placeholder="توضیحات کامل مشکل یا سوال خود را بنویسید..."
              />
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 font-medium"
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

              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-600 rounded-xl h-12 font-medium"
              >
                بازگشت
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default TicketForm
