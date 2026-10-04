import Link from "next/link";
import { listByTrack } from "@/lib/db";
import { PortfolioCard, trackMeta } from "@/components/portfolio-card";
import { Parallax, Reveal, DepthStage } from "@/components/parallax";
import type { Track } from "@/lib/types";

export async function TrackPortfolioPage({ track }: { track: Track }) {
  const items = await listByTrack(track);
  const meta = trackMeta[track];
  const isSi = track === "si";
  const accent = isSi ? "var(--si)" : "var(--web3)";

  return (
    <main className="aura relative min-h-screen overflow-x-hidden">
      {/* header — flat, tegas */}
      <header className="sticky top-0 z-20 border-b border-border bg-bg">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-text-3 transition-colors hover:text-text sm:text-xs"
            >
              <span aria-hidden>←</span> FEYBER
            </Link>
            <span className="h-4 w-px bg-border" aria-hidden />
            <div className="flex min-w-0 items-center gap-2">
              <span className={meta.dotClass} />
              <span className="truncate text-sm font-semibold tracking-tight">
                {meta.label}
              </span>
            </div>
          </div>
          <Link
            href={isSi ? "/web3" : "/si"}
            className="shrink-0 border border-border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-text-2 transition-colors hover:border-border-strong hover:text-text sm:text-xs"
          >
            {isSi ? "WEB3" : "SI"}
          </Link>
        </div>
      </header>

      {/* hero — parallax stack */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
        {/* floating deco orbs */}
        <Parallax speed={-0.25} className="pointer-events-none absolute inset-0">
          <div
            className={`absolute right-10 top-8 h-40 w-40 rounded-full blur-3xl ${
              isSi ? "bg-si/20" : "bg-web3/20"
            }`}
          />
          <div
            className={`absolute left-4 top-24 h-24 w-24 rounded-full blur-2xl ${
              isSi ? "bg-si/10" : "bg-web3/10"
            }`}
          />
        </Parallax>

        <Parallax speed={-0.1}>
          <Reveal>
            <p className="label" style={{ color: accent }}>
              {isSi ? "Orbit 01" : "Orbit 02"}
            </p>
            <h1 className="display mt-5 text-[clamp(2.4rem,5.5vw,3.8rem)]">
              {meta.label}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-text-2">{meta.blurb}</p>
          </Reveal>
        </Parallax>

        <Parallax speed={0.12}>
          <Reveal delay={0.1}>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-2.5">
              <span className={meta.dotClass} />
              <span className="text-sm text-text-2">
                <span className="font-semibold text-text">{items.length}</span>{" "}
                karya terkurasi
              </span>
            </div>
          </Reveal>
        </Parallax>
      </section>

      {/* grid */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
        {items.length === 0 ? (
          <Reveal>
            <div className="lift flex flex-col items-center gap-4 rounded-[1.25rem] border border-border bg-surface px-8 py-20 text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isSi ? "bg-si-soft" : "bg-web3-soft"
                }`}
              >
                <span className={meta.dotClass} />
              </div>
              <h2 className="display text-2xl">Orbit masih kosong</h2>
              <p className="max-w-md text-text-3">
                Karya untuk track {meta.label} akan muncul di sini dalam waktu
                dekat.
              </p>
              <Link href="/" className="btn btn-ghost mt-2 lift">
                Kembali ke beranda
              </Link>
            </div>
          </Reveal>
        ) : (
          <DepthStage className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <PortfolioCard
                key={item.id}
                item={item}
                track={track}
                index={i}
              />
            ))}
          </DepthStage>
        )}
      </section>

      {/* footer */}
      <footer className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-12">
        <Parallax speed={0.06}>
          <div className="flex items-center justify-between border-t border-border/70 pt-8">
            <Link
              href="/"
              className="text-sm text-text-4 transition-colors hover:text-text"
            >
              ← Beranda
            </Link>
            <p className="label">FEYBER</p>
          </div>
        </Parallax>
      </footer>
    </main>
  );
}
