import { User, Building2, Phone, Mail, MapPin, Calendar, Clock, FileText, Package, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDateTime, formatCurrency, formatMinutesToDuration, getInitials } from "@/lib/utils"
import { ROLE_LABELS } from "@/types"
import type { Ticket } from "@/types"

interface TicketDetailsProps {
  ticket: Ticket
}

export function TicketDetails({ ticket }: TicketDetailsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Descripción del Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-2">Descripción</h4>
              <p className="text-white whitespace-pre-wrap">{ticket.descripcion}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-2">Requerimientos</h4>
              <p className="text-white whitespace-pre-wrap">{ticket.requerimientos}</p>
            </div>
          </CardContent>
        </Card>

        {ticket.materiales_planificados && ticket.materiales_planificados.length > 0 && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-400" />
                Materiales Planificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ticket.materiales_planificados.map((m, i) => (
                  <div key={i} className="flex justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white">{m.nombre}</span>
                    <span className="text-white/60">{m.cantidad} {m.unidad}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(ticket.solucion_aplicada || ticket.observaciones_tecnico) && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-green-400" />
                Trabajo Realizado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.solucion_aplicada && (
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Solución Aplicada</h4>
                  <p className="text-white whitespace-pre-wrap">{ticket.solucion_aplicada}</p>
                </div>
              )}
              {ticket.observaciones_tecnico && (
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Observaciones</h4>
                  <p className="text-white whitespace-pre-wrap">{ticket.observaciones_tecnico}</p>
                </div>
              )}
              {ticket.tiempo_trabajado && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <Clock className="h-4 w-4 text-white/60" />
                  <span className="text-white/60">Tiempo:</span>
                  <span className="text-white font-medium">{formatMinutesToDuration(ticket.tiempo_trabajado)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-white/40 mt-0.5" />
              <p className="text-white font-medium">{ticket.cliente_nombre}</p>
            </div>
            {ticket.cliente_empresa && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-white/40 mt-0.5" />
                <p className="text-white/80">{ticket.cliente_empresa}</p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-white/40 mt-0.5" />
              <p className="text-white/80">{ticket.cliente_telefono}</p>
            </div>
            {ticket.cliente_email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-white/40 mt-0.5" />
                <p className="text-white/80">{ticket.cliente_email}</p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-white/40 mt-0.5" />
              <p className="text-white/80">{ticket.cliente_direccion}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader><CardTitle>Información</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/60">Tipo</span>
              <Badge variant="secondary">{ticket.tipo === "proyecto" ? "Proyecto" : "Servicio"}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Monto</span>
              <span className="text-white font-medium">{formatCurrency(ticket.monto_servicio)}</span>
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-white/40" />
                <span className="text-white/60">Creado:</span>
                <span className="text-white/80">{formatDateTime(ticket.created_at)}</span>
              </div>
              {ticket.fecha_inicio && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-white/40" />
                  <span className="text-white/60">Iniciado:</span>
                  <span className="text-white/80">{formatDateTime(ticket.fecha_inicio)}</span>
                </div>
              )}
              {ticket.fecha_finalizacion && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-white/60">Finalizado:</span>
                  <span className="text-white/80">{formatDateTime(ticket.fecha_finalizacion)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader><CardTitle>Técnico Asignado</CardTitle></CardHeader>
          <CardContent>
            {ticket.tecnico ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(ticket.tecnico.nombre, ticket.tecnico.apellido)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">{ticket.tecnico.nombre} {ticket.tecnico.apellido}</p>
                  <p className="text-xs text-white/50">{ticket.tecnico.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-white/50 text-center py-4">Sin técnico asignado</p>
            )}
          </CardContent>
        </Card>

        {ticket.creador && (
          <Card variant="glass">
            <CardHeader><CardTitle>Creado por</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(ticket.creador.nombre, ticket.creador.apellido)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">{ticket.creador.nombre} {ticket.creador.apellido}</p>
                  <p className="text-xs text-white/50">{ROLE_LABELS[ticket.creador.rol]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
