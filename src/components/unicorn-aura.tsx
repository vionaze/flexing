"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init: () => void;
    };
  }
}

const SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";

function ensureScript(onReady: () => void) {
  if (typeof window === "undefined") return;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${SCRIPT_SRC}"]`
  );

  if (window.UnicornStudio) {
    if (!window.UnicornStudio.isInitialized) {
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
    }
    onReady();
    return;
  }

  if (existing) {
    existing.addEventListener("load", () => {
      if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
      onReady();
    });
    return;
  }

  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  script.async = true;
  script.onload = () => {
    if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
    }
    onReady();
  };
  (document.head || document.body).appendChild(script);
}

/**
 * Animated Aura Background — UnicornStudio (aura.build)
 * @param projectId data-us-project dari embed code
 */
export function UnicornAura({
  projectId,
  className = "",
}: {
  projectId: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      ensureScript(() => {
        // init ulang untuk node yang baru mount
        if (window.UnicornStudio?.init) {
          try {
            window.UnicornStudio.init();
          } catch {
            /* already running */
          }
        }
      });
    };

    /* script WebGL paling berat — tunda sampai halaman interaktif */
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(start, { timeout: 3500 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(id);
      };
    }
    const t = window.setTimeout(start, 1500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-us-project={projectId}
      className={`pointer-events-none absolute left-0 top-0 z-0 h-full w-full ${className}`}
      aria-hidden
    />
  );
}

export const AURA_PROJECT_ID = "p7Ff6pfTrb5Gs59C7nLC";
