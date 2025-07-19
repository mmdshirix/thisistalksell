"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function SystemLogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/system-logout", { method: "POST" })
      router.push("/system-login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading}>
      <LogOut className="w-4 h-4 ml-2" />
      {isLoading ? "در حال خروج..." : "خروج"}
    </Button>
  )
}
