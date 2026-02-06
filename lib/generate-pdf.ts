"use client"

import type { QuotationData } from "./quotation-types"
import { formatCurrency } from "./quotation-types"

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}

function formatDateUS(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const [year, month, day] = dateStr.split("-")
    return `${month}/${day}/${year}`
  } catch {
    return dateStr
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "proyecto": return "PROYECTO"
    case "servicio": return "SERVICIO"
    case "mantenimiento": return "MANTENIMIENTO PREVENTIVO"
    default: return type.toUpperCase()
  }
}

function generateSAPDFContent(data: QuotationData): string {
  const renderItemRows = (items: QuotationData["items"]) =>
    items.map((item) => `
      <tr>
        <td style="padding:8px 6px;text-align:center;border-bottom:1px solid #e2e8f0;font-size:11px;color:#1e293b;">${item.quantity}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;font-family:'Courier New',monospace;color:#1a5276;font-weight:600;">${item.code}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#334155;line-height:1.5;">${item.description}</td>
        <td style="padding:8px 6px;text-align:right;border-bottom:1px solid #e2e8f0;font-size:11px;color:#1e293b;">$${formatCurrency(item.unitPrice)}</td>
        <td style="padding:8px 6px;text-align:right;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:600;color:#1e293b;">$${formatCurrency(item.totalPrice)}</td>
      </tr>`
    ).join("")

  const laborRows = data.laborItems
    .filter((l) => l.cost > 0 || l.description)
    .map((l) => `
      <tr>
        <td style="padding:8px 6px;text-align:center;border-bottom:1px solid #e2e8f0;font-size:11px;color:#1e293b;">1</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;font-family:'Courier New',monospace;color:#1a5276;font-weight:600;">MANO-OBRA</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#334155;line-height:1.5;">${l.description || "Mano de obra"}</td>
        <td style="padding:8px 6px;text-align:right;border-bottom:1px solid #e2e8f0;font-size:11px;color:#1e293b;">$${formatCurrency(l.cost)}</td>
        <td style="padding:8px 6px;text-align:right;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:600;color:#1e293b;">$${formatCurrency(l.cost)}</td>
      </tr>`)
    .join("")

  const termsLines = data.termsAndConditions
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => `<li style="margin-bottom:3px;color:#475569;font-size:9px;line-height:1.5;">${line.replace(/^\d+\.\s*/, "")}</li>`)
    .join("")

  const baseImponible = data.subtotalEquipment + data.subtotalMaterials + data.subtotalLabor

  const hasEquipment = data.items.length > 0
  const hasMaterials = data.materials.length > 0
  const hasLabor = data.laborItems.length > 0

  const equipmentSection = hasEquipment ? `
    <div style="padding:0 40px;margin-bottom:4px;">
      <div style="background:#f0f4f8;padding:6px 10px;border-radius:4px;font-size:10px;font-weight:700;color:#1a5276;text-transform:uppercase;letter-spacing:0.5px;">Equipos y Servicios</div>
    </div>
    <div style="padding:0 40px;margin-bottom:12px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#0a1628;">
          <th style="padding:8px 6px;text-align:center;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:50px;border-radius:4px 0 0 0;">Cant.</th>
          <th style="padding:8px 6px;text-align:left;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:120px;">Codigo</th>
          <th style="padding:8px 6px;text-align:left;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">Descripcion</th>
          <th style="padding:8px 6px;text-align:right;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:90px;">P. Unit.</th>
          <th style="padding:8px 6px;text-align:right;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:90px;border-radius:0 4px 0 0;">P. Total</th>
        </tr></thead>
        <tbody>${renderItemRows(data.items)}</tbody>
      </table>
    </div>` : ""

  const materialsSection = hasMaterials ? `
    <div style="padding:0 40px;margin-bottom:4px;">
      <div style="background:#f0f4f8;padding:6px 10px;border-radius:4px;font-size:10px;font-weight:700;color:#1a5276;text-transform:uppercase;letter-spacing:0.5px;">Materiales e Insumos</div>
    </div>
    <div style="padding:0 40px;margin-bottom:12px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#0a1628;">
          <th style="padding:8px 6px;text-align:center;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:50px;border-radius:4px 0 0 0;">Cant.</th>
          <th style="padding:8px 6px;text-align:left;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:120px;">Codigo</th>
          <th style="padding:8px 6px;text-align:left;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">Descripcion</th>
          <th style="padding:8px 6px;text-align:right;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:90px;">P. Unit.</th>
          <th style="padding:8px 6px;text-align:right;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:90px;border-radius:0 4px 0 0;">P. Total</th>
        </tr></thead>
        <tbody>${renderItemRows(data.materials)}</tbody>
      </table>
    </div>` : ""

  const laborSection = hasLabor ? `
    <div style="padding:0 40px;margin-bottom:4px;">
      <div style="background:#f0f4f8;padding:6px 10px;border-radius:4px;font-size:10px;font-weight:700;color:#1a5276;text-transform:uppercase;letter-spacing:0.5px;">Mano de Obra</div>
    </div>
    <div style="padding:0 40px;margin-bottom:12px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#0a1628;">
          <th style="padding:8px 6px;text-align:center;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:50px;border-radius:4px 0 0 0;">Cant.</th>
          <th style="padding:8px 6px;text-align:left;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:120px;">Codigo</th>
          <th style="padding:8px 6px;text-align:left;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">Descripcion</th>
          <th style="padding:8px 6px;text-align:right;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:90px;">P. Unit.</th>
          <th style="padding:8px 6px;text-align:right;font-size:9px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:90px;border-radius:0 4px 0 0;">P. Total</th>
        </tr></thead>
        <tbody>${laborRows}</tbody>
      </table>
    </div>` : ""

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cotizacion ${data.code} - Cop's Electronics</title>
  <style>
    @page { size: letter; margin: 0; }
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 100%; min-height: 100vh; position: relative; }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0a1628 0%,#1a3a6b 100%);padding:28px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;">
        <img src="/cops-logo.png" alt="COPS Electronics" style="width:34px;height:34px;object-fit:contain;" />
      </div>
      <div>
        <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:2px;">COP'S ELECTRONICS, S.A.</div>
        <div style="font-size:10px;color:#7a9cc7;margin-top:3px;letter-spacing:1px;">SOLUCIONES TECNOLOGICAS INTEGRALES</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="background:rgba(255,255,255,0.08);border-radius:6px;padding:10px 18px;border:1px solid rgba(255,255,255,0.12);">
        <div style="font-size:9px;color:#7a9cc7;text-transform:uppercase;letter-spacing:1px;">Cotizacion</div>
        <div style="font-size:16px;font-weight:700;color:#ffffff;margin-top:2px;">${data.code}</div>
        <div style="font-size:8px;color:#5b9aff;margin-top:2px;">${getTypeLabel(data.type)}</div>
      </div>
    </div>
  </div>

  <!-- Client Info -->
  <div style="padding:16px 40px;display:flex;gap:0;">
    <div style="flex:1;border-bottom:1px solid #e2e8f0;padding-bottom:10px;">
      <table style="border-collapse:collapse;">
        <tr><td style="font-size:9px;color:#64748b;text-transform:uppercase;padding:3px 8px 3px 0;width:70px;">Cliente:</td><td style="font-size:11px;font-weight:600;color:#1e293b;padding:3px 0;">${data.clientInfo.name}</td></tr>
        <tr><td style="font-size:9px;color:#64748b;text-transform:uppercase;padding:3px 8px 3px 0;">Atencion:</td><td style="font-size:11px;color:#1e293b;padding:3px 0;">${data.clientInfo.attention}</td></tr>
        <tr><td style="font-size:9px;color:#64748b;text-transform:uppercase;padding:3px 8px 3px 0;">RIF:</td><td style="font-size:11px;color:#1e293b;padding:3px 0;">${data.clientInfo.rif}</td></tr>
        <tr><td style="font-size:9px;color:#64748b;text-transform:uppercase;padding:3px 8px 3px 0;">Email:</td><td style="font-size:11px;color:#1a5276;padding:3px 0;">${data.clientInfo.email}</td></tr>
      </table>
    </div>
    <div style="flex:1;border-bottom:1px solid #e2e8f0;padding-bottom:10px;text-align:right;">
      <table style="border-collapse:collapse;margin-left:auto;">
        <tr><td style="font-size:9px;color:#64748b;text-transform:uppercase;padding:3px 0;text-align:right;">Fecha:</td><td style="font-size:11px;font-weight:600;color:#1e293b;padding:3px 0 3px 8px;text-align:right;">${formatDate(data.issueDate)}</td></tr>
        <tr><td style="font-size:9px;color:#64748b;text-transform:uppercase;padding:3px 0;text-align:right;">Valido:</td><td style="font-size:11px;color:#1e293b;padding:3px 0 3px 8px;text-align:right;">${formatDate(data.validUntil)}</td></tr>
        <tr><td style="font-size:9px;color:#64748b;text-transform:uppercase;padding:3px 0;text-align:right;">Telefono:</td><td style="font-size:11px;color:#1e293b;padding:3px 0 3px 8px;text-align:right;">${data.clientInfo.phone}</td></tr>
        <tr><td style="font-size:9px;color:#64748b;text-transform:uppercase;padding:3px 0;text-align:right;">Agencia:</td><td style="font-size:11px;color:#1e293b;padding:3px 0 3px 8px;text-align:right;">${data.clientInfo.address}</td></tr>
      </table>
    </div>
  </div>

  <!-- Subject -->
  ${data.subject ? `<div style="padding:0 40px;margin-bottom:14px;">
    <div style="background:#f0f6ff;border-left:3px solid #1a5276;padding:8px 12px;border-radius:0 6px 6px 0;">
      <span style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Partida: </span>
      <span style="font-size:12px;font-weight:700;color:#1a5276;">${data.subject}</span>
    </div>
  </div>` : ""}

  ${equipmentSection}
  ${materialsSection}
  ${laborSection}

  <!-- Totals -->
  <div style="padding:16px 40px;">
    <div style="display:flex;justify-content:flex-end;">
      <table style="border-collapse:collapse;width:260px;">
        ${hasEquipment ? `<tr><td style="padding:6px 10px;font-size:10px;color:#64748b;">Equipos y Servicios</td><td style="padding:6px 10px;text-align:right;font-size:11px;color:#1e293b;">$${formatCurrency(data.subtotalEquipment)}</td></tr>` : ""}
        ${hasMaterials ? `<tr><td style="padding:6px 10px;font-size:10px;color:#64748b;">Materiales</td><td style="padding:6px 10px;text-align:right;font-size:11px;color:#1e293b;">$${formatCurrency(data.subtotalMaterials)}</td></tr>` : ""}
        ${hasLabor ? `<tr><td style="padding:6px 10px;font-size:10px;color:#64748b;">Mano de Obra</td><td style="padding:6px 10px;text-align:right;font-size:11px;color:#1e293b;">$${formatCurrency(data.subtotalLabor)}</td></tr>` : ""}
        <tr><td style="padding:6px 10px;font-size:10px;color:#64748b;">SUB TOTAL</td><td style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;color:#1e293b;">$${formatCurrency(baseImponible)}</td></tr>
        <tr><td style="padding:6px 10px;font-size:10px;color:#64748b;">DESCUENTO</td><td style="padding:6px 10px;text-align:right;font-size:11px;color:#1e293b;">-$${formatCurrency(safeDiscount)}</td></tr>
        <tr><td style="padding:6px 10px;font-size:10px;color:#64748b;border-bottom:1px solid #e2e8f0;">IVA ${data.ivaRate}%</td><td style="padding:6px 10px;text-align:right;font-size:11px;color:#1e293b;border-bottom:1px solid #e2e8f0;">$${formatCurrency(data.ivaAmount)}</td></tr>
        <tr style="background:#0a1628;"><td style="padding:10px;font-size:11px;font-weight:700;color:#fff;border-radius:0 0 0 4px;">TOTAL USD</td><td style="padding:10px;text-align:right;font-size:14px;font-weight:800;color:#fff;border-radius:0 0 4px 0;">$${formatCurrency(data.total)}</td></tr>
      </table>
    </div>
  </div>

  <!-- Payment -->
  <div style="padding:0 40px;margin-bottom:12px;">
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;">
      <span style="font-size:9px;color:#92400e;text-transform:uppercase;font-weight:600;">Condiciones de Venta: </span>
      <span style="font-size:10px;color:#92400e;font-weight:700;">${data.paymentCondition}</span>
    </div>
  </div>

  ${data.notes ? `<div style="padding:0 40px;margin-bottom:10px;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;">
      <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;font-weight:600;">Notas:</div>
      <div style="font-size:10px;color:#475569;line-height:1.5;">${data.notes}</div>
    </div>
  </div>` : ""}

  ${data.termsAndConditions ? `<div style="padding:0 40px;margin-bottom:16px;">
    <div style="font-size:9px;color:#1a5276;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;font-weight:700;">Terminos y Condiciones</div>
    <ol style="margin:0;padding-left:14px;">${termsLines}</ol>
  </div>` : ""}

  <!-- Footer -->
  <div style="background:#f0f6ff;border-top:2px solid #1a5276;padding:12px 40px;text-align:center;">
    <div style="font-size:9px;color:#475569;line-height:1.5;">
      Si usted tiene alguna pregunta sobre esta cotizacion, por favor pongase en contacto con nosotros<br>
      <span style="font-weight:600;color:#1a5276;">Cop's Electronics S.A.</span> - Telefonos: 0212-7934136 / 7940316 - Email: proyectos@copselectronics.com
    </div>
  </div>
