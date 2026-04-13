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
- **Bitácora de notas (UpdateLog)**: el coordinador puede agregar notas de seguimiento en formato timeline durante la vida del ticket, sin cambiar el estado

### 3.2b Control de Estados con Reversión (Gerencia)

El flujo normal es lineal: Asignado → Iniciado → En Progreso → Finalizado. Sin embargo, cuando ocurre un error operativo (ticket finalizado prematuramente, información incorrecta), la gerencia necesita corregirlo. Por eso el sistema implementa **estados bidireccionales**:

- Los usuarios con rol **Gerente o superior** pueden revertir el estado de un ticket al estado anterior
- Esta capacidad está restringida intencionalmente: un técnico no puede revertir su propio trabajo
- Cada reversión queda registrada en el historial de cambios con el usuario que la realizó

### 3.3 Inspecciones Técnicas

Para proyectos que requieren visita previa, el sistema incluye un formulario de inspección con 25 ítems organizados en 5 categorías (eléctrica, red, seguridad, etc.). El inspector marca cada ítem como "OK", "Falla" o "No aplica" y puede agregar notas por ítem. El resultado es un informe imprimible que queda adjunto al ticket.

Los estados de una inspección siguen su propio ciclo: **Borrador → Completada → Reportada**.

### 3.4 Documentación Fotográfica

Los técnicos pueden subir fotos desde el campo que quedan vinculadas al ticket para respaldo y comprobación. Las fotos se almacenan en la nube (Firebase Storage) con tipos definidos:

| Tipo | Uso |
|------|-----|
| `antes` | Estado del equipo al llegar |
| `progreso` | Durante la ejecución del trabajo |
| `despues` | Resultado final |
| `inspeccion` | Evidencias del levantamiento |
| `documento` | Facturas, guías, actas |

### 3.4b Nuevos Campos del Ticket (Sprint 8)

El formulario de creación de tickets incorporó campos adicionales para capturar información operativa más precisa:

- **Tipo de mantenimiento**: Correctivo o Preventivo (solo visible cuando el tipo es "servicio")
- **Número de carta de aceptación**: campo opcional que aparece cuando el origen del ticket es una "carta de aceptación" — vincula el trabajo a un documento formal del cliente
- **Notas para el técnico**: instrucciones específicas del coordinador al técnico antes de ir al campo

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
- **Base de datos:** Firestore (Firebase) — base de datos NoSQL en la nube, sin servidor que administrar, escalable automáticamente
- **Autenticación:** Firebase Authentication — gestión de sesiones segura con tokens firmados y cookies de servidor
- **Archivos:** Firebase Storage — almacenamiento de fotos e imágenes vinculadas a cada ticket
- **Servidor:** Next.js — framework de alto rendimiento para aplicaciones web empresariales
- **Seguridad:** Autenticación por correo + contraseña, control de acceso por roles, datos cifrados en tránsito

### Diagrama de Componentes (Simplificado)

```
[Técnico en campo]           [Coordinador]           [Gerencia]
     Móvil                    Escritorio               Escritorio
        │                           │                       │
        └───────────────────────────┴───────────────────────┘
                                    │
                          [COPS Platform — Web]
                          /dashboard/tickets
                          /dashboard/pipeline
                          /dashboard/reportes
                                    │
                    ┌───────────────┴────────────────┐
              [Firebase Auth]               [Firebase / Firestore]
              Sesiones de usuario           Tickets, Usuarios, Pagos,
              Tokens firmados               Clientes, Fotos, Config
                                    │
                          [Firebase Storage]
                          Fotos de tickets e inspecciones
```

---

## 6. Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|-----------|
| **Next.js 15** | Framework web (React, Server Components) |
| **TypeScript** | Tipado estático — menos errores en producción |
| **Tailwind CSS** | Diseño responsivo y consistente |
| **Firebase Authentication** | Gestión de sesiones, login seguro, tokens de usuario |
| **Firestore (Firebase)** | Base de datos NoSQL en la nube — colecciones de documentos |
| **Firebase Storage** | Almacenamiento de fotos e imágenes de los tickets |
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

