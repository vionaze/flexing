"use client";

import { useEffect, useRef } from "react";

const SPLINE_SRC =
  "https://my.spline.design/glowingplanetparticles-HmCVKutonlFn3Oqqe6DI9nWi/";

/**
 * Hero background — Spline glowing planet particles (iframe, z-0).
 */
export function SplineBackground({
  className = "",
}: {
  className?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Biarkan iframe bernapas; sisakan tanpa JS berat.
    const el = ref.current;
    if (el) el.setAttribute("loading", "eager");
  }, []);

  return (
    <div
      className={`spline-container absolute left-0 top-0 z-0 h-full w-full ${className}`}
      aria-hidden
    >
      <iframe
        ref={ref}
        src={SPLINE_SRC}
        title="Spline glowing planet"
        frameBorder="0"
        width="100%"
        height="100%"
        id="aura-spline"
        className="pointer-events-none h-full w-full"
        allow="autoplay; fullscreen"
        style={{ border: 0 }}
      />
    </div>
  );
}
