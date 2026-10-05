import Link from "next/link";
import Image from "next/image";
import { listByTrack } from "@/lib/db";
import {
  Parallax,
  Reveal,
  Tilt3D,
  DepthStage,
} from "@/components/parallax";
import { UnicornAura, AURA_PROJECT_ID } from "@/components/unicorn-aura";
import { LiquidFill } from "@/components/liquid-card";
import { AuraButton } from "@/components/aura-button";
import { Navbar } from "@/components/navbar";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [siItems, web3Items] = await Promise.all([
    listByTrack("si"),
    listByTrack("web3"),
  ]);
  const total = siItems.length + web3Items.length;
  /* liquid = progres menuju 100 karya per track: batas bawah 10% kartu (biar
     gelombangnya selalu terlihat), mentok 90% saat 100 karya */
  const siLevel = 0.1 + 0.8 * Math.min(1, siItems.length / 100);
  const web3Level = 0.1 + 0.8 * Math.min(1, web3Items.length / 100);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* ============ BACKGROUND — UnicornStudio aura (fixed, di balik semua) ============ */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {/* fallback glow — tampil kalau script UnicornStudio gagal dimuat */}
        <div className="absolute -left-32 top-1/3 h-[55vh] w-[55vw] rounded-full bg-si/15 blur-[120px]" />
        <div className="absolute -right-24 bottom-[-12%] h-[50vh] w-[50vw] rounded-full bg-web3/10 blur-[120px]" />
        <UnicornAura projectId={AURA_PROJECT_ID} />
      </div>

      {/* ============ HERO ============ */}
      <div className="relative min-h-[92vh] overflow-hidden">
        <Navbar />

        {/* readability veil — meredupkan aura agar teks terbaca */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(23,23,23,0.82) 0%, rgba(23,23,23,0.55) 48%, rgba(23,23,23,0.35) 100%)",
          }}
        />

        {/* hero content — big name, bio, dual CTA, info, visual + stats */}
        <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-14 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:pt-14">
          {/* LEFT — nama besar, bio, CTA, info (gaya referensi) */}
          <div>
            <Reveal>
              <h1 className="display text-[clamp(3rem,8.5vw,6rem)] font-bold">
                Christhi
                <br />
                Feyber
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-xl leading-relaxed text-text-2 sm:text-2xl">
                Super Intelligence / AI &amp; WEB3 Content Creator — I&apos;m
                an AI and Web3 creator from Indonesia. I get to new image and
                video models early, run them through real projects, and AI
                filmmaking experiments.
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="#works"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#141414] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <span aria-hidden>→</span> View Works
                </Link>
                <a
                  href="mailto:me@feyber.asia"
                  className="inline-flex items-center gap-2.5 rounded-full border border-border bg-white/[0.04] px-6 py-3 text-sm text-text-2 transition-colors hover:border-border-strong hover:text-text"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                  me@feyber.asia
                </a>
              </div>
            </Reveal>

            {/* info row — reveal ke atas saat halaman dibuka */}
            <Reveal delay={0.2} mount>
              <div className="mt-8 grid gap-5 sm:grid-cols-3 sm:gap-6">
                <div className="flex items-start gap-3 border-t border-border pt-4">
                  <span className="mt-0.5 text-text-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <p className="text-sm font-medium leading-snug">
                    Based in Jakarta, Indonesia
                  </p>
                </div>
                <div className="flex items-start gap-3 border-t border-border pt-4">
                  <span className="mt-0.5 text-text-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
                    </svg>
                  </span>
                  <p className="text-sm font-medium leading-snug">
                    AI and WEB3 creator
                  </p>
                </div>
                <div className="flex items-start gap-3 border-t border-border pt-4">
                  <span className="mt-0.5 text-success">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <p className="text-sm font-medium leading-snug">
                    Currently available for work
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT — visual panel + overlay stats */}
          <Reveal delay={0.16}>
            <div className="relative mx-auto w-full max-w-md">
              {/* portrait-style frame */}
              <Tilt3D max={6} scale={1.015}>
                <div className="lift overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.05] backdrop-blur-xl">
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src="/hero-avatar.jpg"
                      alt="Avatar FEYBER — karakter kartun berambut ungu yang mengedip"
                      fill
                      priority
                      sizes="(min-width: 1024px) 448px, 100vw"
                      className="object-cover"
                    />
                    {/* bottom gradient scrim */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-1/2"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(23,23,23,0.92) 0%, transparent 100%)",
                      }}
                    />
                    {/* overlay stats */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { k: "Total", v: String(total).padStart(2, "0") },
                          {
                            k: "SI",
                            v: String(siItems.length).padStart(2, "0"),
                          },
                          {
                            k: "WEB3",
                            v: String(web3Items.length).padStart(2, "0"),
                          },
                        ].map((s) => (
                          <div
                            key={s.k}
                            className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2.5 backdrop-blur-md"
                          >
                            <p className="label !text-text-3">{s.k}</p>
                            <p className="mt-0.5 text-xl font-semibold tracking-tight">
                              {s.v}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt3D>

              {/* doodle tags — tulisan tangan mengambang di atas foto */}
              <span
                className="animate-doodle-float absolute -left-4 top-4 z-10"
                style={
                  {
                    "--tilt": "-5deg",
                    transform: "rotate(-5deg)",
                    animationDuration: "5.2s",
                  } as React.CSSProperties
                }
              >
                <span className="relative inline-block">
                  <svg
                    aria-hidden
                    className="absolute -inset-x-4 -inset-y-2.5 h-[calc(100%+20px)] w-[calc(100%+32px)]"
                    viewBox="0 0 140 56"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M70 6c30-3 64 4 65 22s-30 26-66 25S4 45 5 27 38 6 74 7"
                      stroke="#c084fc"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-doodle text-3xl font-bold leading-none text-white">
                    Super Intelligence
                  </span>
                </span>
              </span>

              <span
                className="animate-doodle-float absolute -right-5 top-[64%] z-10 sm:-right-[9%]"
                style={
                  {
                    "--tilt": "3deg",
                    transform: "rotate(3deg)",
                    animationDuration: "6.4s",
                    animationDelay: "0.9s",
                  } as React.CSSProperties
                }
              >
                <span className="relative inline-block">
                  <svg
                    aria-hidden
                    className="absolute -inset-x-4 -inset-y-2.5 h-[calc(100%+20px)] w-[calc(100%+32px)]"
                    viewBox="0 0 140 56"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M66 7c34-4 70 5 69 22s-34 25-68 24S5 46 6 28 34 6 70 8"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-doodle text-2xl font-bold leading-none text-web3">
                    WEB3 / Cryptocurrency
                  </span>
                </span>
              </span>
            </div>
          </Reveal>
        </section>
      </div>

      {/* ============ dual orbit cards ============ */}
      <section
        id="works"
        className="relative z-10 mx-auto flex w-full max-w-6xl scroll-mt-8 flex-col px-6 pb-0 pt-6"
      >
        {/* sapaan doodle — 30% lebih kecil dari nama */}
        <Reveal delay={0.05} mount>
          <p
            className="animate-doodle-float mb-10 text-center font-doodle text-[clamp(2.1rem,5.95vw,4.2rem)] font-bold leading-tight text-text-2 [--tilt:-2deg]"
            style={{ transform: "rotate(-2deg)" } as React.CSSProperties}
          >
            Hi anon, welcome to my portfolio page!
          </p>
        </Reveal>

        <DepthStage className="grid min-h-[70vh] gap-5 md:grid-cols-2" depth={900}>
          <Parallax speed={0.08}>
            <Tilt3D max={7} className="h-full">
              <Link
                href="/si"
                className="lift relative block h-full overflow-hidden rounded-[1.25rem] border border-border"
                style={{ background: "#071416", transformStyle: "preserve-3d" }}
              >
                <LiquidFill top="#12c9ad" deep="#04303d" glow="#4fe3c8" level={siLevel} />
                <div
                  className="relative z-10 flex h-full flex-col p-8"
                  style={{ transform: "translateZ(28px)" }}
                >
                  <p className="text-right text-4xl font-semibold tracking-tight text-text-3">
                    {String(siItems.length).padStart(2, "0")}
                  </p>
                  <div className="flex flex-1 flex-col items-center justify-center gap-9">
                    <h3 className="display text-center text-3xl uppercase leading-[1.05] sm:text-5xl">
                      <span className="text-white">Super</span>
                      <br />
                      <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-[#99f6e4] to-[#2dd4bf] bg-clip-text text-transparent">
                          Intelligence
                        </span>
                        <svg
                          aria-hidden
                          className="absolute -bottom-2 left-0 h-2.5 w-full sm:-bottom-3"
                          viewBox="0 0 200 12"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M2 9c32-6 64-6 98-3s72 2 98-3"
                            stroke="#2dd4bf"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </h3>
                    <AuraButton
                      label="ENTER"
                      cA="#ff3d6e"
                      cB="#d61f4d"
                      cC="#701234"
                      glow="rgba(255,61,110,0.32)"
                    />
                  </div>
                </div>
              </Link>
            </Tilt3D>
          </Parallax>

          <Parallax speed={-0.08}>
            <Tilt3D max={7} className="h-full">
              <Link
                href="/web3"
                className="lift relative block h-full overflow-hidden rounded-[1.25rem] border border-border"
                style={{ background: "#060d18", transformStyle: "preserve-3d" }}
              >
                <LiquidFill top="#0f7fd4" deep="#071c4d" glow="#4fa8ff" level={web3Level} />
                <div
                  className="relative z-10 flex h-full flex-col p-8"
                  style={{ transform: "translateZ(28px)" }}
                >
                  <p className="text-right text-4xl font-semibold tracking-tight text-text-3">
                    {String(web3Items.length).padStart(2, "0")}
                  </p>
                  <div className="flex flex-1 flex-col items-center justify-center gap-9">
                    <h3 className="display text-center text-3xl uppercase leading-[1.05] sm:text-5xl">
                      <span className="text-white">WEB3 /</span>
                      <br />
                      <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-[#93c5fd] to-[#3b82f6] bg-clip-text text-transparent">
                          Crypto
                        </span>
                        <svg
                          aria-hidden
                          className="absolute -bottom-2 left-0 h-2.5 w-full sm:-bottom-3"
                          viewBox="0 0 200 12"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M2 9c32-6 64-6 98-3s72 2 98-3"
                            stroke="#3b82f6"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </h3>
                    <AuraButton
                      label="ENTER"
                      cA="#a855f7"
                      cB="#7c3aed"
                      cC="#3b1a6e"
                      glow="rgba(168,85,247,0.35)"
                    />
                  </div>
                </div>
              </Link>
            </Tilt3D>
          </Parallax>
        </DepthStage>
      </section>

      {/* ============ FOOTER — copyright melayang di atas aura ============ */}
        <footer className="relative z-10 flex min-h-[140px] items-end justify-center px-6 pb-10 pt-6">
          <p className="text-sm text-text-3">
            © {new Date().getFullYear()} · FEYBER
          </p>
        </footer>
    </main>
  );
}
