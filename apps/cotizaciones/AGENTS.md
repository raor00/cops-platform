# AGENTS.md

## Commands
- **Dev:** `pnpm dev`
- **Build/typecheck:** `pnpm build` (Next.js 16, strict TypeScript)
- **Lint:** `pnpm lint` (ESLint)
- No test framework configured.

## Architecture
- **Next.js 16** App Router (single-page app at `app/page.tsx` → `AppShell`).
- **UI:** shadcn/ui components in `components/ui/`, Radix primitives, Tailwind CSS 3, `cn()` from `lib/utils.ts`.
- **Domain components:** `components/quotation/` — quotation builder, delivery notes, transport guides, catalog manager, PDF preview.
- **Lib:** `lib/` has type definitions (`*-types.ts`), localStorage persistence (`*-storage.ts`), PDF generation (`generate-*-pdf.ts`, jspdf + html2canvas), and Ablerex product catalog.
- **DB:** Supabase (Postgres) with tables: `quotations`, `delivery_notes`, `transport_guides` (see `supabase/schema.sql`). Data stored as JSONB payloads.

## Code Style
- TypeScript strict mode; path alias `@/*` maps to project root.
- Imports: `@/components/...`, `@/lib/...`. Use `cn()` for conditional classnames.
- React 19, functional components, `"use client"` where needed.
- Forms: react-hook-form + zod. Notifications: sonner. Charts: recharts.
- Naming: kebab-case files, PascalCase components/types, camelCase functions/variables.

## AI Assistant Setup (Chatbot de cotizaciones)
- Endpoint: `POST /api/ai/quote-draft`.
- Provider mode via env:
  - `AI_PROVIDER_MODE=hybrid` (default recomendado).
  - `AI_PROVIDER_MODE=ollama` o `gemini` si quieres forzar proveedor.
- Ollama (Qwen3 / COPIBOT):
  - Configurar `OLLAMA_BASE_URL` (ej. `http://localhost:11434` o host remoto).
  - Modelo por defecto recomendado para i3 + 8GB: `qwen3.5:2b` (alternativas: `qwen3.5:0.8b`, `qwen3.5:4b`).
- Gemini fallback:
  - Configurar `GEMINI_API_KEY` y opcionalmente `GEMINI_MODEL`.
- Rate limit basico por IP: `AI_RATE_LIMIT_PER_MIN`.
- Seguridad:
  - Nunca exponer API keys en cliente.
  - El asistente solo genera borrador; no guarda cotizaciones automaticamente.
