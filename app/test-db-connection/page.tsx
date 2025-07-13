"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestDatabaseConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>("testing")
  const [error, setError] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<any>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus("testing")
      setError(null)

      const response = await fetch("/api/database/test")
      const data = await response.json()

      if (response.ok) {
        setConnectionStatus("connected")
        setEnvVars(data)
      } else {
        setConnectionStatus("failed")
        setError(data.error || "Connection failed")
      }
    } catch (err) {
      setConnectionStatus("failed")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Database Connection Test
              <Badge
                variant={
                  connectionStatus === "connected"
                    ? "default"
                    : connectionStatus === "failed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "failed"
                    ? "Failed"
                    : "Testing..."}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testConnection} disabled={connectionStatus === "testing"}>
              {connectionStatus === "testing" ? "Testing..." : "Test Again"}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800">Error:</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {envVars && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800">Connection Successful!</h3>
                  <p className="text-green-600">Database is accessible</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800">Environment Variables:</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <strong>DATABASE_URL:</strong> {envVars.hasDatabase ? "✅ Available" : "❌ Not found"}
                    </p>
                    <p>
                      <strong>Connection Test:</strong> {envVars.testResult ? "✅ Success" : "❌ Failed"}
                    </p>
                    {envVars.tables && (
                      <div>
                        <strong>Tables Found:</strong>
                        <ul className="ml-4 mt-1">
                          {envVars.tables.map((table: string, index: number) => (
                            <li key={index}>• {table}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Admin Panel API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => window.open("/api/admin-panel/1/data", "_blank")}>
                Test Chatbot 1
              </Button>
              <Button variant="outline" onClick={() => window.open("/api/admin-panel/14/data", "_blank")}>
                Test Chatbot 14
              </Button>
              <Button variant="outline" onClick={() => window.open("/admin-panel/14", "_blank")}>
                Open Admin Panel 14
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
