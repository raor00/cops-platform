"use client"

import { useEffect, useRef } from "react"

class DataPulse {
  x: number
  y: number
  startX: number
  startY: number
  targetX: number
  targetY: number
  speed: number
  active: boolean
  color: string
  trail: { x: number; y: number }[] = []
  reachedTarget = false

  constructor(startX: number, startY: number, targetX: number, targetY: number, isCyan: boolean) {
    this.x = startX
    this.y = startY
    this.startX = startX
    this.startY = startY
    this.targetX = targetX
    this.targetY = targetY
    this.speed = Math.random() * 6 + 4
    this.active = true
    this.color = isCyan ? "rgba(0, 238, 255, 1)" : "rgba(148, 163, 184, 0.9)"
  }

  update() {
    if (!this.reachedTarget) {
      const dx = this.targetX - this.x
      const dy = this.targetY - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < this.speed) {
        this.x = this.targetX
        this.y = this.targetY
        this.reachedTarget = true
      } else {
        this.x += (dx / distance) * this.speed
        this.y += (dy / distance) * this.speed
      }
      this.trail.push({ x: this.x, y: this.y })
      if (this.trail.length > 20) this.trail.shift()
    } else {
      this.trail.shift()
      if (this.trail.length === 0) this.active = false
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.trail.length < 2) return
    ctx.beginPath()
    ctx.moveTo(this.trail[0].x, this.trail[0].y)
    for (let i = 1; i < this.trail.length; i++) ctx.lineTo(this.trail[i].x, this.trail[i].y)
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 12
    ctx.shadowColor = this.color
    const grad = ctx.createLinearGradient(
      this.trail[0].x, this.trail[0].y,
      this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y,
    )
    grad.addColorStop(0, "transparent")
    grad.addColorStop(1, this.color)
    ctx.strokeStyle = grad
    ctx.stroke()
    ctx.shadowBlur = 0
    if (!this.reachedTarget) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.shadowBlur = 10
      ctx.shadowColor = this.color
      ctx.fill()
      ctx.shadowBlur = 0
    }
  }
}

export default function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    if (!ctx) return

    const gridSize = 60
    let cols = 0
    let rows = 0
    let pulses: DataPulse[] = []
    let frameId = 0
    const mouse = { x: -1000, y: -1000, radius: 250 }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      cols = Math.ceil(canvas.width / gridSize) + 1
      rows = Math.ceil(canvas.height / gridSize) + 1
    }

    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    const onMouseLeave = () => { mouse.x = -1000; mouse.y = -1000 }

    function spawnPulse() {
      const startCol = Math.floor(Math.random() * cols)
      const startRow = Math.floor(Math.random() * rows)
      const startX = startCol * gridSize
      const startY = startRow * gridSize
      const dir = Math.floor(Math.random() * 4)
      const dist = Math.floor(Math.random() * 5) + 2
      let tx = startX, ty = startY
      if (dir === 0) ty -= dist * gridSize
      if (dir === 1) tx += dist * gridSize
      if (dir === 2) ty += dist * gridSize
      if (dir === 3) tx -= dist * gridSize
      pulses.push(new DataPulse(startX, startY, tx, ty, Math.random() > 0.5))
    }

    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx.lineWidth = 1
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize
          const y = j * gridSize
          const dx = mouse.x - x
          const dy = mouse.y - y
          const d = Math.sqrt(dx * dx + dy * dy)
          let opacity = 0.05
          let lineOpacity = 0.03
          if (d < mouse.radius) {
            const g = 1 - d / mouse.radius
            opacity = 0.05 + g * 0.4
            lineOpacity = 0.03 + g * 0.2
          }
          ctx.beginPath()
          ctx.strokeStyle = `rgba(148, 163, 184, ${lineOpacity})`
          if (i < cols - 1) { ctx.moveTo(x, y); ctx.lineTo((i + 1) * gridSize, y) }
          if (j < rows - 1) { ctx.moveTo(x, y); ctx.lineTo(x, (j + 1) * gridSize) }
          ctx.stroke()
          if ((i + j) % 3 === 0) {
            ctx.beginPath()
            ctx.arc(x, y, opacity * 4, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(0, 238, 255, ${opacity * 1.5})`
            ctx.fill()
          }
        }
      }
      if (Math.random() < 0.6) spawnPulse()
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update()
        pulses[i].draw(ctx)
        if (!pulses[i].active) pulses.splice(i, 1)
      }
      frameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)
    resize()
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
