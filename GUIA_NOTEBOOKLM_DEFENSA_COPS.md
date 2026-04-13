# Guía de Uso de NotebookLM para la Defensa — COPS Platform

## 1. Objetivo de esta guía

Este documento te explica cómo usar **NotebookLM** para estudiar de forma eficiente todo el material de defensa del trabajo de grado.

La idea es que no uses NotebookLM solo como lector de documentos, sino como:

- entrenador de defensa
- generador de resúmenes
- simulador de jurado
- herramienta de repaso técnico

---

## 2. Archivos que debes subir a NotebookLM

Sube estos archivos dentro del mismo notebook:

1. `DOCUMENTACION_TRABAJO_GRADO.md`
2. `NOTEBOOKLM_TRABAJO_GRADO_COPS.md`
3. `DEFENSA_18_MINUTOS_COPS.md`
4. `PREGUNTAS_JURADO_COPS.md`

Opcional:

5. `PROMPT_GAMMA_PRESENTACION_COPS.md`

---

## 3. Cómo organizar el notebook

### Nombre recomendado del notebook

`Defensa Trabajo de Grado COPS`

### Recomendación práctica

Mantén todos los documentos de estudio dentro de un solo notebook para que NotebookLM pueda cruzar la información y darte respuestas más completas.

---

## 4. Orden recomendado de estudio

No estudies todo al mismo tiempo. Sigue este orden:

### Paso 1 — Dominio del discurso
Empieza por:

- `DEFENSA_18_MINUTOS_COPS.md`

Objetivo:
- aprender la secuencia de la exposición
- memorizar qué decir y en qué orden

### Paso 2 — Comprensión técnica general
Luego estudia:

- `NOTEBOOKLM_TRABAJO_GRADO_COPS.md`

Objetivo:
- entender arquitectura
- repasar módulos
- fortalecer conceptos

### Paso 3 — Preparación para preguntas
Después trabaja con:

- `PREGUNTAS_JURADO_COPS.md`

Objetivo:
- practicar respuestas
- anticipar preguntas del jurado

### Paso 4 — Respaldo técnico completo
Finalmente usa:

- `DOCUMENTACION_TRABAJO_GRADO.md`

Objetivo:
- profundizar si algo no lo dominas
- usarlo como respaldo académico técnico

---

## 5. Qué NO hacer con NotebookLM

- no usarlo solo para resumir todo una y otra vez
- no depender de resúmenes si no puedes explicarlo con tus propias palabras
- no estudiar solo leyendo: debes practicar preguntas y respuestas
- no intentar memorizar literalmente toda la documentación técnica extensa

---

## 6. Cómo usar NotebookLM correctamente

## A. Para entender el proyecto

Usa prompts como:

- `Resúmeme el proyecto en 10 puntos clave.`
- `Explícame la arquitectura del sistema de forma clara y técnica.`
- `Explícame cómo funciona el flujo de un ticket de inicio a fin.`
- `Dime cuáles son las decisiones técnicas más importantes del proyecto.`

---

## B. Para memorizar la defensa oral

Usa prompts como:

- `Hazme un resumen oral de 5 minutos sobre este trabajo de grado.`
- `Hazme un resumen oral de 10 minutos sobre el sistema.`
- `Hazme un guion oral para una defensa de 18 minutos.`
- `Dime qué debo explicar primero, segundo y tercero en la defensa.`
- `Convierte este contenido en un discurso natural para exponer.`

---

## C. Para practicar como si fuera el jurado

Usa prompts como:

- `Hazme preguntas como jurado sobre la arquitectura del sistema.`
- `Simula una defensa oral con preguntas técnicas y respuestas esperadas.`
- `Hazme preguntas difíciles sobre Firebase, Next.js y TypeScript.`
- `Actúa como jurado universitario y evalúa mis respuestas.`
- `Hazme una ronda de preguntas sobre seguridad, autenticación y control de acceso.`

---

## D. Para reforzar conceptos específicos

Usa prompts como:

- `Explícame qué es RBAC y cómo se aplica en este sistema.`
- `Explícame qué son los Server Actions y por qué se usaron.`
- `Explícame por qué se usó Firebase en este proyecto.`
- `Explícame la diferencia entre Server Components y Client Components usando este sistema como ejemplo.`
- `Explícame cómo funciona el modo local/demo del sistema.`
- `Explícame la lógica del pipeline y el calendario de tickets.`
- `Explícame cómo funcionan los reportes y el caso Bancaribe.`

