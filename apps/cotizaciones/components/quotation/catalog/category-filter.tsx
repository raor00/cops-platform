"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  categories: Array<{ name: string; count: number }>
  selected: string | null
  onSelect: (category: string | null) => void
}

const VISIBLE_CATEGORY_LIMIT = 10

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const [expanded, setExpanded] = useState(false)

  const totalCount = useMemo(
    () => categories.reduce((sum, category) => sum + category.count, 0),
    [categories],
  )

  const visibleCategories = categories.slice(0, VISIBLE_CATEGORY_LIMIT)
  const hasOverflow = categories.length > VISIBLE_CATEGORY_LIMIT

  return (
    <div className="space-y-2">
      <CategoryOption
        label="Todas las categorías"
        count={totalCount}
        selected={selected === null}
        onClick={() => onSelect(null)}
      />

      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <div className="space-y-1">
          {visibleCategories.map((category) => (
            <CategoryOption
              key={category.name}
              label={category.name}
              count={category.count}
              selected={selected === category.name}
              onClick={() => onSelect(category.name)}
            />
          ))}
        </div>

        {hasOverflow ? (
          <>
            <CollapsibleContent className="space-y-1 pt-1">
              {categories.slice(VISIBLE_CATEGORY_LIMIT).map((category) => (
                <CategoryOption
                  key={category.name}
                  label={category.name}
                  count={category.count}
                  selected={selected === category.name}
                  onClick={() => onSelect(category.name)}
                />
              ))}
            </CollapsibleContent>

            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-7 w-full justify-between px-2 text-xs text-muted-foreground"
              >
                <span>{expanded ? "Ver menos" : `Ver más (${categories.length - VISIBLE_CATEGORY_LIMIT})`}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
          </>
        ) : null}
      </Collapsible>
    </div>
  )
}

interface CategoryOptionProps {
  label: string
  count: number
  selected: boolean
  onClick: () => void
}

function CategoryOption({ label, count, selected, onClick }: CategoryOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
        selected
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
      aria-pressed={selected}
    >
      <span className="truncate">{label}</span>
      <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium", selected ? "bg-white/15" : "bg-muted text-foreground")}>
        {count}
      </span>
    </button>
  )
}
