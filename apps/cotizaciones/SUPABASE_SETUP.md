# Supabase Setup (Produccion)

## 1) Crear proyecto y activar plan Pro
1. Entra a https://supabase.com/dashboard.
2. Crea un proyecto nuevo (Region cercana a tu operacion).
3. Ve a `Settings > Billing`.
4. Selecciona **Pro** (pago mensual por proyecto) y agrega metodo de pago.

## 2) Ejecutar esquema
1. Abre `SQL Editor` en Supabase.
2. Copia y ejecuta `supabase/schema.sql`.
3. Verifica que las extensiones `pgcrypto` y `vector` quedaron habilitadas.

## 3) Variables en Vercel
Agregar en `Project Settings > Environment Variables`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo server-side)

## 4) Seguridad recomendada
1. Habilitar RLS en todas las tablas.
2. Crear policies por usuario/empresa antes de abrir uso multiusuario.
3. Rotar keys si se exponen.

## 5) Siguiente paso en esta app
- Migrar almacenamiento actual de `localStorage` a Supabase (cotizaciones, notas, guias, catalogo).
- Mantener fallback local para modo offline.

## 6) Base de Conocimiento (RAG) para COPIBOT
El esquema incluye tablas para RAG:
- `ai_knowledge_documents`
- `ai_knowledge_chunks` (con columna `embedding vector(768)`)

Variables necesarias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side)
- `OLLAMA_BASE_URL` (para embeddings)
- `OLLAMA_EMBED_MODEL` (default recomendado: `nomic-embed-text`)
- `AI_KNOWLEDGE_ENABLED=true`

