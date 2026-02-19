export default function ClientesLoading() {
  return (
    <div className="page-container space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="space-y-2">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-4 w-28" />
        </div>
        <div className="skeleton h-10 w-36" />
      </div>

      {/* Search */}
      <div className="skeleton h-11 w-80 max-w-md" />

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="grid grid-cols-5 gap-4">
            {["Cliente", "RIF", "Contacto", "Tickets", "Estado"].map((h) => (
              <div key={h} className="skeleton h-4 w-16" />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-white/5">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center gap-2.5">
                <div className="skeleton h-8 w-8 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-3 w-16" />
                </div>
              </div>
              <div className="skeleton h-4 w-24" />
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-4 w-8" />
              <div className="skeleton h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
