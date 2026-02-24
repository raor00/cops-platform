"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
};

type Atom = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  color: string;
};

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let atomsArray: Atom[] = [];
    let animationFrameId = 0;
    const mouse = { x: -1000, y: -1000, radius: 250 };

    const createParticle = (): Particle => {
      const colorType = Math.random();
      let color = "rgba(255,255,255,0.85)";
      if (colorType <= 0.7) {
        const g = 160 + Math.random() * 60;
        const b = 80 + Math.random() * 60;
        color = `rgba(255, ${g}, ${b}, ${Math.random() * 0.3 + 0.7})`;
      }

      const baseRadius = Math.random() * 3.5 + 1.5;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5,
        baseRadius,
        radius: baseRadius,
        color,
      };
    };

    const createAtom = (): Atom => {
      const g = 140 + Math.random() * 60;
      const b = 50 + Math.random() * 60;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2 + 2.5,
        angle: Math.random() * Math.PI * 2,
        color: `rgba(255, ${g}, ${b}, ${Math.random() * 0.4 + 0.6})`,
      };
    };

    const init = () => {
      particlesArray = [];
      atomsArray = [];

      const numberOfNodes = Math.floor((canvas.width * canvas.height) / 4500);
      for (let i = 0; i < numberOfNodes; i += 1) particlesArray.push(createParticle());

      const numberOfAtoms = Math.floor((canvas.width * canvas.height) / 80000) + 3;
      for (let i = 0; i < numberOfAtoms; i += 1) atomsArray.push(createAtom());
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = () => handleMouseLeave();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i += 1) {
        const p = particlesArray[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;

        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const distanceToMouse = Math.sqrt(dxm * dxm + dym * dym);

        if (distanceToMouse < mouse.radius && distanceToMouse > 0) {
          const forceDirectionX = dxm / distanceToMouse;
          const forceDirectionY = dym / distanceToMouse;
          const force = (mouse.radius - distanceToMouse) / mouse.radius;
          p.x -= forceDirectionX * force * 7;
          p.y -= forceDirectionY * force * 7;
          p.radius = p.baseRadius + force * 3;
        } else {
          p.radius = p.baseRadius;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i; j < particlesArray.length; j += 1) {
          const q = particlesArray[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 220) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - d / 220) * 0.45})`;
            ctx.lineWidth = 1.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < atomsArray.length; i += 1) {
        const a = atomsArray[i];
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < 0 || a.x > canvas.width) a.vx = -a.vx;
        if (a.y < 0 || a.y > canvas.height) a.vy = -a.vy;

        const dxm = mouse.x - a.x;
        const dym = mouse.y - a.y;
        const distanceToMouse = Math.sqrt(dxm * dxm + dym * dym);
        if (distanceToMouse < mouse.radius && distanceToMouse > 0) {
          const forceDirectionX = dxm / distanceToMouse;
          const forceDirectionY = dym / distanceToMouse;
          const force = (mouse.radius - distanceToMouse) / mouse.radius;
          a.x -= forceDirectionX * force * 5;
          a.y -= forceDirectionY * force * 5;
        }

        a.angle += 0.02;

        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);

        ctx.beginPath();
        ctx.arc(0, 0, a.radius, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = a.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        const orbitRadius = a.radius * 4;
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;

        for (let o = 0; o < 3; o += 1) {
          ctx.beginPath();
          ctx.rotate(Math.PI / 3);
          ctx.ellipse(0, 0, orbitRadius, orbitRadius / 2.5, 0, 0, Math.PI * 2);
          ctx.stroke();

          const electronAngle = a.angle * 3 + (o * Math.PI * 2) / 3;
          const ex = Math.cos(electronAngle) * orbitRadius;
          const ey = Math.sin(electronAngle) * (orbitRadius / 2.5);

          ctx.beginPath();
          ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#fff";
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 h-full w-full pointer-events-none"
      style={{ background: "#070f1e", zIndex: 0 }}
    />
  );
}
