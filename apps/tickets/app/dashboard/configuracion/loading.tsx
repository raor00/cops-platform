export default function ConfiguracionLoading() {
  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 skeleton rounded-xl" />
          <div className="h-4 w-48 skeleton rounded-lg" />
        </div>
      </div>

      {/* Config sections */}
      {[...Array(3)].map((_, section) => (
        <div key={section} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden animate-pulse">
          {/* Section header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="h-5 w-5 bg-white/10 rounded" />
            <div className="h-5 w-48 bg-white/10 rounded-full" />
          </div>
          {/* Rows */}
          <div className="divide-y divide-white/5">
            {[...Array(section === 2 ? 3 : 5)].map((_, row) => (
              <div key={row} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-40 bg-white/10 rounded-full" />
                  <div className="h-3 w-64 bg-white/10 rounded-full" />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-5 w-32 bg-white/10 rounded-full" />
                  <div className="h-8 w-8 bg-white/10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
