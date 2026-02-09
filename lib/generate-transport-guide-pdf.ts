"use client"

import { downloadHtmlAsPdf } from "./download-html-pdf"
import type { TransportGuideData } from "./transport-guide-types"

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

function formatLongDate(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const [year, month, day] = dateStr.split("-").map(Number)
    return `Caracas, ${day} de ${MONTHS[month - 1]} de ${year}`
  } catch {
    return dateStr
  }
}

function escapeHtml(value: string): string {
  return (value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function applyBodyTokens(data: TransportGuideData): string {
  return (data.bodyText || "")
    .replaceAll("[NOMBRE AUTORIZADO]", data.authorizedName || "[NOMBRE AUTORIZADO]")
    .replaceAll("[CI]", data.authorizedIdentification || "[CI]")
    .replaceAll("[VEHICULO]", data.vehicleDescription || "[VEHICULO]")
    .replaceAll("[ORIGEN]", data.origin || "[ORIGEN]")
    .replaceAll("[DESTINO]", data.destination || "[DESTINO]")
}

function formatBody(body: string): string {
  return escapeHtml(body)
    .split("\n")
    .map((line) => `<p style=\"margin:0 0 10px 0;\">${line || "&nbsp;"}</p>`)
    .join("")
}

export function generateTransportGuidePDFContent(data: TransportGuideData): string {
  const rows = data.items
    .filter((item) => item.description.trim() && item.quantity > 0)
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;font-size:11px;color:#0f172a;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#334155;">${escapeHtml(item.description)}</td>
      </tr>`,
    )
    .join("")

  const mergedBody = applyBodyTokens(data)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Guia de Transporte ${escapeHtml(data.code)}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet { width: 100%; }
    .header { background: linear-gradient(135deg,#0a1628 0%,#1a3a6b 100%); border-radius: 10px; padding: 14px 16px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
    .brand { display: flex; align-items: center; gap: 10px; justify-self: start; }
    .logo { width: 44px; height: 44px; border-radius: 9px; background: rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; }
    .logo img { width: 30px; height: 30px; object-fit: contain; }
    .brand-name { color: #fff; font-size: 16px; font-weight: 800; letter-spacing: 1px; }
    .brand-sub { color: #9db7da; font-size: 9px; margin-top: 2px; }
    .doc-center { text-align: center; justify-self: center; }
    .doc-main { color: #fff; font-size: 22px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; }
    .doc-main-sub { color: #bfd0e6; font-size: 10px; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.6px; }
    .doc-box { justify-self: end; text-align: right; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 7px 10px; background: rgba(255,255,255,0.08); min-width: 160px; }
    .doc-title { color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .doc-code { color: #fff; font-size: 15px; font-weight: 800; margin-top: 2px; }
    .meta { margin-top: 10px; border: 1px solid #d4deee; border-radius: 10px; background: #f8fbff; padding: 10px 12px; }
    .meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 6px; }
    .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.4px; }
    .value { font-size: 12px; color: #0f172a; font-weight: 600; margin-left: 6px; }
    .letter { margin-top: 12px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #fff; font-size: 12px; color: #1f2937; line-height: 1.65; text-align: justify; }
    .items-wrap { margin-top: 12px; border: 1px solid #d4deee; border-radius: 10px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #0a1628; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; padding: 9px 10px; text-align: left; }
    .notes { margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; padding: 8px 10px; }
    .notes-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .notes-text { margin-top: 4px; font-size: 11px; color: #334155; }
    .signature { margin-top: 16px; }
    .signature-line { width: 280px; border-top: 1px solid #64748b; margin-top: 35px; }
    .signature-name { font-weight: 700; font-size: 11px; margin-top: 4px; }
    .signature-info { font-size: 11px; color: #334155; }
    .contact-card { margin-top: 10px; border: 1px solid #dbe3f0; border-radius: 8px; background: #f8fbff; padding: 8px 10px; max-width: 520px; }
    .contact-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #1a5276; }
    .contact-text { margin-top: 2px; font-size: 11px; color: #334155; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="brand">
        <div class="logo"><img src="/cops-logo.png" alt="COPS" /></div>
        <div>
          <div class="brand-name">COP'S ELECTRONICS, S.A.</div>
          <div class="brand-sub">SOLUCIONES TECNOLOGICAS INTEGRALES</div>
        </div>
      </div>
      <div class="doc-center">
        <div class="doc-main">GUIA DE TRANSPORTE</div>
        <div class="doc-main-sub">DOCUMENTO OFICIAL DE MOVILIZACION</div>
      </div>
      <div class="doc-box">
        <div class="doc-title">Codigo</div>
        <div class="doc-code">${escapeHtml(data.code)}</div>
      </div>
    </div>

    <div class="meta">
      <div class="meta-row">
        <div><span class="label">Fecha:</span><span class="value">${escapeHtml(formatLongDate(data.issueDate))}</span></div>
        <div><span class="label">Autorizado:</span><span class="value">${escapeHtml(data.authorizedName)}</span></div>
      </div>
      <div class="meta-row">
        <div><span class="label">Dirigido a:</span><span class="value">${escapeHtml(data.recipient)}</span></div>
        <div><span class="label">C.I:</span><span class="value">${escapeHtml(data.authorizedIdentification)}</span></div>
      </div>
    </div>

    <div class="letter">${formatBody(mergedBody)}</div>

    <div class="items-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:20%;text-align:center;">Cantidad</th>
            <th>Productos / Equipos a transportar</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:11px;">-</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-size:11px;">Sin items registrados.</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="notes">
      <div class="notes-label">Observaciones Adicionales</div>
      <div class="notes-text">${escapeHtml(data.extraNotes || "-")}</div>
    </div>

    <div class="signature">
      <div class="signature-line"></div>
      <div class="signature-name">${escapeHtml(data.signName)}</div>
      <div class="signature-info">C.I. ${escapeHtml(data.signIdentification)}</div>
      <div class="signature-info">${escapeHtml(data.signTitle)}</div>
      <div class="contact-card">
        <div class="contact-title">Contacto para Verificacion</div>
        <div class="contact-text">${escapeHtml(data.contacts)}</div>
      </div>
    </div>
  </div>
</body>
</html>`
}

export async function downloadTransportGuidePDF(data: TransportGuideData) {
  const htmlContent = generateTransportGuidePDFContent(data)
  const safeCode = (data.code || "guia-transporte").replace(/[\\/:*?"<>|]/g, "-")

  await downloadHtmlAsPdf({
    htmlContent,
    fileName: `${safeCode}.pdf`,
  })
}

