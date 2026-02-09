"use client"

import type { DeliveryNoteData } from "./delivery-note-types"

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

  const minRows = 10
  const rows = sanitized.length >= minRows ? sanitized : [...sanitized, ...Array.from({ length: minRows - sanitized.length }, () => ({ code: "", description: "", quantity: "" }))]

  return rows
    .map(
      (row) => `
      <tr>
        <td style="padding:7px 8px;border:2px solid #000;text-align:center;font-size:13px;height:32px;">${row.code}</td>
        <td style="padding:7px 8px;border:2px solid #000;font-size:13px;height:32px;">${row.description}</td>
        <td style="padding:7px 8px;border:2px solid #000;text-align:center;font-size:13px;height:32px;">${row.quantity}</td>
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
    @page { size: A4; margin: 11mm 10mm 11mm 10mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: Cambria, Georgia, "Times New Roman", serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet { width: 100%; }
    .header { border: 2px solid #000; border-bottom: 0; display: grid; grid-template-columns: 1fr 1.2fr; min-height: 92px; }
    .logo-wrap { border-right: 2px solid #000; display: flex; align-items: center; justify-content: center; padding: 10px; }
    .logo-wrap img { width: 118px; height: 74px; object-fit: contain; }
    .title-wrap { display: flex; flex-direction: column; justify-content: center; align-items: center; background: #4f81bd; color: #fff; text-align: center; }
    .title-wrap h1 { margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: 700; }
    .title-wrap .code { margin-top: 6px; font-size: 14px; font-weight: 700; }
    .meta { border: 2px solid #000; border-bottom: 0; padding: 10px 10px 6px 10px; }
    .meta-row { display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px; margin-bottom: 8px; font-size: 20px; }
    .meta-left, .meta-right { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
    .label { font-weight: 400; }
    .value { font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .value.normal { font-weight: 400; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #4f81bd; color: #fff; border: 2px solid #000; padding: 8px; font-size: 15px; text-align: center; }
    .footer-block { margin-top: 14px; font-size: 22px; }
    .line-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
    .line-item { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .line-item strong { font-weight: 700; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="logo-wrap">
        <img src="/cops-logo.png" alt="COPS" />
      </div>
      <div class="title-wrap">
        <h1>NOTA DE ENTREGA</h1>
        <div class="code">${normalizeText(data.code)}</div>
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

    <div class="footer-block">
      <div><strong>RECIBE:</strong></div>
      <div class="line-row">
        <div class="line-item">NOMBRE Y APELLIDO: ${normalizeText(data.receiverName)}</div>
        <div class="line-item"><strong>Entrega:</strong> ${normalizeText(data.deliveredBy)}</div>
      </div>
      <div class="line-row">
        <div class="line-item">FIRMA: _______________________________</div>
        <div class="line-item"><strong>C.I:</strong> ${normalizeText(data.receiverIdentification)}</div>
      </div>
      <div class="line-row" style="grid-template-columns: 1fr; margin-top: 6px;">
        <div class="line-item" style="text-align: right;"><strong>Cop's Electronics, S.A</strong></div>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function downloadDeliveryNotePDF(data: DeliveryNoteData) {
  const htmlContent = generateDeliveryNotePDFContent(data)
  const printWindow = window.open("", "_blank")

  if (!printWindow) return

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

