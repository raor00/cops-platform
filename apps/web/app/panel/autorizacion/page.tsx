"use client";

import { useEffect, useMemo, useState } from "react";

type RequestStatus = "pendiente" | "aprobada" | "rechazada";

type AuthorizationRequest = {
  id: string;
  requestedBy: string;
  module: string;
  action: string;
  status: RequestStatus;
  createdAt: string;
  processedAt?: string;
};

const STORAGE_KEY = "cops_authorization_requests";

const seedRequests: AuthorizationRequest[] = [
  {
    id: "REQ-001",
    requestedBy: "supervisor.tickets",
    module: "Tickets",
    action: "Cerrar incidente critico INC-9481",
    status: "pendiente",
    createdAt: "2026-02-11 10:00",
  },
  {
    id: "REQ-002",
    requestedBy: "analista.cot",
    module: "Cotizacion",
    action: "Aprobar descuento mayor a 15%",
    status: "pendiente",
    createdAt: "2026-02-11 10:15",
  },
];

export default function AutorizacionPage() {
  const [requests, setRequests] = useState<AuthorizationRequest[]>(() => {
    if (typeof window === "undefined") return seedRequests;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedRequests;

    try {
      return JSON.parse(raw) as AuthorizationRequest[];
    } catch {
      return seedRequests;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const counts = useMemo(() => {
    return {
      pendientes: requests.filter((item) => item.status === "pendiente").length,
      aprobadas: requests.filter((item) => item.status === "aprobada").length,
      rechazadas: requests.filter((item) => item.status === "rechazada").length,
    };
  }, [requests]);

  const resolveRequest = (id: string, nextStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          status: nextStatus,
          processedAt: new Date().toLocaleString("es-VE"),
        };
      }),
    );
  };

  return (
    <section className="space-y-6">
      <div className="lg-card p-6 md:p-8">
        <span className="tag-glass">Autorizacion</span>
        <h1 className="mt-4 text-3xl font-semibold text-white">Solicitudes de autorizacion</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Aqui el perfil admin aprueba o rechaza cambios sensibles. Al aprobar, el proceso queda marcado como ejecutado.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/45">Pendientes</p>
            <p className="mt-2 text-2xl font-semibold text-white">{counts.pendientes}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/45">Aprobadas</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{counts.aprobadas}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/45">Rechazadas</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{counts.rechazadas}</p>
          </article>
        </div>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <article key={request.id} className="lg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{request.id} - {request.action}</p>
                <p className="mt-1 text-xs text-white/55">
                  Solicitado por {request.requestedBy} en {request.module} - {request.createdAt}
                </p>
                {request.processedAt && (
                  <p className="mt-1 text-xs text-white/45">Procesado: {request.processedAt}</p>
                )}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  request.status === "pendiente"
                    ? "border border-amber-300/30 bg-amber-400/15 text-amber-100"
                    : request.status === "aprobada"
                      ? "border border-emerald-300/30 bg-emerald-400/15 text-emerald-100"
                      : "border border-rose-300/30 bg-rose-400/15 text-rose-100"
                }`}
              >
                {request.status}
              </span>
            </div>

            {request.status === "pendiente" && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => resolveRequest(request.id, "aprobada")}
                  className="btn-glass-primary !px-4 !py-2"
                >
                  Autorizar y ejecutar
                </button>
                <button
                  type="button"
                  onClick={() => resolveRequest(request.id, "rechazada")}
                  className="btn-glass !px-4 !py-2"
                >
                  Rechazar
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
