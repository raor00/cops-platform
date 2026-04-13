# COPS Platform — Preguntas Probables del Jurado y Respuestas Modelo

## Cómo usar este documento

Este archivo está diseñado para estudiar la defensa del trabajo de grado.

Puedes usarlo de tres maneras:

1. leerlo como banco de preguntas
2. practicar respuestas en voz alta
3. cargarlo en NotebookLM junto con los demás documentos para repasar conceptos

---

## 1. Preguntas sobre el problema y la solución

### 1. ¿Qué problema resuelve COPS Platform?
**Respuesta modelo:**
COPS Platform resuelve la falta de control y trazabilidad en la gestión de servicios técnicos. Antes, la operación podía depender de llamadas, mensajes y registros dispersos, lo que dificultaba saber qué servicio estaba activo, quién lo atendía, qué evidencias existían y cómo se calculaban los pagos. El sistema centraliza todo ese flujo en una sola plataforma.

### 2. ¿Por qué este proyecto es importante para la empresa?
**Respuesta modelo:**
Porque convierte un proceso operativo informal en un proceso digital, auditable y medible. Eso mejora la coordinación, reduce errores, facilita el seguimiento del trabajo técnico y aporta datos útiles para decisiones gerenciales.

### 3. ¿Qué diferencia este sistema de una hoja de cálculo?
**Respuesta modelo:**
Una hoja de cálculo solo almacena datos. Este sistema, en cambio, aplica reglas de negocio, controla permisos por rol, gestiona estados, registra evidencias, genera comprobantes, habilita pagos y produce reportes operativos. Es una plataforma de gestión, no solo un repositorio de información.

---

## 2. Preguntas sobre arquitectura

### 4. ¿Qué arquitectura usaste?
**Respuesta modelo:**
Usé una arquitectura web full-stack basada en Next.js App Router. La presentación está en componentes React, la lógica de negocio se implementa con Server Actions, el tipado se maneja con TypeScript y la persistencia se resuelve con Firebase en producción y modo local en demostración.

### 5. ¿Por qué elegiste Next.js App Router?
**Respuesta modelo:**
Porque permite combinar renderizado del lado del servidor, componentes interactivos del lado del cliente y Server Actions para mutaciones. Eso simplifica la estructura del sistema, mejora la seguridad y evita exponer lógica sensible directamente en el navegador.

### 6. ¿Qué son Server Components y Client Components?
**Respuesta modelo:**
Los Server Components se ejecutan en el servidor y se usan para leer datos, acceder a cookies y variables de entorno. Los Client Components se ejecutan en el navegador y se usan para interactividad, formularios, tabs, dialogs y eventos del usuario.

### 7. ¿Qué es un Server Action?
**Respuesta modelo:**
Es una función que se ejecuta en el servidor aunque sea invocada desde la interfaz del usuario. En este proyecto se usan para crear tickets, cambiar estados, procesar pagos, guardar bitácoras, subir evidencias y actualizar entidades del sistema.

---

## 3. Preguntas sobre tecnologías elegidas

### 8. ¿Por qué usaste TypeScript?
**Respuesta modelo:**
Porque TypeScript aporta tipado estático, detección temprana de errores, contratos claros entre módulos y mayor mantenibilidad en un sistema con múltiples entidades y reglas de negocio.

### 9. ¿Por qué Firebase?
**Respuesta modelo:**
Porque me ofrecía autenticación integrada, una base documental flexible con Firestore y un ecosistema adecuado para desarrollar una solución funcional con rapidez, manteniendo control sobre usuarios, sesiones y datos operativos.

### 10. ¿Por qué no elegiste una base de datos relacional tradicional?
**Respuesta modelo:**
Porque para este proyecto prioricé velocidad de implementación, flexibilidad documental y facilidad de integración con autenticación. Firestore se adaptó bien a entidades como tickets, bitácoras, fotos, documentos y eventos operativos. Aun así, entiendo la diferencia y sé que en SQL tendría JOINs y relaciones más estrictas.