</div>
</body>
</html>`
}

function generateLLCPDFContent(data: QuotationData): string {
  const allItems = [
    ...data.items.map((item) => ({
      model: item.code || "ITEM",
      sku: item.code || "ITEM",
      description: item.description || "",
      qty: item.quantity,
      unitPrice: item.unitPrice,
      total: item.totalPrice,
    })),
    ...data.materials.map((item) => ({
      model: item.code || "ITEM",
      sku: item.code || "ITEM",
      description: item.description || "",
      qty: item.quantity,
      unitPrice: item.unitPrice,
      total: item.totalPrice,
    })),
    ...data.laborItems.map((item) => ({
      model: "LABOR",
      sku: "LABOR",
      description: item.description || "Labor",
      qty: 1,
      unitPrice: item.cost,
      total: item.cost,
    })),
  ]

  const billToName = data.clientInfo.billToName || data.clientInfo.name
  const billToAttention = data.clientInfo.billToAttention || data.clientInfo.attention
  const billToEmail = data.clientInfo.billToEmail || data.clientInfo.email
  const billToPhone = data.clientInfo.billToPhone || data.clientInfo.phone
  const billToAddress = data.clientInfo.billToAddress || data.clientInfo.address

  const shipToName = data.clientInfo.shipToName || data.clientInfo.name
  const shipToAttention = data.clientInfo.shipToAttention || data.clientInfo.attention
  const shipToEmail = data.clientInfo.shipToEmail || data.clientInfo.email
  const shipToPhone = data.clientInfo.shipToPhone || data.clientInfo.phone
  const shipToAddress = data.clientInfo.shipToAddress || data.clientInfo.address

  const rows = allItems.map((item) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#111827;">${item.model}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#111827;">${item.sku}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:10px;color:#111827;">${item.description}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:10px;text-align:center;color:#111827;">${item.qty}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:10px;text-align:right;color:#111827;">$${formatCurrency(item.unitPrice)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:10px;text-align:right;font-weight:600;color:#111827;">$${formatCurrency(item.total)}</td>
    </tr>
  `).join("")

  const baseImponible = data.subtotalEquipment + data.subtotalMaterials + data.subtotalLabor
  const safeDiscount = Math.min(Math.max(data.discountAmount || 0, 0), baseImponible)
  const safeDiscount = Math.min(Math.max(data.discountAmount || 0, 0), baseImponible)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quote ${data.code} - COPS Electronics LLC</title>
  <style>
    @page { size: letter; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: "Segoe UI", Arial, sans-serif; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 100%; position: relative; }
    table { width: 100%; border-collapse: collapse; }
  </style>
