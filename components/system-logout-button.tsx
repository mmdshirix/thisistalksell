"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function SystemLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/system-logout", { method: "POST" })
      router.push("/system-login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleLogout} disabled={loading} variant="outline" size="sm" className="gap-2 bg-transparent">
      <LogOut className="h-4 w-4" />
      {loading ? "در حال خروج..." : "خروج از سیستم"}
    </Button>
  )
}