### 11. ¿Por qué hay modo local/demo?
**Respuesta modelo:**
Porque durante el desarrollo y la defensa era importante poder demostrar el sistema sin depender completamente de credenciales o infraestructura productiva. El modo local permite simular el comportamiento del sistema y validar flujos funcionales.

---

## 4. Preguntas sobre autenticación y seguridad

### 12. ¿Cómo funciona la autenticación?
**Respuesta modelo:**
El usuario inicia sesión con Firebase Authentication. Luego el servidor valida el token y crea una cookie de sesión segura. En cada request, el sistema verifica esa cookie y obtiene el perfil del usuario para aplicar permisos.

### 13. ¿Cómo controlas los permisos?
**Respuesta modelo:**
Con un modelo RBAC, es decir, control de acceso basado en roles. Cada usuario pertenece a un rol jerárquico y las Server Actions validan autenticación y nivel de acceso antes de ejecutar cualquier operación.

### 14. ¿Por qué usar cookie httpOnly en vez de localStorage?
**Respuesta modelo:**
Porque una cookie httpOnly no puede ser leída por JavaScript del navegador, lo que reduce el riesgo ante ataques XSS. Es una forma más segura de manejar la sesión.

---

## 5. Preguntas sobre tickets y operación

### 15. ¿Qué tipos de tickets maneja el sistema?
**Respuesta modelo:**
Principalmente tickets de servicio y tickets de proyecto. Además, el sistema soporta inspecciones y trazabilidad operativa de trabajos técnicos.

### 16. ¿Cómo se controla el flujo del ticket?
**Respuesta modelo:**
Mediante una máquina de estados. El ticket pasa por estados como asignado, iniciado, en progreso, finalizado o cancelado. Además existen estados operativos como programado, en sitio, trabajando, pausado o reprogramado.

### 17. ¿Qué trazabilidad guarda el sistema?
**Respuesta modelo:**
Guarda bitácora, historial de actualizaciones, fotos, documentos, tiempos de trabajo, llegada al sitio, finalización, causa de pausa y más datos asociados al ciclo completo del servicio.

### 18. ¿Cómo sabes que el técnico llegó al servicio?
**Respuesta modelo:**
Se incorporó un registro manual de llegada al sitio mediante un botón dentro del flujo operativo del ticket. La decisión fue mantenerlo simple y usable para el contexto real del técnico.

### 19. ¿Cómo manejas que un trabajo continúe al día siguiente?
**Respuesta modelo:**
El sistema permite pausar el trabajo, registrar el motivo y reprogramar la fecha de servicio. Luego el técnico puede reanudar el trabajo y seguir acumulando trazabilidad operativa.

---

## 6. Preguntas sobre reportes

### 20. ¿Qué tipo de reportes genera el sistema?
**Respuesta modelo:**
Genera reportes por cliente, por técnico, por sede o agencia, por período, por estado y reportes detallados ticket por ticket. También permite exportación en CSV y PDF.

### 21. ¿Qué caso de negocio especial resolviste en reportes?
**Respuesta modelo:**
Un caso importante fue Bancaribe. Para ese cliente se incorporó el registro de cupones usados por servicio y la posibilidad de generar reportes mensuales por sede/agencia con total de cupones y horas trabajadas.

### 22. ¿Por qué agregaste presets en reportes?
**Respuesta modelo:**
Porque mejoran la usabilidad. Un gerente no siempre quiere construir filtros desde cero; los presets permiten acceder rápidamente a escenarios frecuentes como vista general, Bancaribe o análisis por técnico.

---

## 7. Preguntas sobre pagos

### 23. ¿Cómo funciona el pago a técnicos?
**Respuesta modelo:**
Cuando un ticket finaliza, el sistema prepara el flujo para habilitar el pago técnico correspondiente. Luego un perfil con permisos administrativos puede procesarlo desde el módulo de pagos.