</head>
<body>
  <div class="page">
    <div style="padding:18px 24px 20px 24px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div style="display:flex;gap:12px;align-items:center;">
        <div style="width:56px;height:56px;border-radius:12px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;">
          <img src="/cops-logo.png" alt="COPS Electronics" style="width:44px;height:44px;object-fit:contain;" />
        </div>
        <div>
          <div style="font-size:16px;font-weight:800;letter-spacing:0.5px;">COPS ELECTRONICS LLC.</div>
          <div style="font-size:10px;color:#6b7280;margin-top:4px;">Doral, FL 33178</div>
          <div style="font-size:10px;color:#6b7280;">Phone: (305) 200-7352</div>
          <div style="font-size:10px;color:#2563eb;">www.copselectronics.com</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:22px;font-weight:800;letter-spacing:2px;">QUOTE</div>
        <table style="margin-top:10px;border-collapse:collapse;">
          <tr>
            <td style="font-size:9px;color:#6b7280;padding:3px 6px 3px 0;text-transform:uppercase;">Date</td>
            <td style="font-size:10px;font-weight:600;color:#111827;padding:3px 0 3px 8px;">${formatDateUS(data.issueDate)}</td>
          </tr>
          <tr>
            <td style="font-size:9px;color:#6b7280;padding:3px 6px 3px 0;text-transform:uppercase;">Customer ID</td>
            <td style="font-size:10px;font-weight:600;color:#111827;padding:3px 0 3px 8px;">${data.clientInfo.customerId || data.clientInfo.rif || data.code}</td>
          </tr>
          <tr>
            <td style="font-size:9px;color:#6b7280;padding:3px 6px 3px 0;text-transform:uppercase;">Terms</td>
            <td style="font-size:10px;font-weight:600;color:#111827;padding:3px 0 3px 8px;">${data.paymentCondition || "PP"}</td>
          </tr>
        </table>
      </div>
    </div>

    <div style="margin-top:18px;display:flex;gap:40px;">
      <div style="flex:1;">
        <div style="font-size:10px;font-weight:700;color:#111827;text-transform:uppercase;margin-bottom:6px;">Bill To:</div>
        <div style="font-size:11px;font-weight:600;">${billToName}</div>
        <div style="font-size:10px;color:#6b7280;">${billToAttention}</div>
        <div style="font-size:10px;color:#6b7280;">${billToAddress}</div>
        <div style="font-size:10px;color:#6b7280;">${billToEmail}</div>
        <div style="font-size:10px;color:#6b7280;">${billToPhone}</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:10px;font-weight:700;color:#111827;text-transform:uppercase;margin-bottom:6px;">Ship To:</div>
        <div style="font-size:11px;font-weight:600;">${shipToName}</div>
        <div style="font-size:10px;color:#6b7280;">${shipToAttention}</div>
        <div style="font-size:10px;color:#6b7280;">${shipToAddress}</div>
        <div style="font-size:10px;color:#6b7280;">${shipToEmail}</div>
        <div style="font-size:10px;color:#6b7280;">${shipToPhone}</div>
      </div>
    </div>

    <div style="margin-top:16px;border-top:1px solid #e5e7eb;padding-top:10px;">
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <colgroup>
          <col style="width:14%;">
          <col style="width:14%;">
          <col style="width:34%;">
          <col style="width:8%;">
          <col style="width:15%;">
          <col style="width:15%;">
        </colgroup>
        <thead>
          <tr style="background:#0f172a;">
            <th style="padding:6px 8px;text-align:left;font-size:9px;color:#fff;letter-spacing:0.5px;">MODELO</th>
            <th style="padding:6px 8px;text-align:left;font-size:9px;color:#fff;letter-spacing:0.5px;">SKU</th>
            <th style="padding:6px 8px;text-align:left;font-size:9px;color:#fff;letter-spacing:0.5px;">DESCRIPTION</th>
            <th style="padding:6px 8px;text-align:center;font-size:9px;color:#fff;letter-spacing:0.5px;">QTY</th>
            <th style="padding:6px 8px;text-align:right;font-size:9px;color:#fff;letter-spacing:0.5px;">UNIT PRICE</th>
            <th style="padding:6px 8px;text-align:right;font-size:9px;color:#fff;letter-spacing:0.5px;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div style="margin-top:16px;display:flex;justify-content:flex-end;">
      <table style="border-collapse:collapse;width:260px;">
        <tr>
          <td style="padding:6px 10px;font-size:10px;color:#6b7280;">SUB TOTAL</td>
          <td style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;color:#111827;">$${formatCurrency(baseImponible)}</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;font-size:10px;color:#6b7280;">DISCOUNT</td>
          <td style="padding:6px 10px;text-align:right;font-size:11px;color:#111827;">-$${formatCurrency(safeDiscount)}</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;font-size:10px;color:#6b7280;border-bottom:1px solid #e5e7eb;">TAX (${data.ivaRate}%)</td>
          <td style="padding:6px 10px;text-align:right;font-size:11px;color:#111827;border-bottom:1px solid #e5e7eb;">$${formatCurrency(data.ivaAmount)}</td>
        </tr>
        <tr style="background:#0f172a;">
          <td style="padding:10px;font-size:11px;font-weight:700;color:#fff;">TOTAL</td>
          <td style="padding:10px;text-align:right;font-size:13px;font-weight:800;color:#fff;">$${formatCurrency(data.total)}</td>
        </tr>
      </table>
    </div>

    <div style="margin-top:16px;display:flex;gap:24px;">
      <div style="flex:1;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:6px;">SPECIAL INSTRUCTION</div>
        <div style="font-size:10px;color:#6b7280;line-height:1.5;border:1px solid #e5e7eb;border-radius:6px;padding:8px;">${data.notes || "-"}</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:6px;">COPS ELECTRONICS LLC.</div>
        <div style="font-size:10px;color:#6b7280;line-height:1.6;">
          Chase Bank 10795 NW 58 th st. Doral, FL, 33178<br/>
          Account number: 296838235 &nbsp;&nbsp; ABA: 021000021<br/>
          Zelle: ventas@copselectronics.com
        </div>
      </div>
    </div>
    </div>
  </div>
</body>
</html>`
}

export function generatePDFContent(data: QuotationData): string {
  if (data.companyFormat === "llc") {
    return generateLLCPDFContent(data)
  }
  return generateSAPDFContent(data)
}

export function downloadPDF(data: QuotationData) {
  const htmlContent = generatePDFContent(data)
  const printWindow = window.open("", "_blank")
  if (!printWindow) return
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.onload = () => {
    setTimeout(() => { printWindow.print() }, 500)
  }
}