## 7b. Detalle del Ticket — Cinco Pestañas (Tabs)

La página de detalle de un ticket está organizada en **5 pestañas** para no saturar al usuario con información:

| Pestaña | Contenido | Visible para |
|---------|-----------|-------------|
| **Detalle** | Datos completos, barra de progreso (proyectos), botones de acción | Todos |
| **Fases** | Etapas del proyecto con % de avance individual | Solo proyectos |
| **Fotos** | Galería organizada por tipo de foto | Todos |
| **Historial** | Timeline de cambios de estado + notas UpdateLog | Todos |
| **Inspección** | Resultado del levantamiento técnico previo | Todos |

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

1. **Sistema funcional** con modo demo (sin base de datos real) y modo producción (Firebase + Firestore)
2. **Control de acceso granular** con 5 niveles de usuario y más de 15 permisos diferenciados
3. **Diseño responsivo** que funciona correctamente en escritorio y teléfonos móviles
4. **Trazabilidad completa** de cada servicio desde apertura hasta cobro de comisión
5. **Exportación de datos** en formatos útiles (CSV para pagos, PDF para comprobantes)

### Lecciones Aprendidas

- La arquitectura dual (modo local con datos en memoria + modo Firebase para producción) fue clave para desarrollar y demostrar sin depender de credenciales reales en todo momento
- La migración de base de datos relacional (PostgreSQL) a NoSQL (Firestore) requirió rediseñar cómo se obtienen datos relacionados, ya que Firestore no tiene JOINs
- El enfoque mobile-first resultó más complejo de lo esperado para usuarios con múltiples roles
- La gestión de permisos granulares requirió definir desde el inicio un sistema RBAC robusto

### Trabajo Futuro

- **Notificaciones en tiempo real** cuando un técnico actualiza un ticket
- **Calendario de servicios** para visualizar la carga semanal del equipo
- **Integración con cotizaciones** (sistema de presupuestos ya desarrollado en paralelo)
- **Aplicación móvil nativa** para técnicos de campo con funcionalidad offline
- **API REST pública** para integración con sistemas de terceros (ERP, facturación)

---

## 10. Guía de Presentación — Demo de 12 Minutos

Esta sección describe el flujo recomendado para demostrar el sistema en la defensa del trabajo de grado. El objetivo es guiar al jurado a través de un caso de uso real de principio a fin.

### Introducción (2 min)
- Presentar el problema: coordinar servicios técnicos sin herramientas especializadas genera caos operativo
- Mostrar el dashboard principal — los KPIs dan una visión inmediata del valor del sistema
- Señalar: "Este panel responde en tiempo real la pregunta que un gerente se hace cada mañana: ¿cuántos servicios tenemos activos hoy?"

### Flujo principal: de la solicitud al cobro (7 min)

**Paso 1 — Crear un ticket** (`/dashboard/tickets/nuevo`)
- Buscar un cliente existente en el selector → los campos se auto-rellenan
- Seleccionar tipo "servicio" y mostrar cómo aparece el campo "tipo de mantenimiento"
- Cambiar origen a "carta de aceptación" → mostrar cómo aparece el campo "número de carta"
- Agregar notas para el técnico
- Crear el ticket

**Paso 2 — Vista del técnico en móvil** (`/dashboard/tickets` — reducir ventana del browser)
- Mostrar las tarjetas con borde de color por estado
- Mostrar los filtros por estado en barra horizontal (pills)
- "El técnico lo ve desde su teléfono sin instalar ninguna app"

**Paso 3 — Pipeline Kanban** (`/dashboard/pipeline`)
- Mostrar el tablero completo con las 4 columnas
- Filtrar por un técnico específico
- "El coordinador puede ver de un vistazo si un técnico está sobrecargado"

**Paso 4 — Detalle del ticket y progreso** (`/dashboard/tickets/[id]`)
- Cambiar el estado a "Iniciado" (un clic)
- Abrir la pestaña Fotos → explicar los tipos de foto
- Agregar una nota en la pestaña Historial (UpdateLog)
- Cambiar estado a "Finalizar" → mostrar el wizard de 3 pasos (materiales, tiempo, solución)