### 24. ¿Qué valor aporta ese módulo?
**Respuesta modelo:**
Reduce errores manuales y mejora la trazabilidad financiera del servicio. Ya no se depende únicamente de cálculos externos o registros separados del proceso operativo.

---

## 8. Preguntas sobre diseño responsivo y experiencia de usuario

### 25. ¿El sistema funciona en móvil?
**Respuesta modelo:**
Sí. El sistema fue adaptado para que el técnico pueda operarlo desde el teléfono. Se trabajó con vistas móviles para tickets, pipeline y acciones operativas críticas.

### 26. ¿Por qué es importante el enfoque móvil en este sistema?
**Respuesta modelo:**
Porque el usuario técnico está en campo. Diseñar solo para escritorio habría limitado el uso real del sistema durante la ejecución del servicio.

---

## 9. Preguntas sobre calidad del software

### 27. ¿Cómo validas los datos del sistema?
**Respuesta modelo:**
Se validan en dos capas: primero en frontend con React Hook Form y Zod para dar feedback inmediato, y luego en backend mediante Server Actions, donde se vuelven a validar permisos y reglas de negocio.

### 28. ¿Qué hiciste para mantener el código limpio?
**Respuesta modelo:**
Se hizo una limpieza arquitectónica importante del módulo de tickets, eliminando código legado que ya no correspondía a la arquitectura real, dejando una base más coherente con los modos local y firebase.

### 29. ¿El sistema tiene limitaciones actuales?
**Respuesta modelo:**
Sí. Entre ellas, la falta de una suite completa de pruebas automatizadas, la necesidad futura de un catálogo formal de sedes/agencias y el soporte pendiente para múltiples técnicos por ticket con reparto flexible.

---

## 10. Preguntas sobre trabajo futuro

### 30. ¿Qué mejorarías después?
**Respuesta modelo:**
Agregar pruebas automatizadas, formalizar el catálogo de sedes/agencias, soportar múltiples técnicos por ticket, mejorar aún más la exportación de reportes y eventualmente desarrollar una experiencia móvil más robusta u offline.

### 31. ¿Se podría integrar con otros sistemas?
**Respuesta modelo:**
Sí. A futuro podría integrarse con facturación, ERP, notificaciones en tiempo real y sistemas de cotización, especialmente porque el diseño modular permite seguir extendiéndolo.

---

## 11. Preguntas difíciles con respuesta estratégica

### 32. ¿Qué fue lo más complejo del proyecto?
**Respuesta modelo:**
La parte más compleja fue lograr que el sistema no solo registrara tickets, sino que reflejara la operación real: roles, trazabilidad, tiempos, pagos, reportes y soporte móvil, todo manteniendo coherencia técnica.

### 33. ¿Qué decisión técnica consideras más importante?
**Respuesta modelo:**
La combinación de arquitectura full-stack con Next.js, tipado fuerte con TypeScript y persistencia dual local/firebase. Eso permitió construir una solución demostrable, funcional y alineada con las necesidades reales del negocio.

### 34. ¿Por qué este proyecto sí puede considerarse de nivel de ingeniería?
**Respuesta modelo:**
Porque no se limita a una interfaz visual. Involucra diseño de arquitectura, control de acceso, modelado de entidades, trazabilidad, lógica de negocio, validación, persistencia, reportes y decisiones de diseño justificadas para resolver un problema real.

---

## 12. Mini guía para estudiar con NotebookLM

### Documentos recomendados para cargar juntos

1. `DOCUMENTACION_TRABAJO_GRADO.md`
2. `NOTEBOOKLM_TRABAJO_GRADO_COPS.md`
3. `DEFENSA_18_MINUTOS_COPS.md`
4. `PREGUNTAS_JURADO_COPS.md`

### Qué pedirle a NotebookLM

- "Hazme preguntas como jurado sobre arquitectura"
- "Evalúame sobre RBAC y Server Actions"
- "Pregúntame sobre por qué usé Firebase"
- "Simula una defensa de 18 minutos"
- "Resúmeme el proyecto en lenguaje técnico pero claro"
