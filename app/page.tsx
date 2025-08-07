"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Plus, Settings, BarChart3, Eye, Sparkles, Lock, Database } from 'lucide-react'

const CORRECT_PASSWORD = "Mmd38163816@S#iri"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem("homepage_auth")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("homepage_auth", "true")
      setError("")
    } else {
      setError("رمز عبور اشتباه است")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">دسترسی محدود</CardTitle>
            <CardDescription>برای ورود به سیستم رمز عبور را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  className="text-center"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                ورود
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <MessageSquare className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
          <CardDescription className="text-lg">
            Next.js 14 Full-Stack Application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Complete setup with TypeScript, PostgreSQL, and shadcn/ui components.
              Ready for deployment on Liara or Docker.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-auto p-4 flex-col space-y-2">
              <Link href="/admin-panel/1/login">
                <Settings className="h-6 w-6" />
                <span>Admin Panel Login</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
              <Link href="/api/database/test">
                <Database className="h-6 w-6" />
                <span>Test Database</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
              <Link href="/api/database/init">
                <Plus className="h-6 w-6" />
                <span>Initialize Database</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
              <Link href="/chatbots">
                <BarChart3 className="h-6 w-6" />
                <span>View Chatbots</span>
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Built with Next.js 14, TypeScript, PostgreSQL, and shadcn/ui</p>
            <p>Optimized for production deployment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
