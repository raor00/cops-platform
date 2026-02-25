"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "fusion" | "explosion" | "normal";

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
  const textRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("fusion");
  const hasInitializedRef = useRef(false);

  const currentPhaseRef = useRef<Phase>("fusion");
  const fusionProgressRef = useRef(0);
  const fusionRadiusRef = useRef(5);
  const shockwaveRadiusRef = useRef(0);
  const shockwaveOpacityRef = useRef(1);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const context = ctx;

    let particlesArray: any[] = [];
    let atomsArray: any[] = [];
    let animationFrameId = 0;
    const mouse = { x: -1000, y: -1000, radius: 250 };

    const dispatchPhaseChange = (newPhase: Phase) => {
      const event = new CustomEvent("particlePhaseChange", {
        detail: { phase: newPhase },
      });
      window.dispatchEvent(event);
    };

    class ParticleCls {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.vx = (Math.random() - 0.5) * 2.5;
        this.vy = (Math.random() - 0.5) * 2.5;
        this.baseRadius = Math.random() * 3.5 + 1.5;
        this.radius = this.baseRadius;

        const colorType = Math.random();
        if (colorType > 0.7) {
          this.color = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.8})`;
        } else {
          const g = 160 + Math.random() * 60;
          const b = 80 + Math.random() * 60;
          this.color = `rgba(255, ${g}, ${b}, ${Math.random() * 0.3 + 0.7})`;
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvasEl.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvasEl.height) this.vy = -this.vy;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius && distance > 0) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirectionX * force * 7;
          this.y -= forceDirectionY * force * 7;
          this.radius = this.baseRadius + force * 3;
        } else {
          this.radius = this.baseRadius;
        }
      }

      draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.shadowBlur = 10;
        context.shadowColor = this.color;
        context.fill();
        context.shadowBlur = 0;
      }
    }

    class AtomCls {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      angle: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 2.5;
        this.angle = Math.random() * Math.PI * 2;
        const g = 140 + Math.random() * 60;
        const b = 50 + Math.random() * 60;
        this.color = `rgba(255, ${g}, ${b}, ${Math.random() * 0.4 + 0.6})`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvasEl.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvasEl.height) this.vy = -this.vy;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius && distance > 0) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirectionX * force * 5;
          this.y -= forceDirectionY * force * 5;
        }

        this.angle += 0.02;
      }

      draw() {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);

        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.shadowBlur = 20;
        context.shadowColor = this.color;
        context.fill();
        context.shadowBlur = 0;

        const orbitRadius = this.radius * 4;
        context.strokeStyle = "rgba(255, 255, 255, 0.2)";
        context.lineWidth = 1;

        for (let i = 0; i < 3; i += 1) {
          context.beginPath();
          context.rotate(Math.PI / 3);
          context.ellipse(0, 0, orbitRadius, orbitRadius / 2.5, 0, 0, Math.PI * 2);
          context.stroke();

          const electronAngle = this.angle * 3 + (i * Math.PI * 2) / 3;
          const ex = Math.cos(electronAngle) * orbitRadius;
          const ey = Math.sin(electronAngle) * (orbitRadius / 2.5);

          context.beginPath();
          context.arc(ex, ey, 1.5, 0, Math.PI * 2);
          context.fillStyle = "#fff";
          context.shadowBlur = 8;
          context.shadowColor = "#fff";
          context.fill();
          context.shadowBlur = 0;
        }

        context.restore();
      }
    }

    const resize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
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

    const handleTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    function init() {
      particlesArray = [];
      atomsArray = [];

      const numberOfNodes = Math.floor((canvasEl.width * canvasEl.height) / 7000);
      for (let i = 0; i < numberOfNodes; i += 1) {
        particlesArray.push(new ParticleCls());
      }

      const numberOfAtoms = Math.floor((canvasEl.width * canvasEl.height) / 80000) + 3;
      for (let i = 0; i < numberOfAtoms; i += 1) {
        atomsArray.push(new AtomCls());
      }

      const skipIntro = sessionStorage.getItem('cops-intro-seen') === 'true';

      if (skipIntro) {
        currentPhaseRef.current = "normal";
        setPhase("normal");
        dispatchPhaseChange("normal");
      } else {
        currentPhaseRef.current = "fusion";
        setPhase("fusion");
        dispatchPhaseChange("fusion");
        fusionProgressRef.current = 0;
        fusionRadiusRef.current = 5;
      }
    }

    let lastTime = performance.now();
    const animate = (time?: number) => {
      const currentTime = time || performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      const timeScale = Math.min(Math.max(deltaTime / 16.666, 0.1), 3);

      context.clearRect(0, 0, canvasEl.width, canvasEl.height);

      const centerX = canvasEl.width / 2;
      const centerY = canvasEl.height / 2;

      if (currentPhaseRef.current === "fusion") {
        const targetSpeed = fusionProgressRef.current < 20 ? 0.8 : (fusionProgressRef.current > 80 ? 2.5 : 1.5);
        fusionProgressRef.current += targetSpeed * timeScale;

        if (textRef.current) {
          textRef.current.innerText = `${Math.min(Math.floor(fusionProgressRef.current), 100)}%`;
        }

        fusionRadiusRef.current = Math.max(
          0.1,
          (fusionProgressRef.current / 100) * 40 + Math.sin(currentTime * 0.006) * 6
        );

        context.save();
        context.translate(centerX, centerY);

        context.beginPath();
        context.arc(0, 0, fusionRadiusRef.current, 0, Math.PI * 2);
        const glowPulse = Math.sin(currentTime * 0.008) * 0.1;
        context.fillStyle = `rgba(255, 220, 150, ${0.8 + (fusionProgressRef.current / 100) * 0.2 + glowPulse})`;
        context.shadowBlur = 50 + fusionProgressRef.current + (glowPulse * 50);
        context.shadowColor = "rgba(255, 200, 100, 1)";
        context.fill();
        context.shadowBlur = 0;

        const ringRadius = fusionRadiusRef.current * 2 + (100 - fusionProgressRef.current) * 0.8;
        context.rotate(currentTime * 0.003);
        context.strokeStyle = `rgba(255, 220, 150, ${fusionProgressRef.current / 100})`;
        context.lineWidth = 2;
        context.beginPath();
        context.ellipse(0, 0, ringRadius, ringRadius / 3, 0, 0, Math.PI * 2);
        context.stroke();

        context.rotate(Math.PI / 2);
        context.beginPath();
        context.ellipse(0, 0, ringRadius, ringRadius / 3, 0, 0, Math.PI * 2);
        context.stroke();

        context.restore();

        for (let i = 0; i < 30; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 50 + Math.random() * 200 + (100 - fusionProgressRef.current) * 5;
          const px = centerX + Math.cos(angle) * dist;
          const py = centerY + Math.sin(angle) * dist;

          context.beginPath();
          context.arc(px, py, Math.random() * 2, 0, Math.PI * 2);
          const r = 255;
          const g = 180 + Math.random() * 50;
          const b = 100 + Math.random() * 50;
          context.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.5 + 0.2})`;
          context.fill();

          context.beginPath();
          context.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
          context.lineWidth = 0.5;
          context.moveTo(centerX, centerY);
          context.lineTo(px, py);
          context.stroke();
        }

        if (fusionProgressRef.current >= 100) {
          currentPhaseRef.current = "explosion";
          setPhase("explosion");
          shockwaveRadiusRef.current = fusionRadiusRef.current;
          shockwaveOpacityRef.current = 1;
        }
      } else if (currentPhaseRef.current === "explosion") {
        shockwaveRadiusRef.current += 45 * timeScale;
        shockwaveOpacityRef.current -= 0.03 * timeScale;

        context.save();
        context.translate(centerX, centerY);
        context.beginPath();
        context.arc(0, 0, shockwaveRadiusRef.current, 0, Math.PI * 2);
        context.strokeStyle = `rgba(255, 255, 255, ${shockwaveOpacityRef.current})`;
        context.lineWidth = 10;
        context.stroke();

        context.beginPath();
        context.arc(0, 0, shockwaveRadiusRef.current * 0.8, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 200, 100, ${shockwaveOpacityRef.current * 0.3})`;
        context.fill();
        context.restore();

        if (shockwaveOpacityRef.current <= 0) {
          currentPhaseRef.current = "normal";
          setPhase("normal");
          dispatchPhaseChange("normal");
          sessionStorage.setItem("cops-intro-seen", "true");
        }
      }

      if (currentPhaseRef.current === "normal" || currentPhaseRef.current === "explosion") {
        for (let i = 0; i < particlesArray.length; i += 1) {
          particlesArray[i].update();
          particlesArray[i].draw();

          for (let j = i; j < particlesArray.length; j += 1) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 220) {
              context.beginPath();
              context.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 220) * 0.45})`;
              context.lineWidth = 1.6;
              context.moveTo(particlesArray[i].x, particlesArray[i].y);
              context.lineTo(particlesArray[j].x, particlesArray[j].y);
              context.stroke();
            }
          }
        }

        for (let i = 0; i < atomsArray.length; i += 1) {
          atomsArray[i].update();
          atomsArray[i].draw();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

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
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 h-full w-full pointer-events-none"
        style={{ background: "#070f1e", zIndex: 0 }}
      />
      {phase === "fusion" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div
            ref={textRef}
            className="mt-48 font-mono text-xl font-bold tracking-[0.3em] text-cyan-400 drop-shadow-[0_0_10px_rgba(0,210,255,0.8)] md:text-2xl"
          >
            0%
          </div>
        </div>
      )}
    </>
  );
}



