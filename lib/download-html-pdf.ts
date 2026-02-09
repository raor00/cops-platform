"use client"

interface DownloadHtmlPdfOptions {
  htmlContent: string
  fileName: string
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function downloadHtmlAsPdf({ htmlContent, fileName }: DownloadHtmlPdfOptions): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")])

  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.left = "-10000px"
  iframe.style.top = "0"
  iframe.style.width = "794px"
  iframe.style.height = "1123px"
  iframe.style.border = "0"
  iframe.setAttribute("aria-hidden", "true")

  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument
    if (!doc) throw new Error("No se pudo abrir el documento para exportar PDF")

    doc.open()
    doc.write(htmlContent)
    doc.close()

    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve()
      window.setTimeout(() => resolve(), 250)
    })

    const images = Array.from(doc.images)
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve()
        return new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
      }),
    )

    await wait(250)

    const body = doc.body
    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: Math.max(body.scrollWidth, 794),
      windowHeight: body.scrollHeight,
    })

    const imageData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    const pageWidth = 210
    const pageHeight = 297
    const imageHeight = (canvas.height * pageWidth) / canvas.width

    let heightLeft = imageHeight
    let position = 0

    pdf.addImage(imageData, "PNG", 0, position, pageWidth, imageHeight, undefined, "FAST")
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imageHeight
      pdf.addPage()
      pdf.addImage(imageData, "PNG", 0, position, pageWidth, imageHeight, undefined, "FAST")
      heightLeft -= pageHeight
    }

    pdf.save(fileName)
  } finally {
    iframe.remove()
  }
}

