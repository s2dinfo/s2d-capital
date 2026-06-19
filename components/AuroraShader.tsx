'use client';
import { useEffect, useRef } from 'react';

// A subtle flowing aurora behind the hero — a tiny raw-WebGL fragment shader
// (no library, ~zero bundle cost). Renders nothing if WebGL is unavailable, so
// the CSS mesh underneath stays as a graceful fallback. Pauses when off-screen.
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * 3.0;
  float t = u_time * 0.05;
  float v = 0.0;
  v += 0.5 * sin(p.x * 1.3 + t * 1.7 + sin(p.y * 0.8 - t));
  v += 0.5 * sin(p.y * 1.1 - t * 1.3 + sin(p.x * 0.9 + t * 0.7));
  v += 0.35 * sin((p.x + p.y) * 0.9 + t * 0.9);
  v = v * 0.5 + 0.5;
  vec3 navy = vec3(0.043, 0.078, 0.149);
  vec3 gold = vec3(0.72, 0.55, 0.17);
  vec3 blue = vec3(0.23, 0.42, 0.70);
  vec3 col = navy;
  col = mix(col, blue, smoothstep(0.05, 0.45, v) * 0.30);
  col = mix(col, gold, smoothstep(0.55, 0.96, v) * 0.50);
  float d = distance(uv, vec2(0.5, 0.42));
  float a = (1.0 - smoothstep(0.18, 0.78, d)) * 0.45;
  gl_FragColor = vec4(col * a, a); // premultiplied
}`;
const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

export default function AuroraShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return; // fallback: CSS mesh underneath remains

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied source
    gl.clearColor(0, 0, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    let raf = 0;
    let t = 0;
    let lastFrozen = false;
    const draw = () => {
      gl.clear(gl.COLOR_BUFFER_BIT); // fresh each frame — never accumulate alpha
      gl.uniform1f(uTime, reduced ? 4.0 : t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = () => {
      if (visible) {
        if (!reduced) t += 0.016;
        draw();
        lastFrozen = false;
      } else if (!lastFrozen) {
        draw(); // one last frame, then idle while off-screen
        lastFrozen = true;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      const ext = gl.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.7, pointerEvents: 'none' }} aria-hidden />;
}
