"use client";

import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";

/* -------------------------------------------------------------------------- */
/*  Capability hooks — hormati prefers-reduced-motion & device tanpa hover     */
/* -------------------------------------------------------------------------- */

function useCanHover() {
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return canHover;
}

/* -------------------------------------------------------------------------- */
/*  Scroll parallax layer — keeps GPU work on transform only                     */
/* -------------------------------------------------------------------------- */

export function Parallax({
  children,
  speed = 0.2,
  className = "",
  style,
}: {
  children: ReactNode;
  /** -1 = paling jauh (bergerak cepat berlawanan), 0.2 = halus */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * -120, speed * 120]);
  const ySmooth = useSpring(y, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <div ref={ref} className={className} style={style}>
      {reduced ? (
        children
      ) : (
        <motion.div className="h-full" style={{ y: ySmooth }}>
          {children}
        </motion.div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mouse-tilt 3D wrapper                                                      */
/* -------------------------------------------------------------------------- */

export function Tilt3D({
  children,
  max = 10,
  scale = 1.02,
  className = "",
  perspective = 1000,
}: {
  children: ReactNode;
  max?: number;
  scale?: number;
  className?: string;
  perspective?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("none");
  const [glow, setGlow] = useState({ x: 50, y: 50, on: false });
  const reduced = useReducedMotion();
  const canHover = useCanHover();
  const active = !reduced && canHover;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;

    setTransform(
      `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale}, ${scale}, ${scale})`
    );
    setGlow({ x: px * 100, y: py * 100, on: true });
  }

  function onLeave() {
    setTransform(
      `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    );
    setGlow((g) => ({ ...g, on: false }));
  }

  if (!active) {
    return (
      <div
        className={className}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative h-full" style={{ transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      style={{ transform, transformStyle: "preserve-3d" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: glow.on ? 1 : 0,
          background: `radial-gradient(380px circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.07), transparent 55%)`,
        }}
      />
      <div className="relative h-full" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Depth stack — parent yang menyimpan preserve-3d untuk anak translateZ       */
/* -------------------------------------------------------------------------- */

export function DepthStage({
  children,
  className = "",
  depth = 900,
}: {
  children: ReactNode;
  className?: string;
  depth?: number;
}) {
  return (
    <div
      className={className}
      style={{ perspective: `${depth}px`, transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reveal on scroll (dipakai section, bukan load-only)                         */
/* -------------------------------------------------------------------------- */

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 32,
  mount = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** true = animasi jalan saat mount, tanpa menunggu elemen masuk viewport */
  mount?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(mount
        ? { animate: { opacity: 1, y: 0 } }
        : {
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-80px" },
          })}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pointer parallax for hero scene                                            */
/* -------------------------------------------------------------------------- */

export function usePointerTilt(strength = 1) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, ready: false });
  const reduced = useReducedMotion();
  const canHover = useCanHover();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !canHover) return;

    let frame = 0;
    const node = el;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = node.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setTilt({
          rx: -py * 12 * strength,
          ry: px * 16 * strength,
          ready: true,
        });
      });
    }

    function onLeave() {
      setTilt({ rx: 0, ry: 0, ready: true });
    }

    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [strength, reduced, canHover]);

  return { ref, tilt };
}
