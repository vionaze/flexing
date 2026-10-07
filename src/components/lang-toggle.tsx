"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();

  function set(next: Lang) {
    if (next === lang) return;
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center rounded-full border border-border p-0.5 font-mono text-[0.62rem] tracking-wider">
      {(["en", "id"] as const).map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          className={`rounded-full px-2 py-0.5 transition-colors ${
            lang === l
              ? "bg-white/10 text-text"
              : "text-text-4 hover:text-text-2"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
