import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      frame += 1;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;

        const pulse = 0.35 + Math.sin(frame * 0.02 + p.x * 10) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * devicePixelRatio * pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(109, 40, 255, 0.45)";
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(109,40,255,0.35),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,194,255,0.12),transparent_40%)]" />
      <motion.div
        className="absolute -left-1/4 top-1/3 h-96 w-96 rounded-full bg-violet-600/20 blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[90px]"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950" />
    </div>
  );
}
