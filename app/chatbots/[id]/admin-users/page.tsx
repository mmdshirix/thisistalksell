"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, EyeOff, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminUser {
  id: number
  username: string
  full_name: string | null
  email: string | null
  is_active: boolean
  last_login: string | null
}

export default function AdminUsersPage() {
  const params = useParams()
  const chatbotId = params.id as string
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
  })

  useEffect(() => {
    if (chatbotId) {
      fetchUsers()
    }
  }, [chatbotId])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/admin-users`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setMessage("خطا در دریافت لیست مدیران")
      }
    } catch (error) {
      console.error("Error fetching admin users:", error)
      setMessage("خطای شبکه در دریافت لیست مدیران")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const url = editingUser
        ? `/api/chatbots/${chatbotId}/admin-users/${editingUser.id}`
        : `/api/chatbots/${chatbotId}/admin-users`

      const method = editingUser ? "PUT" : "POST"

      const body = { ...formData }
      if (editingUser && !body.password) {
        delete (body as any).password
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "عملیات با موفقیت انجام شد")
        fetchUsers()
        closeDialog()
      } else {
        setMessage(result.error || "خطا در انجام عملیات")
      }
    } catch (error) {
      console.error("Error saving admin user:", error)
      setMessage("خطا در ارتباط با سرور")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟ این عمل غیرقابل بازگشت است.")) return

    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/admin-users/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || "کاربر با موفقیت حذف شد")
        fetchUsers()
      } else {
        setMessage(result.error || "خطا در حذف کاربر")
      }
    } catch (error) {
      console.error("Error deleting admin user:", error)
      setMessage("خطا در ارتباط با سرور")
    }
  }

  const resetForm = () => {
    setFormData({ username: "", password: "", full_name: "", email: "" })
    setEditingUser(null)
    setShowPassword(false)
  }

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: "",
      full_name: user.full_name || "",
      email: user.email || "",
    })
    setShowDialog(true)
  }

  const copyAdminUrl = () => {
    const url = `${window.location.origin}/admin-panel/${chatbotId}/login`
    navigator.clipboard.writeText(url)
    setMessage("لینک پنل مدیر کپی شد!")
    setTimeout(() => setMessage(""), 3000)
  }

  const closeDialog = () => {
    setShowDialog(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">مدیریت مدیران چت‌بات</h1>
          <p className="text-gray-600">کاربرانی که به پنل مدیریت این چت‌بات دسترسی دارند</p>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setShowDialog(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 ml-2" />
          افزودن مدیر جدید
        </Button>
      </div>

      {message && (
        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeDialog}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? "ویرایش مدیر" : "افزودن مدیر جدید"}
              </h2>
              <button onClick={closeDialog} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                required
                placeholder="نام کاربری *"
              />
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required={!editingUser}
                  placeholder={editingUser ? "رمز عبور (برای تغییر وارد کنید)" : "رمز عبور *"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                placeholder="نام کامل"
              />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="ایمیل"
              />
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeDialog} disabled={saving}>
                  انصراف
                </Button>
                <Button type="submit" disabled={saving} className="min-w-[100px]">
                  {saving ? "در حال ذخیره..." : editingUser ? "بروزرسانی" : "ایجاد"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>لیست مدیران ({users.length})</CardTitle>
          <CardDescription>
            لینک ورود به پنل مدیریت را برای این کاربران ارسال کنید:{" "}
            <Button variant="link" onClick={copyAdminUrl} className="p-0 h-auto">
              کپی لینک
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام کاربری</TableHead>
                  <TableHead>نام کامل</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>آخرین ورود</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.full_name || "---"}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString("fa-IR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "هرگز"}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => openEditDialog(user)} title="ویرایش">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(user.id)}
                          title="حذف"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
