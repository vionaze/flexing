"use client";

import { useScroll, useTransform, useSpring, motion } from "motion/react";
import { useRef } from "react";
import { usePointerTilt, DepthStage } from "./parallax";

function FloatingCard({
  title,
  accent,
  z,
  delay,
  className = "",
}: {
  title: string;
  accent: "si" | "web3";
  z: number;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md ${className}`}
      style={{
        transform: `translateZ(${z}px)`,
        boxShadow: "0 24px 60px -30px rgba(0,0,0,0.65)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            accent === "si" ? "dot-si" : "dot-web3"
          }`}
        />
        <span className="label !text-text-3">{title}</span>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-2 w-20 rounded-full bg-white/15" />
        <div className="h-2 w-14 rounded-full bg-white/10" />
      </div>
    </motion.div>
  );
}

function CssCube({ size = 88 }: { size?: number }) {
  const half = size / 2;
  const faces = [
    { t: `rotateY(0deg) translateZ(${half}px)`, c: "bg-si/25" },
    { t: `rotateY(180deg) translateZ(${half}px)`, c: "bg-si/15" },
    { t: `rotateY(90deg) translateZ(${half}px)`, c: "bg-web3/20" },
    { t: `rotateY(-90deg) translateZ(${half}px)`, c: "bg-white/10" },
    { t: `rotateX(90deg) translateZ(${half}px)`, c: "bg-white/15" },
    { t: `rotateX(-90deg) translateZ(${half}px)`, c: "bg-si/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
        transform: `translateZ(70px) rotateX(-18deg) rotateY(32deg)`,
        animation: "cube-spin 18s linear infinite",
      }}
    >
      {faces.map((f, i) => (
        <div
          key={i}
          className={`absolute inset-0 rounded-xl border border-white/20 ${f.c}`}
          style={{ transform: f.t }}
        />
      ))}
    </motion.div>
  );
}

function GlowRing({ size = 220, accent = "#c084fc" }: { size?: number; accent?: string }) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        border: `1px solid ${accent}`,
        opacity: 0.35,
        transform: "translateZ(-40px) rotateX(66deg)",
        animation: "ring-pulse 7s ease-in-out infinite",
      }}
    />
  );
}

function DotField() {
  const dots = [
    { x: "12%", y: "22%", s: 6, z: -60, a: "si" },
    { x: "78%", y: "18%", s: 5, z: 30, a: "web3" },
    { x: "22%", y: "70%", s: 4, z: 50, a: "si" },
    { x: "70%", y: "72%", s: 7, z: -20, a: "web3" },
    { x: "48%", y: "40%", s: 4, z: 90, a: "si" },
    { x: "88%", y: "48%", s: 5, z: -80, a: "si" },
    { x: "8%", y: "50%", s: 5, z: 10, a: "web3" },
    { x: "58%", y: "12%", s: 4, z: 60, a: "si" },
  ];

  return (
    <>
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full ${d.a === "si" ? "bg-si" : "bg-web3"}`}
          style={{
            left: d.x,
            top: d.y,
            width: d.s,
            height: d.s,
            transform: `translateZ(${d.z}px)`,
            boxShadow: `0 0 ${d.s * 3}px ${
              d.a === "si" ? "rgba(192,132,252,0.7)" : "rgba(251,191,36,0.7)"
            }`,
            animation: `float-slow ${5 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}
    </>
  );
}

export function Css3DHero({
  className = "",
  fill = false,
}: {
  className?: string;
  /** true = isi parent sepenuhnya, tanpa frame (dipakai di panel hero landing) */
  fill?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const { ref: tiltRef, tilt } = usePointerTilt(1);

  const { scrollY } = useScroll();
  const sceneY = useSpring(useTransform(scrollY, [0, 600], [0, 90]), {
    stiffness: 80,
    damping: 24,
  });
  const glowY = useSpring(useTransform(scrollY, [0, 600], [0, 140]), {
    stiffness: 70,
    damping: 26,
  });

  return (
    <div
      ref={wrap}
      className={
        fill
          ? `absolute inset-0 overflow-hidden bg-bg-2/30 ${className}`
          : `relative aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-bg-2/30 lg:ml-auto ${className}`
      }
    >
      {/* soft glow bed */}
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-si/20 blur-3xl" />
        <div className="absolute bottom-6 right-6 h-40 w-40 rounded-full bg-web3/15 blur-3xl" />
      </motion.div>

      {/* 3D stage */}
      <div ref={tiltRef} className="absolute inset-0">
        <DepthStage className="h-full w-full">
          <motion.div
            style={{
              y: sceneY,
              transformStyle: "preserve-3d",
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: tilt.ready ? "transform 120ms ease-out" : "none",
            }}
            className="relative h-full w-full"
          >
            {/* grid plane */}
            <div
              className="absolute inset-x-[-20%] bottom-[-5%] h-[70%] opacity-40"
              style={{
                transform: "translateZ(-80px) rotateX(68deg)",
                backgroundImage:
                  "linear-gradient(rgba(192,132,252,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(192,132,252,0.2) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
                maskImage:
                  "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, black 20%, transparent 72%)",
              }}
            />

            <GlowRing size={240} accent="#c084fc" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <CssCube size={96} />
            </div>

            <FloatingCard
              title="SI · Orbit"
              accent="si"
              z={55}
              delay={0.45}
              className="left-[8%] top-[16%] w-36"
            />
            <FloatingCard
              title="WEB3 · Orbit"
              accent="web3"
              z={40}
              delay={0.6}
              className="right-[8%] bottom-[32%] w-36"
            />

            <DotField />
          </motion.div>
        </DepthStage>
      </div>

      {/* badges */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-4">
        <span className="chip">CSS 3D</span>
        <span className="label">Move cursor</span>
      </div>
    </div>
  );
}
