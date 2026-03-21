"use client";

import { useEffect, useRef } from "react";

// Simplex-inspired noise (lightweight)
function createNoise() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function grad(hash: number, x: number, y: number) {
    const h = hash & 3;
    const u = h < 2 ? x : -x;
    const v = h === 0 || h === 3 ? y : -y;
    return u + v;
  }

  function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a: number, b: number, t: number) {
    return a + t * (b - a);
  }

  return function noise(x: number, y: number) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[xi] + yi];
    const ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi];
    const bb = perm[perm[xi + 1] + yi + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };
}

const COLORS = [
  [108, 92, 231],   // accent purple
  [0, 245, 160],    // neon green
  [0, 217, 255],    // neon blue
  [246, 55, 236],   // neon pink
  [139, 124, 247],  // accent light
];

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const noise = createNoise();
    let animId: number;
    let time = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw 4 aurora layers
      for (let layer = 0; layer < 4; layer++) {
        const color = COLORS[layer];
        const speed = 0.00004 + layer * 0.00001;
        const scale = 0.0015 + layer * 0.0005;
        const yOffset = h * (0.2 + layer * 0.15);

        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 3) {
          const nx = x * scale;
          const ny = time * speed * 10 + layer * 100;
          const n1 = noise(nx, ny) * 0.6;
          const n2 = noise(nx * 2.5, ny * 1.5 + 50) * 0.3;
          const n3 = noise(nx * 0.5, ny * 0.8 + 200) * 0.4;
          const combined = n1 + n2 + n3;
          const y = yOffset + combined * h * 0.3;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, yOffset - h * 0.3, 0, h);
        gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.04)`);
        gradient.addColorStop(0.3, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.08)`);
        gradient.addColorStop(0.7, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.03)`);
        gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Subtle floating orbs
      for (let i = 0; i < 3; i++) {
        const color = COLORS[i + 1];
        const cx = w * (0.2 + i * 0.3) + Math.sin(time * 0.00006 + i * 2) * w * 0.1;
        const cy = h * (0.3 + i * 0.15) + Math.cos(time * 0.00005 + i * 3) * h * 0.1;
        const r = Math.min(w, h) * (0.15 + Math.sin(time * 0.00004 + i) * 0.05);

        const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        orbGrad.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.06)`);
        orbGrad.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.02)`);
        orbGrad.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

        ctx.fillStyle = orbGrad;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      time += 16;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ filter: "blur(40px)" }}
    />
  );
}
