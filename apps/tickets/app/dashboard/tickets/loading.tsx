export default function TicketsLoading() {
  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-28 skeleton rounded-xl" />
          <div className="h-4 w-48 skeleton rounded-lg" />
        </div>
        <div className="h-9 w-32 skeleton rounded-xl" />
      </div>

      {/* Filters card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 animate-pulse">
        <div className="flex gap-3 flex-wrap">
          <div className="h-9 w-36 bg-white/10 rounded-xl" />
          <div className="h-9 w-36 bg-white/10 rounded-xl" />
          <div className="h-9 flex-1 min-w-[180px] bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {/* Table header */}
        <div className="border-b border-white/10 px-6 py-4 flex gap-6">
          {[80, 120, 200, 80, 80, 100, 90].map((w, i) => (
            <div key={i} className={`h-4 bg-white/10 rounded-full`} style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        <div className="divide-y divide-white/5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6 animate-pulse">
              <div className="h-4 w-20 bg-white/10 rounded-full" />
              <div className="h-4 w-32 bg-white/10 rounded-full" />
              <div className="h-4 flex-1 bg-white/10 rounded-full" />
              <div className="h-6 w-20 bg-white/10 rounded-full" />
              <div className="h-6 w-16 bg-white/10 rounded-full" />
              <div className="h-4 w-24 bg-white/10 rounded-full" />
              <div className="h-4 w-20 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
