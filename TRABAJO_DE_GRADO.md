# COPS Platform — Sistema de Gestión de Servicios Técnicos

## Trabajo Especial de Grado

**Institución:** [Universidad / Instituto]
**Carrera:** [Ingeniería en Sistemas / Informática]
**Autor:** [Nombre del Estudiante]
**Tutor:** [Nombre del Tutor]
**Fecha:** 2026

---

## 1. Introducción

### El Problema

Las empresas de servicios técnicos —instalación de CCTV, mantenimiento de sistemas electrónicos, soporte en campo— enfrentan un reto operativo cotidiano: **coordinar equipos de técnicos, clientes y pagos sin herramientas especializadas**.

En la práctica, esto se traduce en:

- **Órdenes de servicio en papel** que se pierden, se mojan o no llegan al técnico a tiempo
- **Coordinación por WhatsApp** donde los mensajes importantes quedan enterrados entre conversaciones
- **Hojas de cálculo** para rastrear pagos de comisiones, actualizadas manualmente con alto riesgo de error
- **Sin trazabilidad**: nadie sabe en qué estado está un servicio sin llamar al técnico o al cliente
- **Falta de métricas**: el gerente no puede ver cuántos servicios completó cada técnico ni cuánto cobrar a fin de mes

### La Consecuencia

Esta desorganización genera retrasos en la atención, clientes insatisfechos, técnicos mal pagados y gerentes que toman decisiones sin información confiable.

---

## 2. La Solución Desarrollada

**COPS Platform** es una plataforma web de gestión integral de servicios técnicos diseñada para:

- Registrar y dar seguimiento a cada orden de servicio desde su apertura hasta el cierre
- Coordinar en tiempo real al equipo: coordinadores, técnicos y gerencia
- Generar reportes automáticos de rendimiento y pagos
- Funcionar en cualquier dispositivo, incluyendo teléfonos móviles en el campo

El sistema está construido como una **aplicación web** accesible desde navegadores, sin necesidad de instalar software adicional.

---

## 3. Funcionalidades Principales

### 3.1 Gestión de Tickets de Servicio

Un "ticket" es el registro central de cada trabajo. Al crear un ticket se captura:

- Datos del cliente (nombre, empresa, teléfono, dirección)
- Tipo de trabajo (servicio correctivo, mantenimiento preventivo, proyecto)
- Prioridad (baja, media, alta, urgente)
- Origen de la solicitud (correo, llamada, carta de aceptación)
- Descripción detallada y notas para el técnico

El ticket atraviesa estados bien definidos: **Asignado → Iniciado → En Progreso → Finalizado**, con la posibilidad de que gerencia revierta estados si es necesario.

### 3.2 Seguimiento en Tiempo Real

Cualquier persona autorizada puede ver el estado actual de un servicio sin llamar a nadie:

- **Pipeline visual**: tablero tipo Kanban con todos los tickets organizados por estado
- **Vista móvil optimizada**: los técnicos en campo pueden actualizar el estado desde su teléfono
- **Historial de cambios**: registro completo de cada acción realizada sobre el ticket

### 3.3 Inspecciones Técnicas

Para proyectos que requieren visita previa, el sistema incluye un formulario de inspección con 25 ítems organizados en 5 categorías (eléctrica, red, seguridad, etc.). El inspector marca cada ítem como "OK", "Falla" o "No aplica" y puede agregar notas y fotos.

### 3.4 Documentación Fotográfica

Los técnicos pueden subir fotos desde el campo —antes, durante y después del trabajo— que quedan vinculadas al ticket para respaldo y comprobación.

### 3.5 Gestión de Pagos y Comisiones

El sistema calcula automáticamente las comisiones de cada técnico según los servicios completados:

- Registro de método de pago (transferencia, pago móvil, efectivo)
- Cuadro de pagos agrupado por técnico: muestra exactamente cuánto se le debe a cada uno
- Exportación a CSV para contabilidad

### 3.6 Base de Datos de Clientes

Registro centralizado de empresas y contactos. Al crear un nuevo ticket, el coordinador puede buscar el cliente existente y pre-llenar los datos automáticamente, evitando errores de transcripción.

### 3.7 Reportes y Métricas

Panel de control con:
- Total de tickets activos, finalizados y urgentes
- Ingresos del mes
- Rendimiento individual de cada técnico (tickets completados, tiempo promedio)
- Gráfico de tickets por mes (últimos 6 meses)

### 3.8 Control de Acceso por Roles

El sistema diferencia 5 niveles de usuario:

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| Técnico | Personal de campo | Solo sus propios tickets |
| Coordinador | Gestión operativa | Todos los tickets, clientes, reportes |
| Gerente | Supervisión | Todo + configuración del sistema |
| Vicepresidente | Dirección | Todo |
| Presidente | Máxima autoridad | Todo |

---

## 4. Impacto Esperado

### Para la Empresa

