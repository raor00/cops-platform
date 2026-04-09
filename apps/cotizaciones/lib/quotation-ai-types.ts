import { z } from "zod"
import type { ClientInfo, DiscountMode } from "./quotation-types"

export type AIProvider = "ollama" | "gemini"

export interface AIGenerationMetadata {
  provider: AIProvider
  model: string
  latencyMs: number
  fallbackUsed: boolean
}

export interface AIDraftLineItem {
  code?: string
  description: string
  quantity: number
  unitPrice?: number
  category?: string
  brand?: string
  subcategory?: string
}

export interface AILaborItem {
  description: string
  cost: number
}

export interface AIDraftPatch {
  subject?: string
  issueDate?: string
  validUntil?: string
  paymentCondition?: string
  notes?: string
  termsAndConditions?: string
  discountMode?: DiscountMode
  discountValue?: number
  clientInfo?: Partial<ClientInfo>
  equipmentItems?: AIDraftLineItem[]
  materialItems?: AIDraftLineItem[]
  laborItems?: AILaborItem[]
}

export interface AISuggestedItem extends AIDraftLineItem {
  reason: string
}

export interface AIDraftResponse {
  draftPatch: AIDraftPatch
  suggestedItemsOutsideCatalog: AISuggestedItem[]
  warnings: string[]
  confidence: number
  metadata: AIGenerationMetadata
}

export interface AIDraftRequest {
  message: string
  currentDraft: Partial<{
    subject: string
    issueDate: string
    validUntil: string
    paymentCondition: string
    notes: string
    termsAndConditions: string
    companyFormat: "sa" | "llc"
    type: string
    clientInfo: Partial<ClientInfo>
  }>
  catalog: Array<{
    code: string
    description: string
    unitPrice: number
    category: string
    brand?: string
    subcategory?: string
  }>
  companyFormat: "sa" | "llc"
  quotationType: "proyecto" | "servicio" | "mantenimiento"
  language?: "es" | "en"
}

const aiClientInfoSchema = z.object({
  name: z.string().optional(),
  attention: z.string().optional(),
  email: z.string().optional(),
  rif: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  customerId: z.string().optional(),
  billToName: z.string().optional(),
  billToAttention: z.string().optional(),
  billToEmail: z.string().optional(),
  billToPhone: z.string().optional(),
  billToAddress: z.string().optional(),
  shipToName: z.string().optional(),
  shipToAttention: z.string().optional(),
  shipToEmail: z.string().optional(),
  shipToPhone: z.string().optional(),
  shipToAddress: z.string().optional(),
})

export const aiDraftLineItemSchema = z.object({
  code: z.string().optional(),
  description: z.string().min(1),
  quantity: z.coerce.number().min(0.0001),
  unitPrice: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  subcategory: z.string().optional(),
})

export const aiLaborItemSchema = z.object({
  description: z.string().min(1),
  cost: z.coerce.number().min(0),
})

export const aiDraftPatchSchema = z.object({
  subject: z.string().optional(),
  issueDate: z.string().optional(),
  validUntil: z.string().optional(),
  paymentCondition: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  discountMode: z.enum(["amount", "percentage"]).optional(),
  discountValue: z.coerce.number().min(0).optional(),
  clientInfo: aiClientInfoSchema.optional(),
  equipmentItems: z.array(aiDraftLineItemSchema).optional(),
  materialItems: z.array(aiDraftLineItemSchema).optional(),
  laborItems: z.array(aiLaborItemSchema).optional(),
})

export const aiSuggestedItemSchema = aiDraftLineItemSchema.extend({
  reason: z.string().min(1),
})

export const aiDraftResponseSchema = z.object({
  draftPatch: aiDraftPatchSchema,
  suggestedItemsOutsideCatalog: z.array(aiSuggestedItemSchema).default([]),
  warnings: z.array(z.string()).default([]),
  confidence: z.coerce.number().min(0).max(1).default(0.6),
})

export const aiDraftRequestSchema = z.object({
  message: z.string().min(5).max(4000),
  currentDraft: z.object({
    subject: z.string().optional(),
    issueDate: z.string().optional(),
    validUntil: z.string().optional(),
    paymentCondition: z.string().optional(),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    companyFormat: z.enum(["sa", "llc"]).optional(),
    type: z.string().optional(),
    clientInfo: aiClientInfoSchema.partial().optional(),
  }).default({}),
  catalog: z.array(z.object({
    code: z.string().optional().default(""),
    description: z.string().optional().default(""),
    unitPrice: z.coerce.number().min(0).optional().default(0),
    category: z.string().optional().default("General"),
    brand: z.string().optional(),
    subcategory: z.string().optional(),
  })).max(60000),
  companyFormat: z.enum(["sa", "llc"]),
  quotationType: z.enum(["proyecto", "servicio", "mantenimiento"]),
  language: z.enum(["es", "en"]).optional(),
})

export type AIDraftResponseWithoutMeta = z.infer<typeof aiDraftResponseSchema>
