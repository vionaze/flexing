"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const VS = `#version 300 es
in vec2 aPos;out vec2 vUv;void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.,1.);}`;

/* Adaptasi shader "WebGL aura button" (aura.build) — warna jadi uniform */
const FS = `#version 300 es
precision highp float;in vec2 vUv;out vec4 o;
uniform vec2 r;uniform float t;uniform vec2 p;uniform float h;
uniform vec3 cA;uniform vec3 cB;uniform vec3 cC;
float hsh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);float a=hsh(i),b=hsh(i+vec2(1.,0.)),c=hsh(i+vec2(0.,1.)),d=hsh(i+vec2(1.,1.));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
void main(){
  vec2 uv=vUv,px=uv-p;px.x*=r.x/r.y;
  float d=length(px),rip=sin(30.*d-t*5.)*exp(-8.*d)*h,bl=smoothstep(.4,.7,fbm(uv*3.+t*.1));
  vec2 dist=vec2(fbm(uv*4.+t*.2),fbm(uv*4.-t*.15))*.04+rip*.02;
  vec3 col=mix(mix(cA,cB,smoothstep(.1,.9,uv.x+dist.x)),cC,smoothstep(.5,1.,uv.y+dist.y))+bl*.15+pow(1.-length(uv-.5)*1.5,3.)*.2;
  o=vec4(col,.95);
}`;

function hexToVec3(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Button kaca ber-aura WebGL (gradient cair anim + reaksi hover).
 * Dipakai sebagai span di dalam link kartu — kartu tetap yang menavigasi.
 */
export function AuraButton({
  label,
  cA,
  cB,
  cC,
  glow,
}: {
  label: string;
  cA: string;
  cB: string;
  cC: string;
  glow: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = (canvas.closest("[data-aura-root]") ?? canvas) as HTMLElement;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prg = gl.createProgram()!;
    gl.attachShader(prg, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prg, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prg);
    gl.useProgram(prg);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const pos = gl.getAttribLocation(prg, "aPos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const rL = gl.getUniformLocation(prg, "r");
    const tL = gl.getUniformLocation(prg, "t");
    const pL = gl.getUniformLocation(prg, "p");
    const hL = gl.getUniformLocation(prg, "h");
    gl.uniform3fv(gl.getUniformLocation(prg, "cA"), hexToVec3(cA));
    gl.uniform3fv(gl.getUniformLocation(prg, "cB"), hexToVec3(cB));
    gl.uniform3fv(gl.getUniformLocation(prg, "cC"), hexToVec3(cC));

    const pt = { x: 0.5, y: 0.5 };
    let hv = 0;
    let hvT = 0;
    let visible = true;
    let raf = 0;

    const res = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      gl!.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(res);
    ro.observe(canvas);

    function onMove(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      pt.x = (e.clientX - r.left) / r.width;
      pt.y = 1 - (e.clientY - r.top) / r.height;
    }
    function onEnter() {
      hvT = 1;
    }
    function onLeave() {
      hvT = 0;
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(root);

    if (reduced) {
      res();
      gl!.uniform2f(rL, canvas.width, canvas.height);
      gl!.uniform1f(tL, 3);
      gl!.uniform2f(pL, 0.5, 0.5);
      gl!.uniform1f(hL, 0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      hv += (hvT - hv) * 0.1;
      gl!.useProgram(prg);
      gl!.uniform2f(rL, canvas!.width, canvas!.height);
      gl!.uniform1f(tL, now * 0.001);
      gl!.uniform2f(pL, pt.x, pt.y);
      gl!.uniform1f(hL, hv);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    }

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      gl!.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduced, cA, cB, cC]);

  return (
    <span
      data-aura-root
      className="group relative inline-flex h-8 w-auto cursor-pointer items-center justify-center rounded-full transition-transform duration-300 hover:scale-[1.02] sm:h-[54px] sm:w-auto sm:min-w-[230px]"
      style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.4))" }}
    >
      {/* volumetric under-glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-4 left-1/2 h-12 w-[130%] -translate-x-1/2 rounded-full opacity-60 blur-[30px] transition-opacity duration-300 group-hover:opacity-100 sm:-bottom-7 sm:h-20 sm:blur-[44px]"
        style={{ background: glow }}
      />

      {/* core WebGL dengan fallback gradient */}
      <span
        className="absolute inset-[3px] overflow-hidden rounded-full border border-white/40 shadow-[inset_0_2px_12px_rgba(255,255,255,0.7)]"
        style={{ background: `linear-gradient(120deg, ${cA}, ${cB} 55%, ${cC})` }}
      >
        <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
      </span>

      {/* glossy glass shell */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[3px] overflow-hidden rounded-full"
      >
        <span className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/10 opacity-70" />
        <span className="absolute inset-0 rounded-full border border-white/90 shadow-[inset_0_6px_12px_rgba(255,255,255,0.4),inset_0_-6px_12px_rgba(0,0,0,0.15)]" />
      </span>

      {/* label */}
      <span className="relative z-10 flex items-center px-4 text-white drop-shadow-md sm:px-6">
        <span className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase sm:text-sm">
          {label}
        </span>
      </span>
    </span>
  );
}