**Paso 5 — Comprobante de servicio** (`/dashboard/tickets/[id]/comprobante`)
- Mostrar el documento generado con el formato oficial de COPS
- "Este reemplaza el comprobante en papel que se llenaba a mano en el campo"

**Paso 6 — Pago al técnico** (`/dashboard/pagos`)
- Mostrar el pago pendiente generado automáticamente al finalizar el ticket
- Procesar el pago → mostrar el dialog con el monto calculado automáticamente

### Control de acceso (1 min)
- Mostrar el cambio de rol en la sesión (o dos navegadores)
- Un técnico no puede ver tickets de otros técnicos
- Un técnico no puede acceder al módulo de pagos

### Cierre (2 min)
- Resumir el flujo completo: solicitud → asignación → campo → comprobante → pago
- "Todo el ciclo de servicio queda registrado, trazado y auditable"

---

## 11. Temas a Estudiar para la Defensa

Esta sección lista los conceptos técnicos que el jurado puede preguntar, organizados por área. Para cada tema se indica por qué es relevante en el sistema y qué responder.

### 11.1 Next.js y React Server Components

**¿Por qué Server Components en lugar de un SPA clásico?**
- Los Server Components se ejecutan en el servidor y envían HTML listo al navegador: menos JavaScript en el cliente, carga inicial más rápida
- Los datos se leen directamente desde la base de datos sin exponer una API pública
- Respuesta correcta: "Reducen la superficie de ataque porque la lógica de negocio nunca llega al browser"

**¿Qué es un Server Action?**
- Una función marcada con `"use server"` que el browser puede invocar, pero que siempre ejecuta en el servidor
- Reemplaza la necesidad de crear endpoints REST manualmente
- El framework se encarga del transporte HTTP de forma transparente

**¿Por qué `Promise.all` en las páginas de detalle?**
- Si las queries a la base de datos se hacen secuencialmente (una después de otra), el tiempo total es la suma de todas
- Con `Promise.all` se ejecutan en paralelo: el tiempo total es el de la query más lenta, no la suma

### 11.2 Arquitectura de Seguridad

**¿Cómo evitas que un técnico vea tickets de otros?**
- Primera capa: en el Server Component, se filtra por `tecnico_id === currentUser.id`
- Segunda capa: en la Server Action, se verifica que el usuario solo puede actuar sobre sus tickets
- Tercera capa (producción): Firebase Security Rules — reglas declaradas en Firebase que la base de datos aplica independientemente de la aplicación

**¿Qué son las Firebase Security Rules?**
- Reglas de seguridad definidas directamente en Firebase (equivalente al RLS de PostgreSQL)
- Aunque alguien acceda directamente a Firestore con las credenciales, las reglas garantizan que solo lee y escribe lo que le corresponde
- Ejemplo: `allow read: if request.auth.uid == resource.data.tecnico_id` — solo el técnico asignado puede leer su ticket

**¿Qué es RBAC?**
- Role-Based Access Control: cada usuario tiene un rol, cada rol tiene permisos definidos
- El sistema usa jerarquía numérica (1=técnico hasta 5=presidente) más permisos granulares nombrados
- La jerarquía se aplica para acceso general; los permisos granulares para acciones específicas (ej: `config:edit`)

**¿Por qué validar en dos capas (frontend y backend)?**
- La validación frontend (Zod + React Hook Form) es para UX: errores inmediatos sin roundtrip al servidor
- La validación backend es la barrera de seguridad real: no se puede saltear enviando requests directamente
- Nunca confiar en el cliente — el frontend puede ser modificado por el usuario

### 11.3 Base de Datos y Firebase

**¿Por qué Firebase/Firestore en lugar de una base de datos propia?**
- Firebase provee en un solo servicio: Firestore (base de datos NoSQL), Firebase Auth (login y sesiones), Firebase Storage (archivos)
- Reduce el tiempo de desarrollo al no tener que configurar ni mantener servidor de base de datos
- Escala automáticamente y tiene alta disponibilidad incluida sin configuración adicional

