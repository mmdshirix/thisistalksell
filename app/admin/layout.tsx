"use client"

import type React from "react"

import { BarChart, LayoutDashboard, ListChecks, MessageSquare, Settings, User2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-gray-200 py-4 px-3 flex flex-col transition-transform duration-300 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-2xl font-bold">
            پنل مدیریت
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden text-gray-500 focus:outline-none">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <nav className="flex flex-col flex-grow">
          <Link
            href="/admin"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/admin" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            داشبورد
          </Link>

          <Link
            href="/admin/users"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/admin/users" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User2 className="h-4 w-4" />
            کاربران
          </Link>

          <Link
            href="/admin/products"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/admin/products" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ListChecks className="h-4 w-4" />
            محصولات
          </Link>

          <Link
            href="/admin/charts"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/admin/charts" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BarChart className="h-4 w-4" />
            نمودارها
          </Link>

          <Link
            href="/admin/tickets"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/admin/tickets" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            تیکت‌های پشتیبانی
          </Link>

          <div className="mt-auto">
            <Link
              href="/admin/settings"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                pathname === "/admin/settings" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Settings className="h-4 w-4" />
              تنظیمات
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
