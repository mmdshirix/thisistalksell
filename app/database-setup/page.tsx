"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, CheckCircle, AlertCircle, Rocket } from "lucide-react"

type Status = "idle" | "loading" | "success" | "error"

export default function DatabaseSetupPage() {
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  const handleSetup = async () => {
    setStatus("loading")
    setMessage("در حال راه‌اندازی دیتابیس... این ممکن است چند لحظه طول بکشد.")

    try {
      const response = await fetch("/api/database/init", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setMessage(data.message || "دیتابیس با موفقیت راه‌اندازی شد!")
      } else {
        setStatus("error")
        setMessage(data.message || data.error || "خطایی در راه‌اندازی دیتابیس رخ داد.")
      }
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "یک خطای ناشناخته رخ داد.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Rocket className="w-6 h-6 text-blue-600" />
            راه‌اندازی دیتابیس
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            برای شروع کار با برنامه، ابتدا باید ساختار دیتابیس را ایجاد کنید. این کار تمام جداول مورد نیاز را می‌سازد.
            این اسکریپت همچنین ستون `stats_multiplier` را اضافه می‌کند تا از بروز خطا جلوگیری شود.
          </p>

          <Button
            onClick={handleSetup}
            disabled={status === "loading"}
            className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {status === "loading" ? "در حال اجرا..." : "شروع راه‌اندازی"}
          </Button>

          {status !== "idle" && (
            <div className="mt-6">
              {status === "loading" && (
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>در حال پردازش</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              {status === "success" && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">موفقیت‌آمیز</AlertTitle>
                  <AlertDescription className="text-green-700">{message}</AlertDescription>
                </Alert>
              )}
              {status === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>خطا</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
