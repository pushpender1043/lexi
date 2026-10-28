import React, { useEffect, useRef } from 'react';
import { useMood, MOOD_CONFIGS } from '../lib/moods';
import { Mood } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  size: number;
  currentR: number;
  currentG: number;
  currentB: number;
  targetR: number;
  targetG: number;
  targetB: number;
  alpha: number;
  targetAlpha: number;
  pulsePhase: number;
  wobblePhase: number;
  shape: 'circle' | 'star' | 'heart' | 'sparkle' | 'bubble';
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  if (clean.length === 6) {
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }
  return [124, 58, 237];
}

export const ParticleBackground: React.FC = () => {
  const { currentMood, config } = useMood();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Track mouse for 'curious' mood orbital drift
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Determine target palette
    const isDark = document.documentElement.classList.contains('dark');
    const palette = isDark ? config.paletteDark : config.paletteLight;

    // Target particle count: mobile <= 40, desktop <= 85
    const baseCount = width < 768 ? 32 : 75;
    const targetCount = Math.round(baseCount * config.particleCountMultiplier);

    // Initialize or adapt particle pool without hard resets
    const currentParticles = particlesRef.current;
    while (currentParticles.length < targetCount) {
      const colorHex = palette[Math.floor(Math.random() * palette.length)];
      const [r, g, b] = hexToRgb(colorHex);
      const minSize = config.sizeRange[0];
      const maxSize = config.sizeRange[1];
      const size = minSize + Math.random() * (maxSize - minSize);

      currentParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.speed * 0.8,
        vy: (Math.random() - 0.5) * config.speed * 0.8,
        baseSize: size,
        size,
        currentR: r,
        currentG: g,
        currentB: b,
        targetR: r,
        targetG: g,
        targetB: b,
        alpha: 0.15 + Math.random() * 0.45,
        targetAlpha: 0.15 + Math.random() * 0.45,
        pulsePhase: Math.random() * Math.PI * 2,
        wobblePhase: Math.random() * Math.PI * 2,
        shape: config.shape,
      });
    }

    if (currentParticles.length > targetCount) {
      currentParticles.splice(targetCount);
    }

    // Update target colors & motion parameters when mood or theme updates
    currentParticles.forEach((p, idx) => {
      const colorHex = palette[idx % palette.length];
      const [tr, tg, tb] = hexToRgb(colorHex);
      p.targetR = tr;
      p.targetG = tg;
      p.targetB = tb;
      p.shape = config.shape;
      const minSize = config.sizeRange[0];
      const maxSize = config.sizeRange[1];
      p.baseSize = minSize + Math.random() * (maxSize - minSize);
    });

    if (prefersReducedMotion) {
      // Static single draw
      ctx.clearRect(0, 0, width, height);
      currentParticles.forEach((p) => {
        ctx.fillStyle = `rgba(${p.targetR}, ${p.targetG}, ${p.targetB}, 0.2)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.baseSize, 0, Math.PI * 2);
        ctx.fill();
      });
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);
      };
    }

    // Shape drawing routines
    const drawStar = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        const outerX = x + Math.cos(a) * r;
        const outerY = y + Math.sin(a) * r;
        const innerA = a + Math.PI / 4;
        const innerX = x + Math.cos(innerA) * (r * 0.35);
        const innerY = y + Math.sin(innerA) * (r * 0.35);
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawHeart = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 10, size / 10);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-5, -5, -10, 2, 0, 10);
      ctx.bezierCurveTo(10, 2, 5, -5, 0, 0);
      ctx.fill();
      ctx.restore();
    };

    const drawBubble = (x: number, y: number, r: number, alpha: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.3)})`;
      ctx.fill();
    };

    // Main animation loop with smooth lerping
    const render = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      if (!document.hidden) {
        ctx.clearRect(0, 0, width, height);

        const lerpSpeed = 0.05;

        for (let i = 0; i < currentParticles.length; i++) {
          const p = currentParticles[i];

          // LERP color crossfade
          p.currentR += (p.targetR - p.currentR) * lerpSpeed;
          p.currentG += (p.targetG - p.currentG) * lerpSpeed;
          p.currentB += (p.targetB - p.currentB) * lerpSpeed;

          p.pulsePhase += dt * (1.5 + config.speed);
          p.wobblePhase += dt * 2.0;

          // Motion patterns
          switch (config.motionPattern) {
            case 'upward':
              p.y -= (0.4 + config.speed * 0.6) * 60 * dt;
              p.x += Math.sin(p.pulsePhase) * 0.4;
              break;
            case 'falling':
              p.y += (0.8 + config.speed * 0.9) * 60 * dt;
              p.x += Math.sin(p.pulsePhase * 0.5) * 0.3;
              break;
            case 'bounce':
              p.y += Math.sin(p.pulsePhase) * 0.8;
              p.x += Math.cos(p.wobblePhase) * 0.6;
              break;
            case 'wobble':
              p.x += Math.sin(p.wobblePhase) * 1.2;
              p.y += Math.cos(p.pulsePhase) * 0.5;
              break;
            case 'burst':
              p.x += p.vx * 70 * dt * config.speed;
              p.y += p.vy * 70 * dt * config.speed;
              break;
            case 'jitter':
              p.x += (Math.random() - 0.5) * 1.2;
              p.y += (Math.random() - 0.5) * 1.2;
              break;
            case 'orbit':
              if (mouseRef.current.active) {
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 20 && dist < 320) {
                  p.x += (dx / dist) * 0.7;
                  p.y += (dy / dist) * 0.7;
                }
              }
              p.x += Math.sin(p.pulsePhase) * 0.5;
              p.y -= 0.3;
              break;
            case 'pulse':
              p.size = p.baseSize * (1 + Math.sin(p.pulsePhase) * 0.35);
              break;
            default: // float
              p.x += Math.sin(p.pulsePhase) * 0.4;
              p.y += Math.cos(p.wobblePhase) * 0.3;
              break;
          }

          // Screen wrap-around
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          // Render particle
          const r = Math.round(p.currentR);
          const g = Math.round(p.currentG);
          const b = Math.round(p.currentB);
          const currentAlpha = Math.max(0.08, Math.min(0.85, p.alpha * (0.8 + Math.sin(p.pulsePhase) * 0.25)));

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.9})`;
          ctx.lineWidth = 1.2;

          // Subtle glow shadow
          if (config.glowIntensity > 0.4) {
            ctx.shadowBlur = 10 * config.glowIntensity;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
          } else {
            ctx.shadowBlur = 0;
          }

          if (p.shape === 'star' || p.shape === 'sparkle') {
            drawStar(p.x, p.y, p.baseSize);
          } else if (p.shape === 'heart') {
            drawHeart(p.x, p.y, p.baseSize);
          } else if (p.shape === 'bubble') {
            drawBubble(p.x, p.y, p.baseSize, currentAlpha);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.baseSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [currentMood, config]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
    </div>
  );
};