---

## E. Para detectar debilidades en tu estudio

Usa prompts como:

- `Dime qué temas del proyecto son más propensos a preguntas del jurado.`
- `Señálame los conceptos que debo dominar sí o sí para defender este trabajo.`
- `Hazme una lista de temas técnicos que podrían preguntarme.`
- `Dime qué partes del proyecto pueden ser más difíciles de explicar.`

---

## F. Para estudiar con flashcards

Usa prompts como:

- `Convierte este material en flashcards de pregunta y respuesta.`
- `Hazme 20 flashcards sobre arquitectura, seguridad y reportes.`
- `Hazme tarjetas de estudio sobre Firebase, roles, tickets y pagos.`

---

## G. Para preparar respuestas cortas

Usa prompts como:

- `Dame respuestas cortas y técnicas para preguntas del jurado.`
- `Respóndeme como si tuviera que contestar en menos de 30 segundos.`
- `Dame una versión académica y otra simple de esta respuesta.`

---

## 7. Prompts listos para copiar y pegar

## Prompt 1 — Resumen general

```text
Resúmeme este trabajo de grado en 10 puntos clave, destacando problema, solución, arquitectura, módulos y valor técnico.
```

## Prompt 2 — Arquitectura

```text
Explícame la arquitectura del sistema COPS Platform de forma técnica pero clara, como si fuera para responderle a un jurado universitario.
```

## Prompt 3 — Defensa oral

```text
Hazme un guion oral de defensa de 18 minutos basado en estos documentos, separando introducción, problema, solución, arquitectura, demo y cierre.
```

## Prompt 4 — Simulación de jurado

```text
Actúa como jurado de Ingeniería en Informática y hazme preguntas técnicas sobre este trabajo de grado. Empieza con preguntas generales y luego aumenta la dificultad.
```

## Prompt 5 — Preguntas difíciles

```text
Hazme preguntas difíciles sobre las decisiones técnicas del proyecto, especialmente sobre Next.js, TypeScript, Firebase, seguridad, reportes y trazabilidad.
```

## Prompt 6 — Autoevaluación

```text
Dime cuáles son los temas más importantes que debo dominar para defender este proyecto con seguridad y cuáles serían mis puntos débiles más probables.
```

## Prompt 7 — Flashcards

```text
Convierte este material en flashcards de pregunta y respuesta para estudiar arquitectura, autenticación, tickets, pagos y reportes.
```

## Prompt 8 — Respuestas cortas

```text
Dame respuestas cortas, claras y técnicas a las preguntas más probables del jurado sobre este trabajo de grado.
```

## Prompt 9 — Explicación simplificada

```text
Explícame este proyecto como si yo tuviera que defenderlo ante personas técnicas pero no expertas en Next.js o Firebase.
```

## Prompt 10 — Repaso final antes de la defensa

```text
Hazme un repaso final de lo más importante que debo recordar antes de defender este trabajo de grado.
```

---

## 8. Método de estudio recomendado

### Día 1
- leer `DEFENSA_18_MINUTOS_COPS.md`
- pedir a NotebookLM un resumen oral

### Día 2
- repasar `NOTEBOOKLM_TRABAJO_GRADO_COPS.md`
- pedir explicaciones sobre arquitectura y tecnologías

### Día 3
- trabajar con `PREGUNTAS_JURADO_COPS.md`
- practicar preguntas y respuestas

### Día 4
- usar `DOCUMENTACION_TRABAJO_GRADO.md` como respaldo
- profundizar en dudas específicas

### Últimos días
- simulación de jurado
- repaso de preguntas difíciles
- ensayo oral cronometrado

---

## 9. Consejo final

NotebookLM te ayuda muchísimo, pero no sustituye que tú puedas explicar el sistema con tus propias palabras.

La meta no es memorizar texto. La meta es que puedas responder con seguridad:

- qué problema resolviste
- cómo lo resolviste
- por qué elegiste esa arquitectura
- qué valor aporta el sistema

Si logras eso, vas muy bien preparado para la defensa.
