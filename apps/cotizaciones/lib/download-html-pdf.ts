"use client"

interface DownloadHtmlPdfOptions {
  htmlContent: string
  fileName: string
}

interface SliceRange {
  start: number
  end: number
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function getPageSlices(body: HTMLElement, pageHeightCss: number): SliceRange[] {
  const bodyRect = body.getBoundingClientRect()
  const totalHeight = Math.ceil(body.scrollHeight)
  if (totalHeight <= pageHeightCss) {
    return [{ start: 0, end: totalHeight }]
  }

  const candidateSet = new Set<number>()
  const blockSelector = "[data-pdf-block], table, tr, section, article, div, p, ul, ol, h1, h2, h3, h4, h5, h6"
  const elements = Array.from(body.querySelectorAll<HTMLElement>(blockSelector))

  for (const el of elements) {
    const rect = el.getBoundingClientRect()
    const style = window.getComputedStyle(el)
    if (style.display === "inline" || style.position === "fixed") continue
    if (rect.height < 14) continue

    const top = Math.max(0, Math.round(rect.top - bodyRect.top))
    const bottom = Math.min(totalHeight, Math.round(rect.bottom - bodyRect.top))
    if (bottom - top < 14) continue

    candidateSet.add(bottom)
  }

  const candidates = Array.from(candidateSet).sort((a, b) => a - b)
  const slices: SliceRange[] = []
  const minSlice = Math.floor(pageHeightCss * 0.55)
  const lookBack = Math.floor(pageHeightCss * 0.28)
  const lookAhead = Math.floor(pageHeightCss * 0.08)

  let start = 0
  while (start < totalHeight) {
    const idealEnd = start + pageHeightCss
    if (idealEnd >= totalHeight) {
      slices.push({ start, end: totalHeight })
      break
    }

    const lowerBound = Math.max(start + minSlice, idealEnd - lookBack)
    const upperBound = Math.min(totalHeight, idealEnd + lookAhead)

    let end = -1
    for (let i = candidates.length - 1; i >= 0; i -= 1) {
      const point = candidates[i]
      if (point > upperBound) continue
      if (point < lowerBound) break
      end = point
      if (point <= idealEnd) break
    }

    if (end <= start) {
      end = Math.min(totalHeight, idealEnd)
    }

    slices.push({ start, end })
    start = end
  }

  return slices
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

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    const pageWidth = 210
    const pageHeight = 297
    const scaleFactor = canvas.width / Math.max(1, body.scrollWidth)
    const pageHeightCss = (pageHeight / pageWidth) * body.scrollWidth
    const slices = getPageSlices(body, pageHeightCss)

    slices.forEach((slice, index) => {
      const startY = Math.max(0, Math.floor(slice.start * scaleFactor))
      const endY = Math.min(canvas.height, Math.ceil(slice.end * scaleFactor))
      const sliceHeight = Math.max(1, endY - startY)

      const pageCanvas = document.createElement("canvas")
      pageCanvas.width = canvas.width
      pageCanvas.height = sliceHeight

      const pageCtx = pageCanvas.getContext("2d")
      if (!pageCtx) return

      pageCtx.fillStyle = "#ffffff"
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      pageCtx.drawImage(
        canvas,
        0,
        startY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      )

      const pageImage = pageCanvas.toDataURL("image/png")
      const renderedHeight = (sliceHeight * pageWidth) / canvas.width

      if (index > 0) {
        pdf.addPage()
      }
      pdf.addImage(pageImage, "PNG", 0, 0, pageWidth, renderedHeight, undefined, "FAST")
    })

    pdf.save(fileName)
  } finally {
    iframe.remove()
  }
}

