export default function DashboardLoading() {
  return (
    <div className="page-container space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 skeleton rounded-xl" />
          <div className="h-4 w-40 skeleton rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-32 skeleton rounded-xl" />
          <div className="h-8 w-32 skeleton rounded-xl" />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-3.5 w-24 bg-white/10 rounded-full" />
                <div className="h-8 w-20 bg-white/10 rounded-lg" />
                <div className="h-3 w-32 bg-white/10 rounded-full" />
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[320px] animate-pulse" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[320px] animate-pulse" />
      </div>

      {/* Activity row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[260px] animate-pulse" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[260px] animate-pulse" />
      </div>
    </div>
  )
}
