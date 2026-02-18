"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { logout } from "@/lib/actions/auth"
import type { User } from "@/types"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  user: User
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-[72px]" : "ml-64"
        )}
      >
        {/* Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
