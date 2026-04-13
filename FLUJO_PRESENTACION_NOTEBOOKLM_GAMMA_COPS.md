# Flujo recomendado para crear la presentación y estudiar la defensa

## 1. Idea general

Sí: lo más inteligente es hacerlo en este orden:

1. **definir la estructura de la defensa**
2. **generar la presentación**
3. **usar esa presentación como fuente en NotebookLM**
4. **crear el speech final por lámina**
5. **practicar la exposición completa**

Ese orden es mejor porque evita estudiar un discurso que después no coincida con las láminas reales.

---

## 2. Orden correcto de trabajo

## Fase 1 — Definir la estructura

Usa como base:

- `DEFENSA_18_MINUTOS_COPS.md`
- `NOTEBOOKLM_TRABAJO_GRADO_COPS.md`
- `PREGUNTAS_JURADO_COPS.md`

En esta fase debes decidir:

- cuántas láminas vas a usar
- qué bloques irán en la parte teórica
- qué partes mostrarás en demo
- cuánto tiempo dedicarás a cada sección

### Recomendación para 18 minutos

| Bloque | Tiempo |
|---|---:|
| Problema + objetivo | 2 min |
| Solución propuesta | 2 min |
| Arquitectura | 3 min |
| Módulos principales | 2 min |
| Demo del sistema | 7 min |
| Cierre | 2 min |

---

## Fase 2 — Crear la presentación

### Opción recomendada: Gamma

Usa el archivo:

- `PROMPT_GAMMA_PRESENTACION_COPS.md`

### Qué hacer en Gamma

1. abre Gamma
2. pega el prompt
3. genera la presentación base
4. revisa diapositiva por diapositiva
5. ajusta manualmente:
   - títulos
   - exceso de texto
   - orden de láminas
   - colores
   - imágenes o diagramas

### Lo importante

No uses la primera versión generada como definitiva.

Debes revisar que:

- no haya texto excesivo
- no meta conceptos erróneos
- no use tecnologías que ya no aplican
- no hable de cosas que no vas a mostrar

---

## Fase 3 — Exportar la presentación

Cuando tengas la presentación lista:

### exporta en alguno de estos formatos
- PDF
- PowerPoint

### recomendación
Exporta en **PDF** para subirlo luego a NotebookLM.

---

## Fase 4 — Subir la presentación a NotebookLM

Una vez que tengas el PDF de las láminas:

### súbelo al mismo notebook donde ya tienes:
- `DOCUMENTACION_TRABAJO_GRADO.md`
- `NOTEBOOKLM_TRABAJO_GRADO_COPS.md`
- `DEFENSA_18_MINUTOS_COPS.md`
- `PREGUNTAS_JURADO_COPS.md`
- `GUIA_NOTEBOOKLM_DEFENSA_COPS.md`

Y además agrega:

- **PDF de la presentación final**

### ¿Por qué hacer esto?

Porque así NotebookLM ya no te responderá solo con base en la documentación, sino también con base en las **láminas reales que vas a presentar**.

Eso permite que el speech quede alineado con lo que aparecerá en pantalla.

---

## Fase 5 — Generar el speech por lámina

Cuando el PDF esté cargado en NotebookLM, usa prompts como estos:

### Prompt 1
```text
Genera un speech oral lámina por lámina basado en esta presentación y en los documentos del proyecto. Quiero una explicación natural, técnica y clara para defensa de trabajo de grado.
```

### Prompt 2
```text
Hazme un guion de exposición siguiendo exactamente el orden de las láminas de esta presentación. Indica qué decir en cada una y cuánto tiempo dedicarle.
```

### Prompt 3
```text
Convierte esta presentación en un speech académico, profesional y natural para una defensa oral de 18 minutos.
```

### Prompt 4
```text
Dime qué debo explicar en cada lámina y qué NO debo leer literalmente.
```

---

## 3. Estructura recomendada de las láminas

Lo ideal es usar entre **10 y 12 láminas**.

## Estructura sugerida

1. **Portada**
2. **Problema**
3. **Objetivo general**
4. **Solución propuesta**
5. **Arquitectura del sistema**
6. **Módulos principales**
7. **Flujo del ticket**
8. **Demo del sistema**
9. **Reportes y valor gerencial**
10. **Resultados / logros**
11. **Trabajo futuro**
12. **Cierre / preguntas**

---

## 4. Cómo repartir teoría y demo

Tu defensa no debe ser solo diapositivas ni solo sistema.

### Recomendación

#### Parte 1 — Láminas (8 a 9 min)
- problema
- objetivo
- solución
- arquitectura
- módulos

#### Parte 2 — Demo (7 a 8 min)
- dashboard
- crear ticket
- pipeline/calendario
- detalle del ticket
- reportes/pagos

#### Parte 3 — Cierre (1 a 2 min)
- logros
- impacto
- trabajo futuro

---

## 5. Cómo construir el speech correctamente

### Lo correcto
- usar la presentación como guía visual
- hablar con tus palabras
- explicar ideas, no leer texto
- conectar cada lámina con el problema real que resolviste

### Lo incorrecto
- leer la presentación palabra por palabra
- meter demasiadas capturas
- sobrecargar láminas con texto
- explicar detalles técnicos irrelevantes para el tiempo disponible

---

## 6. Flujo recomendado real

### Paso 1
Genera la presentación en Gamma.

### Paso 2
Revísala y corrígela manualmente.

### Paso 3
Expórtala a PDF.

### Paso 4
Súbela a NotebookLM junto con los documentos de estudio.

### Paso 5
Pídele a NotebookLM:
- speech por lámina
- resumen oral completo
- preguntas del jurado basadas en la presentación

### Paso 6
Practica con cronómetro.

---

## 7. Prompts recomendados para usar después de subir el PDF

### A. Speech por lámina
```text
Analiza esta presentación y genera un speech por cada lámina, con tono académico y técnico, para una defensa oral de trabajo de grado.
```

### B. Control de tiempo
```text
Distribuye esta presentación en un guion de 18 minutos, indicando cuánto hablar en cada lámina.
```

### C. Versión natural
```text
Reescribe el discurso de esta presentación para que suene natural y no como texto leído.
```

### D. Posibles preguntas por lámina
```text
Dime qué preguntas podría hacer el jurado en cada lámina de esta presentación.
```

### E. Ensayo final
```text
Simula una defensa completa basada en esta presentación: primero el speech y luego una ronda de preguntas del jurado.
```

---

## 8. Recomendación final

### Sí, este es el mejor flujo:

**Primero presentacion → luego NotebookLM con la presentación → luego speech final.**

Eso te garantiza coherencia entre:

- lo que muestras
- lo que explicas
- lo que estudias
