import { NextResponse } from "next/server"
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/ai/knowledge/supabase-admin"

export const runtime = "nodejs"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, documents: [] }, { status: 200 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("ai_knowledge_documents")
    .select("id, source_type, source_name, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, documents: data || [] }, { status: 200 })
}

