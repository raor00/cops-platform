export function ConfigSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, section) => (
        <div key={section} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
            <div className="h-5 w-5 rounded bg-slate-200" />
            <div className="h-5 w-48 rounded-full bg-slate-200" />
          </div>
          <div className="divide-y divide-slate-100">
            {[...Array(section === 2 ? 3 : 5)].map((_, row) => (
              <div key={row} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-40 rounded-full bg-slate-200" />
                  <div className="h-3 w-64 rounded-full bg-slate-100" />
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="h-5 w-32 rounded-full bg-slate-200" />
                  <div className="h-8 w-8 rounded-lg bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
