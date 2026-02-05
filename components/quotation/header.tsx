"use client"

import { Shield } from "lucide-react"

export function QuotationHeader() {
  return (
    <header className="bg-[#0a1628] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a3a6b]">
              <Shield className="h-6 w-6 text-[#5b9aff]" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold tracking-wide text-white">
                {"COP'S ELECTRONICS, S.A."}
              </h1>
              <p className="text-xs text-[#7a9cc7]">Soluciones Tecnologicas Integrales</p>
            </div>
          </div>
          <div className="hidden text-right text-xs text-[#7a9cc7] md:block">
            <p>Tel: 0212-7934136 / 7940316</p>
            <p>proyectos@copselectronics.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}
