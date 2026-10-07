import Link from "next/link";
import { listByTrack } from "@/lib/db";
import { PortfolioCard, trackMeta } from "@/components/portfolio-card";
import { Parallax, Reveal, DepthStage } from "@/components/parallax";
import { Navbar } from "@/components/navbar";
import { MediaEmbed } from "@/components/media-embed";
import { detectMediaType, isPlayableVideoUrl } from "@/lib/media";
import { getLang, t } from "@/lib/i18n";
import type { Track } from "@/lib/types";

export async function TrackPortfolioPage({
  track,
  underConstruction = false,
}: {
  track: Track;
  underConstruction?: boolean;
}) {
  const items = await listByTrack(track);
  const [featured, ...rest] = items;
  const meta = trackMeta[track];
  const lang = await getLang();
  const dict = t(lang);
  const isSi = track === "si";
  const accent = isSi ? "var(--si)" : "var(--web3)";
  const gradient = isSi
    ? "linear-gradient(90deg,#99f6e4,#2dd4bf)"
    : "linear-gradient(90deg,#93c5fd,#3b82f6)";
  function formatDateItem(iso: string): string {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  const labelParts = meta.label.split(" ");
  const labelHead = labelParts.slice(0, -1).join(" ");
  const labelTail = labelParts[labelParts.length - 1];

  return (
    <main className="aura relative min-h-screen overflow-x-hidden">
      {/* header — navbar sama dengan landing, track aktif tersorot */}
      <Navbar active={track} sticky lang={lang} />

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
            <h1 className="display text-[clamp(2.4rem,6vw,4.5rem)] uppercase leading-[1.05]">
              <span className="text-white">{labelHead}</span>{" "}
              <span className="relative inline-block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: gradient }}
                >
                  {labelTail}
                </span>
                <svg
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-2.5 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 9c32-6 64-6 98-3s72 2 98-3"
                    stroke={isSi ? "#2dd4bf" : "#3b82f6"}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </Reveal>
        </Parallax>
      </section>

      {/* grid + featured porto terbaru */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
        {underConstruction ? (
          <Reveal>
            <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[1.5rem] border border-border bg-surface/40 px-8 py-28 text-center">
              <div
                aria-hidden
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                  maskImage:
                    "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                }}
              />
              <span
                aria-hidden
                className="animate-float-slow absolute left-[12%] top-10 text-4xl"
              >
                🚧
              </span>
              <span
                aria-hidden
                className="animate-float-slow absolute bottom-10 right-[12%] text-4xl"
                style={{ animationDelay: "1.2s" }}
              >
                🚧
              </span>
              <h2
                className="font-doodle relative text-5xl sm:text-6xl"
                style={{ color: accent }}
              >
                {dict.constructionTitle}
              </h2>
              <p className="relative max-w-md text-lg text-text-2">
                {dict.constructionBody}
              </p>
              <span className="chip relative">{dict.eta}</span>
            </div>
          </Reveal>
        ) : items.length === 0 ? (
          <Reveal>
            <div className="lift flex flex-col items-center gap-4 rounded-[1.25rem] border border-border bg-surface px-8 py-20 text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isSi ? "bg-si-soft" : "bg-web3-soft"
                }`}
              >
                <span className={meta.dotClass} />
              </div>
              <h2 className="font-doodle text-4xl" style={{ color: accent }}>
                {dict.emptyTitle}
              </h2>
              <p className="max-w-md text-text-3">{dict.emptyBody}</p>
              <Link href="/" className="btn btn-ghost mt-2 lift">
                {dict.backHome}
              </Link>
            </div>
          </Reveal>
        ) : (
          <>
            {featured && (
              <Reveal>
                <div className="overflow-hidden rounded-[1.5rem] border border-border bg-surface/40">
                  <div className="aspect-video w-full bg-bg-2">
                    {(() => {
                      const liveType = featured.mediaUrl
                        ? detectMediaType(featured.mediaUrl)
                        : featured.mediaType ?? "image";
                      const videoSrc =
                        liveType === "video"
                          ? featured.mediaUrl ?? null
                          : featured.mediaType === "video" &&
                              isPlayableVideoUrl(featured.url)
                            ? featured.url
                            : null;
                      const poster =
                        liveType === "image" ? featured.mediaUrl : undefined;
                      if (videoSrc)
                        return (
                          <MediaEmbed
                            url={videoSrc}
                            poster={poster}
                            className="h-full w-full"
                          />
                        );
                      if (featured.mediaUrl && liveType === "image")
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featured.mediaUrl}
                            alt={featured.title}
                            className="h-full w-full object-cover"
                          />
                        );
                      if (featured.image)
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featured.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        );
                      return (
                        <div
                          className={`h-full w-full bg-gradient-to-br ${
                            isSi
                              ? "from-si/20 via-transparent to-web3/5"
                              : "from-web3/20 via-transparent to-si/5"
                          }`}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
                    <div className="min-w-0">
                      <p className="label">
                        {lang === "id" ? "karya terbaru" : "latest work"}
                      </p>
                      <h2 className="display mt-1.5 text-2xl sm:text-3xl">
                        {lang === "id" && featured.titleId
                          ? featured.titleId
                          : featured.title}
                      </h2>
                      {featured.track === "web3" && featured.roleDesc && (
                        <p className="mt-1 line-clamp-2 text-sm text-text-2">
                          {featured.roleDesc}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-text-4">
                        {[
                          featured.track === "web3" && featured.yearStart
                            ? `${featured.yearStart} – ${featured.yearEnd === "now" ? "now" : featured.yearEnd}`
                            : featured.date
                              ? featured.dateEnd
                                ? `${formatDateItem(featured.date)} – ${formatDateItem(featured.dateEnd)}`
                                : formatDateItem(featured.date)
                              : null,
                          featured.category,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <a
                      href={featured.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm shrink-0"
                    >
                      {lang === "id" ? "Lihat karya" : "View work"}{" "}
                      <span aria-hidden>↗</span>
                    </a>
                  </div>
                </div>
              </Reveal>
            )}

            {rest.length > 0 && (
              <DepthStage className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((item, i) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    track={track}
                    index={i + 1}
                    lang={lang}
                  />
                ))}
              </DepthStage>
            )}
          </>
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
