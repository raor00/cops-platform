export default function PipelineLoading() {
  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 skeleton rounded-xl" />
          <div className="h-4 w-32 skeleton rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-40 skeleton rounded-xl" />
          <div className="h-9 w-36 skeleton rounded-xl" />
        </div>
      </div>

      {/* Pipeline columns */}
      <div className="flex gap-4 overflow-x-auto pb-3">
        {[...Array(4)].map((_, col) => (
          <div key={col} className="shrink-0 w-[300px]">
            {/* Column header */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 mb-3 flex items-center gap-2 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-white/20" />
              <div className="h-4 w-24 bg-white/10 rounded-full" />
              <div className="ml-auto h-4 w-6 bg-white/10 rounded-full" />
            </div>
            {/* Cards */}
            <div className="space-y-2">
              {[...Array(5)].map((_, card) => (
                <div key={card} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 animate-pulse" style={{ animationDelay: `${(col * 5 + card) * 40}ms` }}>
                  <div className="flex justify-between mb-2">
                    <div className="h-3 w-24 bg-white/10 rounded-full" />
                    <div className="h-5 w-14 bg-white/10 rounded-full" />
                  </div>
                  <div className="space-y-1.5 mb-2">
                    <div className="h-4 w-full bg-white/10 rounded-full" />
                    <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-white/10 rounded-full" />
                    <div className="h-3 w-16 bg-white/10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
