"use client"

import type { DeliveryNoteData } from "./delivery-note-types"
import { downloadHtmlAsPdf } from "./download-html-pdf"

function formatDate(dateStr: string): string {
  if (!dateStr) return ""

  try {
    const [year, month, day] = dateStr.split("-")
    return `${day}.${month}.${year}`
  } catch {
    return dateStr
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function normalizeText(value: string): string {
  return escapeHtml(value || "")
}

function renderItemRows(data: DeliveryNoteData): string {
  const sanitized = data.items
    .filter((item) => item.description.trim() || item.code.trim() || item.quantity > 0)
    .map((item) => ({
      code: normalizeText(item.code || "S/N"),
      description: normalizeText(item.description),
      quantity: item.quantity > 0 ? String(item.quantity) : "",
    }))

  const minRows = 12
  const rows = sanitized.length >= minRows ? sanitized : [...sanitized, ...Array.from({ length: minRows - sanitized.length }, () => ({ code: "", description: "", quantity: "" }))]

  return rows
    .map(
      (row) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;text-align:center;font-size:11px;height:32px;color:#0f172a;">${row.code}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;font-size:11px;height:32px;color:#334155;">${row.description}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:11px;height:32px;color:#0f172a;font-weight:600;">${row.quantity}</td>
      </tr>`,
    )
    .join("")
}

export function generateDeliveryNotePDFContent(data: DeliveryNoteData): string {
  const htmlRows = renderItemRows(data)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Nota de Entrega ${normalizeText(data.code)}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet { width: 100%; }
    .header {
      background: linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%);
      border-radius: 10px;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .brand-wrap { display: flex; align-items: center; gap: 12px; }
    .logo-wrap {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-wrap img { width: 34px; height: 34px; object-fit: contain; }
    .brand-name { color: #fff; font-size: 17px; font-weight: 800; letter-spacing: 1.2px; }
    .brand-subtitle { color: #9db7da; font-size: 9px; margin-top: 3px; letter-spacing: 0.8px; }
    .doc-box {
      text-align: right;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 8px 12px;
      min-width: 180px;
    }
    .doc-title { margin: 0; color: #fff; font-size: 11px; letter-spacing: 0.8px; font-weight: 700; text-transform: uppercase; }
    .doc-code { color: #fff; font-size: 16px; margin-top: 2px; font-weight: 800; }
    .meta {
      border: 1px solid #d4deee;
      border-radius: 10px;
      background: #f8fbff;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .meta-row { display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px; margin-bottom: 8px; font-size: 12px; }
    .meta-left, .meta-right { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
    .label { font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; font-size: 10px; }
    .value { font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #0f172a; }
    .value.normal { font-weight: 500; }
    table { width: 100%; border-collapse: collapse; }
    .items-wrap { border: 1px solid #d4deee; border-radius: 10px; overflow: hidden; }
    thead th {
      background: #0a1628;
      color: #fff;
      border-right: 1px solid #1f3558;
      padding: 10px;
      font-size: 10px;
      text-align: center;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    thead th:last-child { border-right: 0; }
    .footer-block {
      margin-top: 12px;
      border: 1px solid #d4deee;
      border-radius: 10px;
      padding: 12px;
      background: #ffffff;
    }
    .footer-title {
      font-size: 10px;
      font-weight: 700;
      color: #1a5276;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 8px;
    }
    .line-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
    .line-item {
      font-size: 11px;
      color: #334155;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      min-height: 20px;
    }
    .line-item strong { font-weight: 700; color: #0f172a; }
    .company-sign { text-align: right; margin-top: 10px; font-size: 11px; color: #1a5276; font-weight: 700; }
    .notes {
      margin-top: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      background: #f8fafc;
    }
    .notes-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
    .notes-text { font-size: 11px; color: #334155; min-height: 22px; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="brand-wrap">
        <div class="logo-wrap">
          <img src="/cops-logo.png" alt="COPS" />
        </div>
        <div>
          <div class="brand-name">COP'S ELECTRONICS, S.A.</div>
          <div class="brand-subtitle">SOLUCIONES TECNOLOGICAS INTEGRALES</div>
        </div>
      </div>
      <div class="doc-box">
        <h1 class="doc-title">Nota de Entrega</h1>
        <div class="doc-code">${normalizeText(data.code)}</div>
      </div>
    </div>

    <div class="meta">
      <div class="meta-row">
        <div class="meta-left"><span class="label">ATENCION:</span><span class="value">${normalizeText(data.attention)}</span></div>
        <div class="meta-right"><span class="label">FECHA:</span><span class="value normal">${formatDate(data.issueDate)}</span></div>
      </div>
      <div class="meta-row" style="grid-template-columns: 1fr;">
        <div class="meta-left"><span class="label">CLIENTE:</span><span class="value">${normalizeText(data.clientName)}</span></div>
      </div>
      <div class="meta-row" style="grid-template-columns: 1fr; margin-bottom: 2px;">
        <div class="meta-left"><span class="label">C.I:</span><span class="value normal">${normalizeText(data.clientIdentification)}</span></div>
      </div>
    </div>

    <div class="items-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 24%;">CÓDIGO/MODELO</th>
            <th style="width: 61%;">DESCRIPCIÓN</th>
            <th style="width: 15%;">CANTIDAD</th>
          </tr>
        </thead>
        <tbody>
          ${htmlRows}
        </tbody>
      </table>
    </div>

    <div class="notes">
      <div class="notes-label">Observaciones</div>
      <div class="notes-text">${normalizeText(data.notes || "-")}</div>
    </div>

    <div class="footer-block">
      <div class="footer-title">Recibe</div>
      <div class="line-row">
        <div class="line-item">NOMBRE Y APELLIDO: ${normalizeText(data.receiverName)}</div>
        <div class="line-item"><strong>Entrega:</strong> ${normalizeText(data.deliveredBy)}</div>
      </div>
      <div class="line-row">
        <div class="line-item">FIRMA: _______________________________</div>
        <div class="line-item"><strong>C.I:</strong> ${normalizeText(data.receiverIdentification)}</div>
      </div>
      <div class="company-sign">Cop's Electronics, S.A</div>
    </div>
  </div>
</body>
</html>`
}

export async function downloadDeliveryNotePDF(data: DeliveryNoteData) {
  const htmlContent = generateDeliveryNotePDFContent(data)
  const safeCode = (data.code || "nota-entrega").replace(/[\\/:*?"<>|]/g, "-")
  await downloadHtmlAsPdf({
    htmlContent,
    fileName: `${safeCode}.pdf`,
  })
}

