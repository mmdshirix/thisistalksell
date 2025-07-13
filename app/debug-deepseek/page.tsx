"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugDeepSeekPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-deepseek")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to test connection", details: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testModels = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/deepseek-models")
      const data = await response.json()
      setResult({ type: "models", data })
    } catch (error) {
      setResult({ error: "Failed to test models", details: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>DeepSeek API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={loading}>
            {loading ? "Testing..." : "Test DeepSeek Connection"}
          </Button>

          <Button onClick={testModels} disabled={loading} variant="outline">
            {loading ? "Testing..." : "Test Available Models"}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <h4 className="font-semibold">Environment Variables:</h4>
            <p>DEEPSEEK_API_KEY: {process.env.DEEPSEEK_API_KEY ? "✅ Set" : "❌ Missing"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
