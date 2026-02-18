export default function TicketDetailLoading() {
  return (
    <div className="page-container space-y-6">
      {/* Back link skeleton */}
      <div className="h-4 w-28 skeleton rounded-lg" />

      {/* Header card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-32 bg-white/10 rounded-full" />
              <div className="h-6 w-20 bg-white/10 rounded-full" />
              <div className="h-6 w-16 bg-white/10 rounded-full" />
            </div>
            <div className="h-6 w-80 bg-white/10 rounded-lg" />
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-white/10 rounded-full" />
              <div className="h-4 w-28 bg-white/10 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-white/10 rounded-xl" />
            <div className="h-9 w-32 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-0">
        {[100, 80, 60, 80, 90].map((w, i) => (
          <div key={i} className="h-9 rounded-t-lg bg-white/5 animate-pulse" style={{ width: w }} />
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-64 animate-pulse" />
    </div>
  )
}
