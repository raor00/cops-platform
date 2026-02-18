"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { logoutAction } from "@/lib/actions/auth"
import type { User } from "@/types"
import { cn } from "@/lib/utils"

interface DashboardLayoutClientProps {
  user: User
  children: React.ReactNode
}

export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logoutAction()
    router.push("/login")
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar user={user} onLogout={handleLogout} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar user={user} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        <Header 
          user={user} 
          onMenuClick={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />
        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
