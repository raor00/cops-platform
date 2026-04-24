import { cn } from "@/lib/utils"

type CatalogSkeletonView = "grid" | "list"

interface CatalogSkeletonProps {
  view?: CatalogSkeletonView
}

export function CatalogSkeleton({ view = "grid" }: CatalogSkeletonProps) {
  if (view === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "animate-card-enter rounded-xl border border-border bg-card p-4",
              index < 6 && `stagger-${index + 1}`,
            )}
          >
            <div className="flex items-center gap-4">
              <div className="skeleton-shimmer h-16 w-16 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-4 w-1/4 rounded" />
                <div className="skeleton-shimmer h-3 w-full rounded" />
                <div className="skeleton-shimmer h-3 w-3/4 rounded" />
              </div>
              <div className="hidden space-y-2 sm:block sm:w-24">
                <div className="skeleton-shimmer h-4 w-full rounded" />
                <div className="skeleton-shimmer h-8 w-full rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className={cn(
            "animate-card-enter overflow-hidden rounded-xl border border-border bg-card",
            index < 6 && `stagger-${index + 1}`,
          )}
        >
          <div className="skeleton-shimmer aspect-[4/3]" />
          <div className="space-y-2 p-3">
            <div className="skeleton-shimmer h-4 w-2/3 rounded" />
            <div className="skeleton-shimmer h-3 w-full rounded" />
            <div className="skeleton-shimmer h-3 w-4/5 rounded" />
            <div className="skeleton-shimmer h-5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
