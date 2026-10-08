import type { ReactNode } from "react";

/** Badge tanggal emas — rounded, gradient gold, glow shadow */
export function DateBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-gradient-to-b from-amber-200/20 to-amber-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber-200 shadow-[0_2px_14px_rgba(251,191,36,0.28),inset_0_1px_0_rgba(255,255,255,0.18)]">
      <svg
        aria-hidden
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      {children}
    </span>
  );
}
