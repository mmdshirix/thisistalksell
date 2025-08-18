"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff } from "lucide-react"

const CORRECT_PASSWORD = "Mmd38163816@S#iri"

export default function HomePage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem("homepage-auth")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("homepage-auth", "true")
    } else {
      alert("رمز عبور اشتباه است")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("homepage-auth")
    setPassword("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">ورود به سیستم</CardTitle>
            <p className="text-gray-600 mt-2">برای دسترسی به صفحه اصلی، رمز عبور را وارد کنید</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  className="pr-4 pl-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                ورود
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">سیستم مدیریت چت‌بات</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 bg-transparent"
            >
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chatbots Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🤖</span>
                </div>
                مدیریت چت‌بات‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">ایجاد، ویرایش و مدیریت چت‌بات‌های خود</p>
              <Button className="w-full" onClick={() => (window.location.href = "/chatbots")}>
                مشاهده چت‌بات‌ها
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📊</span>
                </div>
                پنل ادمین
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">مشاهده آمار، تیکت‌ها و مدیریت کلی سیستم</p>
              <Button className="w-full" onClick={() => (window.location.href = "/admin")}>
                ورود به پنل ادمین
              </Button>
            </CardContent>
          </Card>

          {/* Database Setup */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🗄️</span>
                </div>
                تنظیمات دیتابیس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">راه‌اندازی و مدیریت دیتابیس سیستم</p>
              <Button className="w-full" onClick={() => (window.location.href = "/database-setup")}>
                تنظیمات دیتابیس
              </Button>
            </CardContent>
          </Card>

          {/* Test Pages */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🧪</span>
                </div>
                صفحات تست
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">تست عملکرد ویجت‌ها و سیستم‌های مختلف</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full text-sm bg-transparent"
                  onClick={() => (window.location.href = "/test-widget")}
                >
                  تست ویجت
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-sm bg-transparent"
                  onClick={() => (window.location.href = "/test-ticket-system")}
                >
                  تست سیستم تیکت
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">📚</span>
                </div>
                مستندات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">راهنمای استفاده و مستندات فنی سیستم</p>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => alert("مستندات به زودی اضافه خواهد شد")}
              >
                مشاهده مستندات
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                وضعیت سیستم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">بررسی وضعیت سرویس‌ها و اتصالات</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>دیتابیس:</span>
                  <span className="text-green-600 font-medium">متصل</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>API:</span>
                  <span className="text-green-600 font-medium">فعال</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>هوش مصنوعی:</span>
                  <span className="text-green-600 font-medium">آماده</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>آمار کلی سیستم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">-</div>
                  <div className="text-sm text-gray-600">چت‌بات‌های فعال</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">-</div>
                  <div className="text-sm text-gray-600">پیام‌های امروز</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">-</div>
                  <div className="text-sm text-gray-600">کاربران فعال</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">-</div>
                  <div className="text-sm text-gray-600">تیکت‌های باز</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