| Área | Situación Actual | Con COPS Platform |
|------|-----------------|-------------------|
| Tiempo de respuesta | Impredecible (sin tracking) | Monitoreable en tiempo real |
| Errores en pagos | Frecuentes (hoja de cálculo manual) | Eliminados (cálculo automático) |
| Visibilidad gerencial | Nula sin llamar a coordinadores | Dashboard con datos actualizados |
| Satisfacción del cliente | Variable | Mejora por reducción de olvidos y demoras |

### Para los Técnicos

- Reciben información clara antes de ir al campo (notas del coordinador)
- Actualizan el estado del trabajo desde el teléfono sin llamadas intermedias
- Sus comisiones quedan registradas y son auditables

### Para la Gerencia

- Saben en todo momento cuántos servicios están activos y en qué estado
- Pueden identificar cuellos de botella (ej. técnico con muchos tickets en "en progreso")
- Los reportes de pago se generan en segundos, no en horas

---

## 5. Arquitectura Técnica (Resumen No Técnico)

El sistema está construido con tecnologías modernas de desarrollo web:

- **Interfaz:** Aplicación web adaptable a escritorio y móvil, con diseño oscuro profesional
- **Base de datos:** PostgreSQL en la nube (Supabase) — segura, escalable, con copias de seguridad automáticas
- **Servidor:** Next.js — framework de alto rendimiento para aplicaciones web empresariales
- **Seguridad:** Autenticación por correo + contraseña, control de acceso por roles, datos cifrados en tránsito

### Diagrama de Componentes (Simplificado)

```
[Técnico en campo]           [Coordinador]           [Gerencia]
     📱 Móvil                  💻 Escritorio          💻 Escritorio
        │                           │                       │
        └───────────────────────────┴───────────────────────┘
                                    │
                          [COPS Platform — Web]
                          /dashboard/tickets
                          /dashboard/pipeline
                          /dashboard/reportes
                                    │
                          [Supabase — PostgreSQL]
                          Tickets, Usuarios, Pagos,
                          Clientes, Fotos, Config
```

---

## 6. Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|-----------|
| **Next.js 15** | Framework web (React, Server Components) |
| **TypeScript** | Tipado estático — menos errores en producción |
| **Tailwind CSS** | Diseño responsivo y consistente |
| **Supabase** | Base de datos PostgreSQL + almacenamiento de archivos |
| **Zod** | Validación de datos en formularios |
| **Vercel** | Hospedaje en la nube (despliegue automático desde GitHub) |

---

## 7. Capturas de Pantalla

> *(Insertar capturas en esta sección para la presentación final)*

**7.1 Dashboard Principal**
*[Captura del panel con KPIs, gráficos y pipeline]*

**7.2 Vista Pipeline (Tablero Kanban)**
*[Captura del board con columnas por estado]*

**7.3 Detalle de Ticket**
*[Captura de la página de detalle con tabs]*

**7.4 Vista Móvil — Técnico**
*[Captura de la lista de tickets en teléfono]*

**7.5 Cuadro de Pagos**
*[Captura del cuadro agrupado por técnico]*

**7.6 Gestión de Clientes**
*[Captura de la tabla de clientes con panel detalle]*

---

## 8. Metodología de Desarrollo

El sistema fue desarrollado en **sprints iterativos** de una semana:

| Sprint | Entregables |
|--------|-------------|
| 1 | Base de datos, tipos del sistema, dashboard básico |
| 2 | Gestión completa de tickets, estados, pagos |
| 3 | Fotos, perfiles de usuario, comprobantes |
| 4 | Inspecciones técnicas, reportes, mejoras de UX |
| 5 | Vista móvil técnicos, pipeline dedicado, configuración |
| 6 | Rediseño visual, estados bidireccionales, historial |
| 7 | Base de datos de clientes, cuadro de pagos |
| 8 | Mejoras al formulario, correcciones, documentación |

---

## 9. Conclusiones

### Logros

1. **Sistema funcional** con modo demo (sin base de datos real) y modo producción (Supabase)
2. **Control de acceso granular** con 5 niveles de usuario y más de 15 permisos diferenciados
3. **Diseño responsivo** que funciona correctamente en escritorio y teléfonos móviles
4. **Trazabilidad completa** de cada servicio desde apertura hasta cobro de comisión
5. **Exportación de datos** en formatos útiles (CSV para pagos, PDF para comprobantes)

### Lecciones Aprendidas

- La arquitectura dual (demo + producción) fue clave para poder desarrollar y demostrar sin depender de credenciales reales
- El enfoque mobile-first resultó más complejo de lo esperado para usuarios con múltiples roles
- La gestión de permisos granulares requirió definir desde el inicio un sistema RBAC robusto

### Trabajo Futuro

- **Notificaciones en tiempo real** cuando un técnico actualiza un ticket
- **Calendario de servicios** para visualizar la carga semanal del equipo
- **Integración con cotizaciones** (sistema de presupuestos ya desarrollado en paralelo)
- **Aplicación móvil nativa** para técnicos de campo con funcionalidad offline
- **API REST pública** para integración con sistemas de terceros (ERP, facturación)

---

*COPS Platform — Desarrollado con Next.js, TypeScript y Supabase.*
*© 2026 COP'S Electronics, S.A.*
