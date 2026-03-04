# COPIBOT Learning: RAG ahora, LoRA opcional despues

## 1) Enfoque recomendado (RAG)
RAG no entrena el modelo. COPIBOT consulta tus cotizaciones historicas (indexadas) y las usa como contexto al generar borradores.

Ventajas:
- Valor inmediato y controlable.
- No requiere GPU.
- Puedes agregar/quitar documentos cuando quieras.

Requisitos:
- Supabase con `vector` (pgvector) y el esquema de `supabase/schema.sql`.
- Ollama accesible desde la app (`OLLAMA_BASE_URL`) y un modelo de embeddings (`OLLAMA_EMBED_MODEL`).

Setup rapido:
1. Configura variables (ver `.env.example`).
2. Entra al modulo "Base de Conocimiento" y sube PDFs/XLSX/CSV.
3. Activa `AI_KNOWLEDGE_ENABLED=true`.

## 2) Entrenamiento real (LoRA/QLoRA) cuando haga falta
Esto SI entrena el modelo, y normalmente requiere GPU (cloud).

Flujo recomendado:
1. Exportar dataset en `jsonl`:
   - Input: descripcion del trabajo, requisitos, contexto.
   - Output: JSON estricto en formato `AIDraftResponse` o solo `draftPatch`.
2. Entrenar en cloud (Runpod/Colab) con QLoRA para `qwen3.5:2b` o `qwen3.5:4b`.
3. Servir el adapter en tu servidor Ubuntu y consumirlo desde COPIBOT.

Nota:
- Para la mayoria de equipos i3 + 8GB, LoRA no es practico localmente.
- En muchos casos, RAG + reglas de negocio es suficiente.

