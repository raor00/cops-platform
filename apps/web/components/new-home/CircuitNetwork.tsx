"use client";

import { useEffect, useRef } from "react";

class DataPulse {
    x: number;
    y: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    speed: number;
    active: boolean;
    color: string;
    trail: { x: number; y: number }[] = [];
    reachedTarget: boolean = false;

    constructor(startX: number, startY: number, targetX: number, targetY: number, isCyan: boolean) {
        this.x = startX;
        this.y = startY;
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = Math.random() * 6 + 4; // Faster zips
        this.active = true;
        this.color = isCyan ? "rgba(0, 238, 255, 1)" : "rgba(148, 163, 184, 0.9)";
    }

    update() {
        if (!this.reachedTarget) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.speed) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.reachedTarget = true;
            } else {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }

            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 20) {
                this.trail.shift();
            }
        } else {
            this.trail.shift();
            if (this.trail.length === 0) {
                this.active = false;
            }
        }
    }

    draw(context: CanvasRenderingContext2D) {
        if (this.trail.length < 2) return;

        context.beginPath();
        context.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            context.lineTo(this.trail[i].x, this.trail[i].y);
        }

        context.lineWidth = 2.5;
        context.shadowBlur = 12;
        context.shadowColor = this.color;

        // Gradient for fading tail
        const grad = context.createLinearGradient(
            this.trail[0].x, this.trail[0].y,
            this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y
        );
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, this.color);
        context.strokeStyle = grad;
        context.stroke();
        context.shadowBlur = 0;

        // Head of the pulse
        if (!this.reachedTarget) {
            context.beginPath();
            context.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            context.fillStyle = '#fff';
            context.shadowBlur = 10;
            context.shadowColor = this.color;
            context.fill();
            context.shadowBlur = 0;
        }
    }
}

export default function CircuitNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const context = ctx;

        const gridSize = 60; // Size of the grid squares
        let cols = 0;
        let rows = 0;
        let pulsesArray: DataPulse[] = [];
        let animationFrameId = 0;

        // Track mouse to light up grid
        const mouse = { x: -1000, y: -1000, radius: 250 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            cols = Math.ceil(canvas.width / gridSize) + 1;
            rows = Math.ceil(canvas.height / gridSize) + 1;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        function spawnPulse() {
            // Pick a random grid intersection
            const startCol = Math.floor(Math.random() * cols);
            const startRow = Math.floor(Math.random() * rows);

            const startX = startCol * gridSize;
            const startY = startRow * gridSize;

            // Randomly pick a direction (0: up, 1: right, 2: down, 3: left)
            const dir = Math.floor(Math.random() * 4);
            // Randomly pick distance in grid units
            const distanceCols = Math.floor(Math.random() * 5) + 2;

            let targetX = startX;
            let targetY = startY;

            if (dir === 0) targetY -= distanceCols * gridSize;
            if (dir === 1) targetX += distanceCols * gridSize;
            if (dir === 2) targetY += distanceCols * gridSize;
            if (dir === 3) targetX -= distanceCols * gridSize;

            const isCyan = Math.random() > 0.5;
            pulsesArray.push(new DataPulse(startX, startY, targetX, targetY, isCyan));
        }

        function animate() {
            context.clearRect(0, 0, canvas!.width, canvas!.height);

            // Draw the static grid
            context.lineWidth = 1;
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * gridSize;
                    const y = j * gridSize;

                    // Calculate distance to mouse
                    const dx = mouse.x - x;
                    const dy = mouse.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    let opacity = 0.05; // base faint grid
                    let lineOpacity = 0.03;

                    // Glow effect near mouse
                    if (distance < mouse.radius) {
                        const glowIntensity = 1 - (distance / mouse.radius);
                        opacity = 0.05 + glowIntensity * 0.4;
                        lineOpacity = 0.03 + glowIntensity * 0.2;
                    }

                    // Draw grid lines right and down
                    context.beginPath();
                    context.strokeStyle = `rgba(148, 163, 184, ${lineOpacity})`;

                    // Right line
                    if (i < cols - 1) {
                        context.moveTo(x, y);
                        context.lineTo((i + 1) * gridSize, y);
                    }
                    // Down line
                    if (j < rows - 1) {
                        context.moveTo(x, y);
                        context.lineTo(x, (j + 1) * gridSize);
                    }
                    context.stroke();

                    // Intersections (Chip contacts)
                    if ((i + j) % 3 === 0) {
                        context.beginPath();
                        context.arc(x, y, opacity * 4, 0, Math.PI * 2);
                        context.fillStyle = `rgba(0, 238, 255, ${opacity * 1.5})`;
                        context.fill();
                    }
                }
            }

            // Randomly spawn new pulses (much higher frequency)
            if (Math.random() < 0.6) {
                spawnPulse();
            }

            // Update and draw pulses
            for (let i = pulsesArray.length - 1; i >= 0; i--) {
                const pulse = pulsesArray[i];
                pulse.update();
                pulse.draw(context);

                if (!pulse.active) {
                    pulsesArray.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        resize();
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-auto absolute left-0 top-0 h-full w-full opacity-60"
        />
    );
}
