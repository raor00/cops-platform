"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CatalogPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageItems(page: number, totalPages: number): Array<number | "dots"> {
  return Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((currentPage) => currentPage === 1 || currentPage === totalPages || Math.abs(currentPage - page) <= 1)
    .reduce<Array<number | "dots">>((accumulator, currentPage, index, list) => {
      if (index > 0 && currentPage - (list[index - 1] as number) > 1) accumulator.push("dots")
      accumulator.push(currentPage)
      return accumulator
    }, [])
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
        Anterior
      </Button>

      {getPageItems(page, totalPages).map((value, index) =>
        value === "dots" ? (
          <span key={`dots-${index}`} className="px-1 text-xs text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={value}
            variant={value === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(value)}
            className={cn(value === page && "bg-primary text-primary-foreground")}
          >
            {value}
          </Button>
        ),
      )}

      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
        Siguiente
      </Button>
    </div>
  )
}