**¿Qué diferencia hay entre Firestore (NoSQL) y una base de datos relacional (PostgreSQL)?**
- En PostgreSQL los datos se organizan en tablas con filas y columnas; en Firestore en colecciones de documentos JSON
- PostgreSQL tiene JOINs para relacionar tablas; Firestore no — cada documento debe auto-contenerse o se hacen múltiples lecturas y se combinan en código
- PostgreSQL usa SQL; Firestore usa un SDK con métodos: `.collection("tickets").where("estado", "==", "asignado").get()`
- Firestore rechaza campos `undefined` — por eso existe la función `cleanForFirestore()` que los elimina antes de escribir

**¿Qué es un JWT (JSON Web Token)?**
- Token firmado digitalmente que contiene la identidad del usuario
- Firebase Auth lo genera al hacer login — se llama "ID Token" y tiene validez de 1 hora
- No se puede falsificar sin la clave privada de Google que firma los tokens
- El servidor lo verifica con `getAdminAuth().verifyIdToken(idToken)` y crea una cookie de sesión de 7 días

**¿Por qué TypeScript en lugar de JavaScript?**
- Tipos estáticos detectan errores en compilación, antes de que el código llegue a producción
- Autocompletado en el editor reduce errores de tipeo en nombres de campos
- En este sistema es crítico: un campo mal escrito (`tecnico_id` vs `tecnicoId`) puede romper una query silenciosamente

### 11.4 Decisiones de Diseño

**¿Por qué una máquina de estados para el ticket?**
- Sin una máquina de estados, cualquier estado puede transitar a cualquier otro: un técnico podría finalizar un ticket que no ha iniciado
- `VALID_TRANSITIONS` define explícitamente qué transiciones son legales
- Es el patrón "State Machine" o "Finite State Machine" (FSM) — concepto fundamental de sistemas

**¿Por qué el modo dual (demo/producción)?**
- Durante el desarrollo y en demostraciones, no se quiere depender de credenciales reales de Firebase
- El modo local usa datos en memoria (`mock-data.ts`) que simulan todos los flujos
- Permite demostrar el sistema en cualquier ambiente sin configurar infraestructura de Firebase

**¿Por qué Zod para validación?**
- Zod genera tipos TypeScript automáticamente desde los schemas
- Un solo schema define tanto la validación en runtime como los tipos en compilación: no hay duplicación
- Ejemplo: `z.string().min(3).max(100)` genera el tipo `string` y valida la longitud en ejecución

**¿Por qué React Hook Form?**
- Los formularios controlados de React clásico re-renderizan el componente completo con cada keystroke
- React Hook Form usa referencias no controladas: solo re-renderiza cuando cambia el estado de validación
- En formularios grandes (como el de creación de ticket con 10+ campos), la diferencia es notable

### 11.5 Preguntas Conceptuales del Dominio

**¿Cuál es el problema principal que resuelve el sistema?**
- Trazabilidad: saber en todo momento en qué estado está cada servicio, quién lo atendió y qué hizo
- Eliminar coordinación informal (WhatsApp, papel) que no deja registro

**¿Cómo mide el sistema el rendimiento de un técnico?**
- Tickets completados en el período
- Tiempo promedio de resolución (basado en `tiempo_trabajado` registrado al finalizar)
- Monto de comisiones generadas
- Tabla en `/dashboard/reportes` con comparativa entre técnicos

**¿Por qué el comprobante se genera en el navegador y no en el servidor?**
- La generación PDF en el servidor requiere librerías pesadas (puppeteer, PDFKit)
- El mecanismo `window.print()` + `@media print CSS` usa la capacidad nativa del navegador
- El resultado es idéntico para el usuario final: un PDF guardado en su equipo
- Es más simple, sin dependencias adicionales y funciona en todos los dispositivos

---

*COPS Platform — Desarrollado con Next.js, TypeScript y Firebase.*
*© 2026 COP'S Electronics, S.A.*
