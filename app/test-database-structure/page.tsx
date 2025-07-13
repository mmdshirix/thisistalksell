"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database, Table, Columns } from "lucide-react"

interface TableInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

interface TestResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

export default function TestDatabaseStructure() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tableStructure, setTableStructure] = useState<Record<string, TableInfo[]>>({})

  const runTests = async () => {
    setIsLoading(true)
    setResults([])
    const testResults: TestResult[] = []

    try {
      // Test 1: Database Connection
      try {
        const response = await fetch("/api/database/test")
        if (response.ok) {
          testResults.push({
            name: "اتصال به دیتابیس",
            status: "success",
            message: "اتصال برقرار است",
          })
        } else {
          testResults.push({
            name: "اتصال به دیتابیس",
            status: "error",
            message: "خطا در اتصال",
          })
        }
      } catch (error) {
        testResults.push({
          name: "اتصال به دیتابیس",
          status: "error",
          message: `خطا: ${error}`,
        })
      }

      // Test 2: Check table structure
      try {
        const response = await fetch("/api/database/structure")
        if (response.ok) {
          const data = await response.json()
          setTableStructure(data.tables || {})

          const requiredTables = ["chatbots", "chatbot_messages", "tickets"]
          const existingTables = Object.keys(data.tables || {})

          requiredTables.forEach((table) => {
            if (existingTables.includes(table)) {
              testResults.push({
                name: `جدول ${table}`,
                status: "success",
                message: "موجود است",
                details: data.tables[table],
              })
            } else {
              testResults.push({
                name: `جدول ${table}`,
                status: "error",
                message: "موجود نیست",
              })
            }
          })

          // Check for stats_multiplier column
          const chatbotsTable = data.tables?.chatbots || []
          const hasStatsMultiplier = chatbotsTable.some((col: TableInfo) => col.column_name === "stats_multiplier")

          testResults.push({
            name: "ستون stats_multiplier",
            status: hasStatsMultiplier ? "success" : "warning",
            message: hasStatsMultiplier ? "موجود است" : "موجود نیست - باید اضافه شود",
          })
        }
      } catch (error) {
        testResults.push({
          name: "بررسی ساختار جداول",
          status: "error",
          message: `خطا: ${error}`,
        })
      }

      // Test 3: Check sample data
      try {
        const response = await fetch("/api/chatbots")
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            testResults.push({
              name: "داده‌های نمونه چت‌بات",
              status: "success",
              message: `${data.length} چت‌بات موجود است`,
              details: data,
            })
          } else {
            testResults.push({
              name: "داده‌های نمونه چت‌بات",
              status: "warning",
              message: "هیچ چت‌باتی موجود نیست",
            })
          }
        }
      } catch (error) {
        testResults.push({
          name: "داده‌های نمونه چت‌بات",
          status: "error",
          message: `خطا: ${error}`,
        })
      }

      // Test 4: Test admin panel API
      try {
        const response = await fetch("/api/admin-panel/1/data")
        if (response.ok) {
          const data = await response.json()
          testResults.push({
            name: "API پنل ادمین",
            status: "success",
            message: "کار می‌کند",
            details: {
              chatbot: data.chatbot?.name,
              totalMessages: data.stats?.totalMessages,
              multiplier: data.chatbot?.multiplier,
            },
          })
        } else {
          const errorData = await response.json()
          testResults.push({
            name: "API پنل ادمین",
            status: "error",
            message: `خطا: ${errorData.details || errorData.error}`,
          })
        }
      } catch (error) {
        testResults.push({
          name: "API پنل ادمین",
          status: "error",
          message: `خطا: ${error}`,
        })
      }

      setResults(testResults)
    } catch (error) {
      console.error("Test error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fixStatsMultiplier = async () => {
    try {
      const response = await fetch("/api/database/fix-stats-multiplier", {
        method: "POST",
      })

      if (response.ok) {
        alert("ستون stats_multiplier با موفقیت اضافه شد!")
        runTests() // Re-run tests
      } else {
        const error = await response.json()
        alert(`خطا: ${error.message}`)
      }
    } catch (error) {
      alert(`خطا: ${error}`)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          تست ساختار دیتابیس
        </h1>
        <Button onClick={runTests} disabled={isLoading}>
          {isLoading ? "در حال تست..." : "اجرای مجدد تست‌ها"}
        </Button>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>نتایج تست</CardTitle>
          <CardDescription>وضعیت اتصال و ساختار دیتابیس</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h3 className="font-medium">{result.name}</h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Fixes */}
      <Card>
        <CardHeader>
          <CardTitle>رفع سریع مشکلات</CardTitle>
          <CardDescription>دکمه‌های رفع خودکار مشکلات رایج</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={fixStatsMultiplier} variant="outline">
              اضافه کردن ستون stats_multiplier
            </Button>
            <Button onClick={() => window.open("/scripts/add-stats-multiplier.sql", "_blank")} variant="outline">
              مشاهده اسکریپت SQL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Structure */}
      {Object.keys(tableStructure).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              ساختار جداول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(tableStructure).map(([tableName, columns]) => (
                <div key={tableName}>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Columns className="h-4 w-4" />
                    {tableName}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-right">نام ستون</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">نوع داده</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">NULL</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">پیش‌فرض</th>
                        </tr>
                      </thead>
                      <tbody>
                        {columns.map((column, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2 font-mono">{column.column_name}</td>
                            <td className="border border-gray-300 px-4 py-2">{column.data_type}</td>
                            <td className="border border-gray-300 px-4 py-2">{column.is_nullable}</td>
                            <td className="border border-gray-300 px-4 py-2 text-sm">{column.column_default || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
