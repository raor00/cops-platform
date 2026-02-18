export default function UsuariosLoading() {
  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-32 skeleton rounded-xl" />
          <div className="h-4 w-52 skeleton rounded-lg" />
        </div>
        <div className="h-9 w-36 skeleton rounded-xl" />
      </div>

      {/* User cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-white/10 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 bg-white/10 rounded-full" />
                <div className="h-3 w-36 bg-white/10 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-white/10 rounded-full" />
              <div className="h-3 w-3/4 bg-white/10 rounded-full" />
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-20 bg-white/10 rounded-full" />
              <div className="h-6 w-16 bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
