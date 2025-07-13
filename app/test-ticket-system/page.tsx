"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TicketForm from "@/components/ticket-form"
import TicketManagement from "@/components/admin/ticket-management"

export default function TestTicketSystem() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTicketSuccess = () => {
    // Refresh the management component when a new ticket is created
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎫 تست سیستم تیکت</h1>
        <p className="text-gray-600">این صفحه برای تست کامل سیستم تیکت‌گذاری طراحی شده است</p>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">📝 فرم تیکت</TabsTrigger>
          <TabsTrigger value="management">🛡️ مدیریت تیکت‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تست فرم ارسال تیکت</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketForm chatbotId={1} onSuccess={handleTicketSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تست پنل مدیریت تیکت‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketManagement key={refreshKey} chatbotId={1} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
