# COPS Platform — Guía de Estudio Optimizada para NotebookLM

## 1. Resumen ejecutivo

**COPS Platform** es un sistema web para la gestión integral de servicios técnicos, tickets, proyectos, pagos a técnicos, reportes operativos y trazabilidad de trabajos de campo.

Su objetivo principal es digitalizar el ciclo completo del servicio técnico:

1. solicitud del cliente
2. creación del ticket
3. asignación del técnico
4. ejecución del servicio
5. registro de evidencias
6. generación de comprobante
7. habilitación de pago
8. análisis y reportes

---

## 2. Problema que resuelve

Antes del sistema, la gestión de servicios técnicos suele presentar estos problemas:

- tickets dispersos en WhatsApp, llamadas y hojas de cálculo
- poca visibilidad del estado real del servicio
- dificultad para saber quién atendió qué
- registros incompletos de materiales, fotos y tiempos
- problemas para calcular pagos y comisiones
- poca trazabilidad para auditoría y control gerencial

**COPS Platform resuelve esto centralizando la operación en una sola plataforma web.**

---

## 3. Arquitectura real del sistema

### 3.1 Arquitectura general

El sistema está construido sobre **Next.js App Router**, con una arquitectura full-stack donde la UI, la lógica de negocio y el acceso a datos están integrados por dominio.

La aplicación funciona con **dos modos de persistencia reales**:

- **modo local/demo** → datos simulados en memoria
- **modo firebase** → Firebase Authentication + Firestore + almacenamiento de archivos

> Nota importante: el módulo `apps/tickets` fue limpiado de Supabase y ya no lo usa como proveedor activo.

### 3.2 Capas principales

#### Capa de presentación
- rutas en `app/`
- componentes reutilizables en `components/`
- Tailwind CSS + Radix UI

#### Capa de aplicación
- Server Actions en `lib/actions/`
- validaciones con Zod
- reglas de negocio por dominio

#### Capa de dominio
- contratos de negocio en `types/index.ts`
- jerarquía de roles
- transiciones de estado
- estructuras para tickets, pagos, inspecciones, reportes, mantenimiento

#### Capa de infraestructura
- Firebase Auth
- Firestore
- helper de storage unificado
- modo local con `mock-data.ts`

---

## 4. Stack tecnológico

| Categoría | Tecnología | Rol dentro del sistema |
|---|---|---|
| Framework | Next.js 15/16 App Router | Renderizado híbrido, rutas, server actions |
| Lenguaje | TypeScript | Tipado estático y seguridad estructural |
| UI | Tailwind CSS + Radix UI | Diseño responsivo y accesible |
| Formularios | React Hook Form + Zod | Captura y validación robusta |
| Autenticación | Firebase Authentication | Inicio de sesión y sesiones |
| Base de datos | Firestore | Persistencia documental del negocio |
| Archivos | Cloudinary + fallback Firebase Storage | Fotos y documentos |
| Notificaciones | Sonner | Feedback visual al usuario |
| Gráficas | Recharts | KPIs y visualización de reportes |

---

## 5. Módulos principales

### 5.1 Dashboard
Proporciona indicadores claves:

- tickets totales
- tickets finalizados
- tickets activos
- ingresos del mes
- distribución por estado
- rendimiento por técnico
- tickets creados por mes

### 5.2 Tickets
Es el núcleo del sistema.

Permite:

- crear tickets de servicio, proyecto e inspección
- asociar cliente
- asignar técnico
- programar `fecha_servicio`
- registrar llegada, inicio, pausa, reanudación y finalización
- gestionar documentos y fotos
- llevar bitácora y trazabilidad

### 5.3 Pipeline
Tiene dos vistas:

- **Tablero** → flujo visual por estado
- **Calendario** → programación por fecha de servicio

### 5.4 Pagos
Cuando un ticket finaliza, el sistema habilita el pago técnico según la lógica definida.

### 5.5 Reportes
Incluye:

- filtros por mes, cliente, sede/agencia y técnico
- resumen por cliente y sede/agencia
- detalle Bancaribe por agencia
- reporte por técnico
- detalle ticket por ticket
- exportación CSV y PDF

---

## 6. Gestión operativa del ticket

### 6.1 Estados funcionales

Estados del ticket:

- borrador
- asignado
- iniciado
- en progreso
- finalizado
- cancelado

Estados operativos:

