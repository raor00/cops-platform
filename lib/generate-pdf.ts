import type { QuotationData } from "./quotation-types"
import { formatCurrency } from "./quotation-types"

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const [year, month, day] = dateStr.split("-")
  return `${day}/${month}/${year}`
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "proyecto":
      return "PROYECTO"
    case "servicio":
      return "SERVICIO"
    case "mantenimiento":
      return "MANTENIMIENTO PREVENTIVO"
    default:
      return type.toUpperCase()
  }
}

export function generatePDFContent(data: QuotationData): string {
  const itemsRows = data.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:10px 8px;text-align:center;border-bottom:1px solid #e2e8f0;font-size:12px;color:#1e293b;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:11px;font-family:'Courier New',monospace;color:#1a5276;font-weight:600;">${item.code}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#334155;line-height:1.5;">${item.description}</td>
        <td style="padding:10px 8px;text-align:right;border-bottom:1px solid #e2e8f0;font-size:12px;color:#1e293b;">$${formatCurrency(item.unitPrice)}</td>
        <td style="padding:10px 8px;text-align:right;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:600;color:#1e293b;">$${formatCurrency(item.totalPrice)}</td>
      </tr>`
    )
    .join("")

  const laborRow =
    data.laborCost > 0
      ? `<tr>
          <td style="padding:10px 8px;text-align:center;border-bottom:1px solid #e2e8f0;font-size:12px;color:#1e293b;">1</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:11px;font-family:'Courier New',monospace;color:#1a5276;font-weight:600;">MANO-OBRA</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#334155;line-height:1.5;">${data.laborDescription || "Mano de obra, instalacion, configuracion y puesta en marcha"}</td>
          <td style="padding:10px 8px;text-align:right;border-bottom:1px solid #e2e8f0;font-size:12px;color:#1e293b;">$${formatCurrency(data.laborCost)}</td>
          <td style="padding:10px 8px;text-align:right;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:600;color:#1e293b;">$${formatCurrency(data.laborCost)}</td>
        </tr>`
      : ""

  const termsLines = data.termsAndConditions
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => `<li style="margin-bottom:4px;color:#475569;font-size:10px;line-height:1.5;">${line.replace(/^\d+\.\s*/, "")}</li>`)
    .join("")

  const baseImponible = data.subtotal + data.laborCost

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cotizacion ${data.code} - Cop's Electronics</title>
  <style>
    @page { 
      size: letter; 
      margin: 0; 
    }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 100%;
      min-height: 100vh;
      position: relative;
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0a1628 0%,#1a3a6b 100%);padding:30px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:2px;">COP'S ELECTRONICS, S.A.</div>
      <div style="font-size:11px;color:#7a9cc7;margin-top:4px;letter-spacing:1px;">SOLUCIONES TECNOLOGICAS INTEGRALES</div>
    </div>
    <div style="text-align:right;">
      <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:12px 20px;border:1px solid rgba(255,255,255,0.15);">
        <div style="font-size:10px;color:#7a9cc7;text-transform:uppercase;letter-spacing:1px;">Cotizacion</div>
        <div style="font-size:18px;font-weight:700;color:#ffffff;margin-top:2px;">${data.code}</div>
        <div style="font-size:9px;color:#5b9aff;margin-top:2px;">${getTypeLabel(data.type)}</div>
      </div>
    </div>
  </div>

  <!-- Client Info Grid -->
  <div style="padding:20px 40px;display:grid;grid-template-columns:1fr 1fr;gap:0;">
    <div style="border-bottom:1px solid #e2e8f0;padding:10px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;width:100px;">Cliente:</td>
          <td style="font-size:12px;font-weight:600;color:#1e293b;padding:4px 0;">${data.clientInfo.name}</td>
        </tr>
        <tr>
          <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;">Atencion:</td>
          <td style="font-size:12px;color:#1e293b;padding:4px 0;">${data.clientInfo.attention}</td>
        </tr>
        <tr>
          <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;">RIF:</td>
          <td style="font-size:12px;color:#1e293b;padding:4px 0;">${data.clientInfo.rif}</td>
        </tr>
        <tr>
          <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;">Email:</td>
          <td style="font-size:12px;color:#1a5276;padding:4px 0;">${data.clientInfo.email}</td>
        </tr>
      </table>
    </div>
    <div style="border-bottom:1px solid #e2e8f0;padding:10px 0;text-align:right;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;text-align:right;">Fecha Emision:</td>
          <td style="font-size:12px;font-weight:600;color:#1e293b;padding:4px 0;text-align:right;width:120px;">${formatDate(data.issueDate)}</td>
        </tr>
        <tr>
          <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;text-align:right;">Valido Hasta:</td>
          <td style="font-size:12px;color:#1e293b;padding:4px 0;text-align:right;">${formatDate(data.validUntil)}</td>
        </tr>
        <tr>
          <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;text-align:right;">Telefono:</td>
          <td style="font-size:12px;color:#1e293b;padding:4px 0;text-align:right;">${data.clientInfo.phone}</td>
        </tr>
        <tr>
          <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding:4px 0;text-align:right;">Agencia:</td>
          <td style="font-size:12px;color:#1e293b;padding:4px 0;text-align:right;">${data.clientInfo.address}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Subject -->
  <div style="padding:0 40px;">
    <div style="background:#f0f6ff;border-left:4px solid #1a5276;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <span style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Partida: </span>
      <span style="font-size:13px;font-weight:700;color:#1a5276;">${data.subject}</span>
    </div>
  </div>

  <!-- Items Table -->
  <div style="padding:0 40px;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#0a1628;">
          <th style="padding:10px 8px;text-align:center;font-size:10px;color:#ffffff;text-transform:uppercase;letter-spacing:1px;border-radius:6px 0 0 0;width:60px;">Cant.</th>
          <th style="padding:10px 8px;text-align:left;font-size:10px;color:#ffffff;text-transform:uppercase;letter-spacing:1px;width:140px;">Codigo/Modelo</th>
          <th style="padding:10px 8px;text-align:left;font-size:10px;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">Descripcion</th>
          <th style="padding:10px 8px;text-align:right;font-size:10px;color:#ffffff;text-transform:uppercase;letter-spacing:1px;width:110px;">P. Unitario</th>
          <th style="padding:10px 8px;text-align:right;font-size:10px;color:#ffffff;text-transform:uppercase;letter-spacing:1px;border-radius:0 6px 0 0;width:110px;">P. Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
        ${laborRow}
      </tbody>
    </table>
  </div>

  <!-- Totals -->
  <div style="padding:20px 40px;">
    <div style="display:flex;justify-content:flex-end;">
      <table style="border-collapse:collapse;width:280px;">
        <tr>
          <td style="padding:8px 12px;font-size:11px;color:#64748b;">SUB TOTAL USD</td>
          <td style="padding:8px 12px;text-align:right;font-size:12px;font-weight:600;color:#1e293b;">$${formatCurrency(baseImponible)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;">IVA ${data.ivaRate}%</td>
          <td style="padding:8px 12px;text-align:right;font-size:12px;color:#1e293b;border-bottom:1px solid #e2e8f0;">$${formatCurrency(data.ivaAmount)}</td>
        </tr>
        <tr style="background:#0a1628;">
          <td style="padding:12px;font-size:12px;font-weight:700;color:#ffffff;border-radius:0 0 0 6px;">TOTAL USD</td>
          <td style="padding:12px;text-align:right;font-size:16px;font-weight:800;color:#ffffff;border-radius:0 0 6px 0;">$${formatCurrency(data.total)}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Payment Condition -->
  <div style="padding:0 40px;margin-bottom:15px;">
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 16px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:10px;color:#92400e;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Condiciones de Venta:</span>
      <span style="font-size:11px;color:#92400e;font-weight:700;">${data.paymentCondition}</span>
    </div>
  </div>

  ${
    data.notes
      ? `<div style="padding:0 40px;margin-bottom:15px;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;">
            <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600;">Notas:</div>
            <div style="font-size:11px;color:#475569;line-height:1.5;">${data.notes}</div>
          </div>
        </div>`
      : ""
  }

  <!-- Terms and Conditions -->
  ${
    data.termsAndConditions
      ? `<div style="padding:0 40px;margin-bottom:20px;">
          <div style="font-size:10px;color:#1a5276;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:700;">Terminos y Condiciones</div>
          <ol style="margin:0;padding-left:16px;">${termsLines}</ol>
        </div>`
      : ""
  }

  <!-- Footer -->
  <div style="background:#f0f6ff;border-top:2px solid #1a5276;padding:15px 40px;text-align:center;">
    <div style="font-size:10px;color:#475569;line-height:1.6;">
      Si usted tiene alguna pregunta sobre esta cotizacion, por favor pongase en contacto con nosotros<br>
      <span style="font-weight:600;color:#1a5276;">Cop's Electronics S.A.</span> - Telefonos: 0212-7934136 / 7940316 - Email: proyectos@copselectronics.com
    </div>
  </div>
</div>
</body>
</html>`
}

export function downloadPDF(data: QuotationData) {
  const htmlContent = generatePDFContent(data)
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
