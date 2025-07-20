"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CORRECT_PASSWORD = "Mmd38163816@S#iri"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // بررسی اینکه آیا کاربر قبلاً وارد شده یا نه
    const savedAuth = localStorage.getItem("homepage_auth")
    if (savedAuth === "authenticated") {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("homepage_auth", "authenticated")
    } else {
      setError("رمز عبور اشتباه است")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("homepage_auth")
    setPassword("")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">دسترسی محدود</CardTitle>
            <p className="text-gray-600 mt-2">برای ورود به سیستم، رمز عبور را وارد کنید</p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                    className="h-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                ورود به سیستم
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
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">سیستم مدیریت چت‌بات</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* چت‌بات‌ها */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600">🤖</span>
                  </div>
                  مدیریت چت‌بات‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">ایجاد، ویرایش و مدیریت چت‌بات‌های خود</p>
                <Button
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                  onClick={() => (window.location.href = "/chatbots")}
                >
                  مشاهده چت‌بات‌ها
                </Button>
              </CardContent>
            </Card>

            {/* پنل ادمین */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600">⚙️</span>
                  </div>
                  پنل مدیریت
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">دسترسی به پنل مدیریت و تنظیمات پیشرفته</p>
                <Button
                  className="w-full rounded-xl bg-green-600 hover:bg-green-700"
                  onClick={() => (window.location.href = "/admin")}
                >
                  ورود به پنل ادمین
                </Button>
              </CardContent>
            </Card>

            {/* آمار و گزارشات */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600">📊</span>
                  </div>
                  آمار و تحلیل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">مشاهده آمار عملکرد و تحلیل داده‌ها</p>
                <Button
                  className="w-full rounded-xl bg-purple-600 hover:bg-purple-700"
                  onClick={() => (window.location.href = "/admin/analytics")}
                >
                  مشاهده آمار
                </Button>
              </CardContent>
            </Card>

            {/* تیکت‌های پشتیبانی */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-orange-600">🎫</span>
                  </div>
                  تیکت‌های پشتیبانی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">مدیریت تیکت‌ها و پاسخگویی به کاربران</p>
                <Button
                  className="w-full rounded-xl bg-orange-600 hover:bg-orange-700"
                  onClick={() => (window.location.href = "/admin/tickets")}
                >
                  مدیریت تیکت‌ها
                </Button>
              </CardContent>
            </Card>

            {/* تنظیمات */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-gray-600">⚙️</span>
                  </div>
                  تنظیمات سیستم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">پیکربندی و تنظیمات عمومی سیستم</p>
                <Button
                  className="w-full rounded-xl bg-gray-600 hover:bg-gray-700"
                  onClick={() => (window.location.href = "/admin/settings")}
                >
                  تنظیمات
                </Button>
              </CardContent>
            </Card>

            {/* راهنما */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-indigo-600">📚</span>
                  </div>
                  راهنما و مستندات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">راهنمای استفاده و مستندات فنی</p>
                <Button
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => (window.location.href = "/database-setup")}
                >
                  مشاهده راهنما
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">© 2024 سیستم مدیریت چت‌بات. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
