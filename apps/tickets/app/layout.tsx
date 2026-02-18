import React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Toaster } from "sonner"

import GlassProvider from "@/components/glass-provider"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Sistema de Tickets | COP'S Electronics",
    template: "%s | COP'S Electronics",
  },
  description: "Sistema de gestión de servicios y proyectos para COP'S Electronics",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <GlassProvider />
        {children}
        <Toaster 
          richColors 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(14, 47, 111, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  )
}
