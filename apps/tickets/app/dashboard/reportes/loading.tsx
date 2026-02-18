export default function ReportesLoading() {
  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-36 skeleton rounded-xl" />
        <div className="h-4 w-64 skeleton rounded-lg" />
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-3.5 w-24 bg-white/10 rounded-full" />
              <div className="h-8 w-20 bg-white/10 rounded-lg" />
              <div className="h-3 w-28 bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[320px] animate-pulse" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[320px] animate-pulse" />
      </div>

      {/* Bottom chart */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[280px] animate-pulse" />
    </div>
  )
}
