"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MessageCountChartProps {
  dailyData: Array<{
    date: string
    count: number
  }>
  weeklyData: Array<{
    week: string
    count: number
  }>
  monthlyData: Array<{
    month: string
    count: number
  }>
}

export default function MessageCountChart({ dailyData, weeklyData, monthlyData }: MessageCountChartProps) {
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly">("daily")

  const getData = () => {
    switch (timeFrame) {
      case "daily":
        return dailyData
      case "weekly":
        return weeklyData
      case "monthly":
        return monthlyData
      default:
        return dailyData
    }
  }

  const getXAxisKey = () => {
    switch (timeFrame) {
      case "daily":
        return "date"
      case "weekly":
        return "week"
      case "monthly":
        return "month"
      default:
        return "date"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Message Count</CardTitle>
          <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as "daily" | "weekly" | "monthly")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          Number of messages received{" "}
          {timeFrame === "daily" ? "per day" : timeFrame === "weekly" ? "per week" : "per month"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getXAxisKey()} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0066FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
