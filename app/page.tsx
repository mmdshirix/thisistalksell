"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import ChatbotList from "@/components/chatbot-list"
import CreateChatbotButton from "@/components/create-chatbot-button"

const CORRECT_PASSWORD = "Mmd38163816@S#iri"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // بررسی اینکه آیا کاربر قبلاً وارد شده است
    const savedAuth = localStorage.getItem("homepage_authenticated")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("homepage_authenticated", "true")
      toast.success("ورود موفقیت‌آمیز بود")
    } else {
      toast.error("رمز عبور اشتباه است")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("homepage_authenticated")
    setPassword("")
    toast.success("خروج موفقیت‌آمیز بود")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">ورود به سیستم</CardTitle>
            <p className="text-gray-600 mt-2">برای دسترسی به پنل مدیریت، رمز عبور را وارد کنید</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  رمز عبور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور را وارد کنید"
                    className="pr-10 rounded-xl border-2 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5">
                <Lock className="ml-2 h-4 w-4" />
                ورود
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">پنل مدیریت چت‌بات</h1>
            <p className="text-gray-600 mt-2">مدیریت و ایجاد چت‌بات‌های هوشمند</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-xl border-2 hover:bg-red-50 hover:border-red-200 bg-transparent"
          >
            خروج
          </Button>
        </div>

        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">چت‌بات‌های شما</h2>
            <CreateChatbotButton />
          </div>
          <ChatbotList />
        </div>
      </div>
    </div>
  )
}