- programado
- en sitio
- trabajando
- pausado
- reprogramado
- finalizado

### 6.2 Eventos manuales del técnico

El sistema permite registrar:

- llegada al sitio
- inicio del trabajo
- pausa / continuar mañana
- reanudación
- finalización

Esto permite medir:

- tiempo trabajado en minutos y horas
- tiempo total transcurrido
- trazabilidad operativa real

---

## 7. Roles y control de acceso

Jerarquía:

1. técnico
2. coordinador
3. gerente
4. vicepresidente
5. presidente

El sistema usa **RBAC** con permisos explícitos y jerarquía numérica.

Ejemplos:

- técnico: ve sus propios tickets
- coordinador: crea tickets y ve operación
- gerente: ve usuarios, pagos y reportes
- vicepresidente/presidente: administración ampliada

---

## 8. Modo local y modo producción

### Modo local
- permite demostrar el sistema sin credenciales reales
- usa datos simulados en memoria
- ideal para defensa y pruebas funcionales

### Modo firebase
- usa persistencia real
- autenticación real
- datos reales del negocio

### Valor arquitectónico
La coexistencia de ambos modos permitió desarrollar, probar y demostrar el sistema sin depender completamente de infraestructura externa en todas las etapas.

---

## 9. Reportes Bancaribe

El sistema incorpora soporte para casos operativos como Bancaribe:

- detección por `cliente_empresa`
- campo libre de sede/agencia
- cupones usados manuales
- filtros por período, cliente, sede/agencia y técnico
- resumen mensual listo para impresión

Esto permite responder preguntas reales de negocio como:

- cuántos servicios se hicieron por sede/agencia
- cuántos cupones se consumieron
- cuánto tiempo trabajó el equipo
- qué técnico atendió cada caso

---

## 10. Decisiones de diseño defendibles

### 10.1 Next.js App Router
Permite separar claramente:

- Server Components para lectura segura
- Client Components para interacción
- Server Actions para mutaciones sin crear una API REST manual completa

### 10.2 TypeScript estricto
Reduce errores por contratos inválidos y permite evolucionar el sistema con más seguridad.

### 10.3 Firebase + Firestore
Se eligió por:

- rapidez de integración
- autenticación administrada
- facilidad para documentos y trazabilidad
- menor carga de administración de infraestructura

### 10.4 Diseño mobile-first para técnicos
El técnico usa el sistema desde el teléfono, por eso hay vistas específicas y acciones operativas simplificadas.

---

## 11. Fortalezas del sistema

- trazabilidad completa del ticket
- control de acceso por jerarquía
- soporte operativo y gerencial
- programación por calendario
- bitácora, fotos y documentos
- reportes exportables
- soporte para escenarios de negocio específicos como Bancaribe

---

## 12. Limitaciones actuales

- no hay suite completa de pruebas automatizadas visible en el módulo
- algunos archivos siguen siendo grandes y podrían dividirse más por casos de uso
- la sede/agencia todavía es texto libre en algunos reportes y tickets
- el modelo de múltiples técnicos por ticket aún no está completamente implementado

---

## 13. Trabajo futuro

- catálogo formal de sedes/agencias
- participación flexible de múltiples técnicos por ticket
- notificaciones en tiempo real
- app móvil nativa/offline
- pruebas automatizadas de integración
- presets personalizados de reportes

---

## 14. Preguntas típicas del jurado y respuestas cortas

### ¿Por qué no una SPA tradicional?
Porque Next.js App Router permite ejecutar lectura y mutación en el servidor, reduciendo exposición de lógica crítica y mejorando el rendimiento inicial.

### ¿Por qué Firestore y no SQL?
Porque prioricé rapidez de entrega, autenticación integrada y un modelo documental flexible para tickets, bitácoras, fotos y eventos operativos.

### ¿Qué aporta TypeScript?
Aporta seguridad estructural, contratos de datos claros y menor probabilidad de errores en cambios grandes del sistema.

### ¿Qué hace profesional la solución?
Centraliza la operación, controla accesos, mantiene trazabilidad, genera reportes y soporta decisiones reales de negocio.

---

## 15. Resumen para memorizar

**COPS Platform** es una aplicación web full-stack desarrollada con Next.js, TypeScript y Firebase para gestionar el ciclo completo de servicios técnicos, desde la creación del ticket hasta el reporte y pago del técnico, con trazabilidad, control por roles, soporte móvil y reportes operativos exportables.
