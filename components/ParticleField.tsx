"use client";
import { useEffect, useRef } from "react";
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const mouse = useRef({ x: -999, y: -999 });
  const raf = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => { canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    particles.current = Array.from({ length: 45 }, () => ({ x: Math.random() * canvas.offsetWidth, y: Math.random() * canvas.offsetHeight, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, size: Math.random() * 1.2 + 0.4, opacity: Math.random() * 0.4 + 0.1, isGold: Math.random() < 0.3 }));
    const onMouse = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("mouseleave", () => { mouse.current = { x: -999, y: -999 }; });
    const animate = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const pts = particles.current;
      for (const p of pts) {
        const dx = mouse.current.x - p.x, dy = mouse.current.y - p.y, dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 150 && dist > 0) { const force = ((150-dist)/150)*0.015; p.vx += (dx/dist)*force; p.vy += (dy/dist)*force; }
        p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.vy *= 0.99;
        if (p.x<0) p.x=w; if (p.x>w) p.x=0; if (p.y<0) p.y=h; if (p.y>h) p.y=0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        if (p.isGold) { ctx.fillStyle=`rgba(184,134,11,${p.opacity*0.6})`; ctx.shadowBlur=6; ctx.shadowColor="rgba(184,134,11,0.2)"; }
        else { ctx.fillStyle=`rgba(26,26,46,${p.opacity*0.15})`; ctx.shadowBlur=0; }
        ctx.fill(); ctx.shadowBlur=0;
      }
      for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
        const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
        if (d<90) { const alpha=(1-d/90)*0.06; ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=pts[i].isGold||pts[j].isGold?`rgba(184,134,11,${alpha*1.5})`:`rgba(26,26,46,${alpha*0.5})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }
      raf.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize",resize); canvas.removeEventListener("mousemove",onMouse); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'auto',zIndex:0 }} />;
}
