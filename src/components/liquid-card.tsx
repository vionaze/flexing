"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

/* Adaptasi shader "WebGL Liquid Surge Button" (aura.build, Meng To)
   — warna cairan jadi uniform supaya tiap kartu punya identitas sendiri. */
const FS = `
  precision highp float;
  uniform vec2 u_res;
  uniform float u_time, u_level, u_tilt, u_slosh;
  uniform vec3 u_top, u_deep, u_glow;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);
  }
  float fbm(vec2 p){
    float v=0.0; float a=0.5;
    for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.04+vec2(11.3,7.1); a*=0.5; }
    return v;
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / u_res;
    float x = uv.x * (u_res.x / u_res.y);
    float t = u_time;
    /* level kecil (karya sedikit) -> gelombang & tilt ikut mengecil */
    float scale = smoothstep(0.0, 0.2, u_level);
    float amp = (0.012 + u_slosh * 0.045) * scale;
    float surf = u_level + u_tilt * (uv.x - 0.5) * 0.34 * scale + amp * sin(x * 5.1 + t * 4.6) + amp * 0.62 * sin(x * 9.7 - t * 6.8 + 1.7);
    float d = surf - uv.y;
    vec3 col = mix(vec3(0.03, 0.06, 0.1), vec3(0.05, 0.09, 0.15), uv.y);
    float inside = smoothstep(0.0, 0.012, d);
    vec3 liq = mix(u_top, u_deep, clamp(d/max(u_level,0.001),0.0,1.0));
    liq *= 0.8 + 0.42 * fbm(vec2(x * 4.2, (uv.y + t * 0.14) * 4.2));
    col = mix(col, liq, inside);
    col += u_glow * exp(-abs(d) * 80.0) * 0.85;
    vec2 e = uv * (1.0 - uv);
    col *= 0.55 + 0.45 * pow(e.x * e.y * 16.0, 0.22);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function hexToVec3(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Latar cairan WebGL untuk kartu orbit.
 * level = tinggi permukaan cairan (0.9 = 90% tinggi kotak).
 * Mouse di atas kartu menambah slosh; klik memberi efek "gulp".
 */
export function LiquidFill({
  top,
  deep,
  glow,
  level = 0.9,
}: {
  top: string;
  deep: string;
  glow: string;
  level?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement ?? canvas;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    function createShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const locP = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(locP);
    gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uLevel = gl.getUniformLocation(prog, "u_level");
    const uTilt = gl.getUniformLocation(prog, "u_tilt");
    const uSlosh = gl.getUniformLocation(prog, "u_slosh");
    const uTop = gl.getUniformLocation(prog, "u_top");
    const uDeep = gl.getUniformLocation(prog, "u_deep");
    const uGlow = gl.getUniformLocation(prog, "u_glow");

    gl.uniform3fv(uTop, hexToVec3(top));
    gl.uniform3fv(uDeep, hexToVec3(deep));
    gl.uniform3fv(uGlow, hexToVec3(glow));

    let levelNow = level;
    let gulp = 0;
    let slosh = 0.35;
    let tilt = 0;
    let tiltT = 0;
    let lastX: number | null = null;
    let last = 0;
    let visible = true;
    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(host.clientWidth * dpr);
      const h = Math.floor(host.clientHeight * dpr);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }

    function draw(now: number) {
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, now / 1000);
      gl!.uniform1f(uLevel, levelNow);
      gl!.uniform1f(uTilt, tilt);
      gl!.uniform1f(uSlosh, slosh);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    function render(now: number) {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      slosh *= Math.exp(-1.5 * dt);
      gulp *= Math.exp(-1.1 * dt);
      tilt += (tiltT - tilt) * Math.min(1, dt * 5);
      /* efek gulp proporsional level — di level kecil tidak mengeringkan kartu */
      const dip = Math.min(0.36, level * 0.4);
      levelNow += ((level - dip * gulp) - levelNow) * Math.min(1, dt * 5.5);
      resize();
      draw(now);
    }

    function onMove(e: MouseEvent) {
      const rect = host.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      if (lastX !== null) slosh = Math.min(1.4, slosh + Math.abs(x - lastX) * 2.6);
      lastX = x;
      tiltT = (x - 0.5) * 2;
    }
    function onLeave() {
      lastX = null;
      tiltT = 0;
    }
    function onGulp() {
      gulp = 1;
      slosh = Math.min(1.4, slosh + 0.7);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    if (reduced) {
      // reduced motion: satu frame statis tanpa gelombang
      resize();
      draw(4000);
      return () => io.disconnect();
    }

    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    host.addEventListener("click", onGulp);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      host.removeEventListener("click", onGulp);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduced, level, top, deep, glow]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 block h-full w-full"
    />
  );
}
