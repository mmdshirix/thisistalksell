"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Database, CheckCircle, XCircle, AlertCircle, Activity } from "lucide-react"
import { toast } from "sonner"

interface DatabaseStatus {
  success: boolean
  message: string
  data?: {
    now: string
    version: string
  }
}

interface DatabaseStructure {
  success: boolean
  tables: Record<string, any[]>
  timestamp: string
}

export default function DatabaseStatusPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [structure, setStructure] = useState<DatabaseStructure | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkDatabaseStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setStatus(data)
      setLastChecked(new Date())

      if (data.success) {
        toast.success("اتصال به دیتابیس موفق")
      } else {
        toast.error("خطا در اتصال به دیتابیس")
      }
    } catch (error) {
      console.error("Error checking database status:", error)
      setStatus({
        success: false,
        message: "خطا در بررسی وضعیت دیتابیس",
      })
      toast.error("خطا در بررسی وضعیت")
    } finally {
      setIsLoading(false)
    }
  }

  const checkDatabaseStructure = async () => {
    try {
      const response = await fetch("/api/database/structure")
      const data = await response.json()
      setStructure(data)
    } catch (error) {
      console.error("Error checking database structure:", error)
      toast.error("خطا در بررسی ساختار دیتابیس")
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
    checkDatabaseStructure()
  }, [])

  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="w-5 h-5 text-yellow-500" />
    if (status.success) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusBadge = () => {
    if (!status) return <Badge variant="secondary">در حال بررسی...</Badge>
    if (status.success)
      return (
        <Badge variant="default" className="bg-green-500">
          متصل
        </Badge>
      )
    return <Badge variant="destructive">قطع</Badge>
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8" />
            وضعیت دیتابیس
          </h1>
          <p className="text-muted-foreground mt-1">مانیتورینگ و بررسی وضعیت اتصال به دیتابیس PostgreSQL</p>
        </div>
        <Button onClick={checkDatabaseStatus} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          بروزرسانی
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              وضعیت اتصال
            </CardTitle>
            <CardDescription>آخرین بررسی: {lastChecked ? lastChecked.toLocaleString("fa-IR") : "هرگز"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-medium">{status ? (status.success ? "متصل" : "قطع") : "در حال بررسی..."}</span>
              </div>
              {getStatusBadge()}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">پیام: </span>
                <span className={status?.success ? "text-green-600" : "text-red-600"}>
                  {status?.message || "در حال بررسی..."}
                </span>
              </div>

              {status?.data && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <span className="font-medium">زمان سرور: </span>
                    <span className="text-muted-foreground">{new Date(status.data.now).toLocaleString("fa-IR")}</span>
                  </div>
                  <div>
                    <span className="font-medium">نسخه PostgreSQL: </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {status.data.version.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              اطلاعات محیط
            </CardTitle>
            <CardDescription>متغیرهای محیطی و تنظیمات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">DATABASE_URL:</span>
                <Badge variant={process.env.DATABASE_URL ? "default" : "destructive"}>
                  {process.env.DATABASE_URL ? "تنظیم شده" : "تنظیم نشده"}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">NODE_ENV:</span>
                <Badge variant="secondary">{process.env.NODE_ENV || "development"}</Badge>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Next.js:</span>
                <Badge variant="outline">14.2.x</Badge>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">PostgreSQL Driver:</span>
                <Badge variant="outline">pg</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {structure && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              ساختار دیتابیس
            </CardTitle>
            <CardDescription>
              جداول موجود در دیتابیس - آخرین بروزرسانی: {new Date(structure.timestamp).toLocaleString("fa-IR")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(structure.tables).map(([tableName, columns]) => (
                <Card key={tableName} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{tableName}</CardTitle>
                    <CardDescription>{columns.length} ستون</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-xs">
                      {columns.slice(0, 5).map((column: any, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="font-mono">{column.column_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {column.data_type}
                          </Badge>
                        </div>
                      ))}
                      {columns.length > 5 && (
                        <div className="text-muted-foreground text-center pt-1">
                          و {columns.length - 5} ستون دیگر...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
