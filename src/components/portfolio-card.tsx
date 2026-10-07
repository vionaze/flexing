import type { PortfolioItem, Track } from "@/lib/types";
import { Tilt3D, Parallax } from "./parallax";

function formatDate(iso: string): string {
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

export const trackMeta: Record<
  Track,
  {
    label: string;
    short: string;
    blurb: string;
    chipClass: string;
    dotClass: string;
  }
> = {
  si: {
    label: "Super Intelligence",
    short: "SI",
    blurb: "AI, data, engineering, dan karya riset.",
    chipClass: "chip-si",
    dotClass: "dot-si",
  },
  web3: {
    label: "WEB3 / Crypto",
    short: "WEB3",
    blurb: "Blockchain, DeFi, NFT, dan on-chain product.",
    chipClass: "chip-web3",
    dotClass: "dot-web3",
  },
};

export function TrackBadge({ track }: { track: Track }) {
  const meta = trackMeta[track];
  return (
    <span className={`chip ${meta.chipClass}`}>
      <span className={meta.dotClass} />
      {meta.short}
    </span>
  );
}

export function PortfolioCard({
  item,
  track,
  index,
}: {
  item: PortfolioItem;
  track: Track;
  index: number;
}) {
  const meta = trackMeta[track];

  return (
    <Parallax speed={index % 2 === 0 ? 0.05 : -0.05}>
      <Tilt3D max={8} className="h-full">
        <article className="lift group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border bg-surface/60 backdrop-blur-xl">
          <div
            className="relative h-40 w-full overflow-hidden bg-bg-2"
            style={{ transformStyle: "preserve-3d" }}
          >
            {item.mediaUrl && item.mediaType === "video" ? (
              <video
                src={item.mediaUrl}
                controls
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : item.mediaUrl && item.mediaType === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt=""
                className="h-full w-full object-cover opacity-85 transition-all duration-500 hover:scale-[1.03] hover:opacity-100"
              />
            ) : (
              <div
                className="relative flex h-full w-full items-center justify-center overflow-hidden"
                style={{
                  background:
                    track === "si"
                      ? "linear-gradient(140deg, rgba(192,132,252,0.16) 0%, rgba(23,23,23,0.2) 60%)"
                      : "linear-gradient(140deg, rgba(251,191,36,0.14) 0%, rgba(23,23,23,0.2) 60%)",
                }}
              >
                {/* grid pattern halus — nyambung dengan visual hero */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
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
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-md ${
                    track === "si" ? "bg-si-soft" : "bg-web3-soft"
                  }`}
                  style={{ transform: "translateZ(20px)" }}
                >
                  <span
                    className={`display text-xl ${
                      track === "si" ? "text-si" : "text-web3"
                    }`}
                  >
                    {item.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            <div
              className="absolute left-3.5 top-3.5"
              style={{ transform: "translateZ(24px)" }}
            >
              <span className="chip">{String(index + 1).padStart(2, "0")}</span>
            </div>
          </div>

          <div
            className="flex flex-1 flex-col gap-3 p-5"
            style={{ transform: "translateZ(16px)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="display text-lg leading-snug">{item.title}</h3>
              <span className={meta.dotClass + " mt-2 shrink-0"} />
            </div>

            {(item.date || item.category) && (
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-text-4">
                {item.date ? formatDate(item.date) : ""}
                {item.date && item.category ? " · " : ""}
                {item.category}
              </p>
            )}

            <p className="flex-1 text-sm leading-relaxed text-text-2">
              {item.description}
            </p>

            {item.keterangan && (
              <p className="text-xs leading-relaxed text-text-4">
                {item.keterangan}
              </p>
            )}

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-0.5 text-[0.72rem] text-text-3"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-text-2 transition-colors hover:text-text"
            >
              Lihat karya
              <span
                aria-hidden
                className="text-text-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-text"
              >
                ↗
              </span>
            </a>
          </div>
        </article>
      </Tilt3D>
    </Parallax>
  );
}
