export default function PagosLoading() {
  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-28 skeleton rounded-xl" />
          <div className="h-4 w-48 skeleton rounded-lg" />
        </div>
        <div className="h-9 w-36 skeleton rounded-xl" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
        <div className="flex gap-3 flex-wrap">
          <div className="h-9 w-32 bg-white/10 rounded-xl" />
          <div className="h-9 w-40 bg-white/10 rounded-xl" />
          <div className="h-9 w-28 bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="h-4 w-24 bg-white/10 rounded-full" />
        </div>
        <div className="divide-y divide-white/5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6 animate-pulse">
              <div className="h-4 w-20 bg-white/10 rounded-full" />
              <div className="h-4 w-32 bg-white/10 rounded-full" />
              <div className="h-4 flex-1 bg-white/10 rounded-full" />
              <div className="h-6 w-20 bg-white/10 rounded-full" />
              <div className="h-4 w-24 bg-white/10 rounded-full" />
              <div className="h-8 w-24 bg-white/10 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
