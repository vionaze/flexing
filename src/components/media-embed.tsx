"use client";

import { useEffect, useState } from "react";

type Parsed =
  | { kind: "file"; url: string }
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "x"; id: string }
  | { kind: "unknown"; url: string };

function parse(url: string): Parsed {
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { kind: "youtube", id: yt[1] };
  const vm = u.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "vimeo", id: vm[1] };
  const x = u.match(/(?:x|twitter)\.com\/\w+\/status\/(\d+)/);
  if (x) return { kind: "x", id: x[1] };
  if (/\.(mp4|webm|mov|m4v|m3u8|ogv)(\?|#|$)/i.test(u))
    return { kind: "file", url: u };
  return { kind: "unknown", url: u };
}

/**
 * Player media serbaguna: file video langsung, YouTube, Vimeo,
 * dan link X/Twitter (video diekstrak via syndication CDN).
 */
export function MediaEmbed({
  url,
  poster,
  className = "",
}: {
  url: string;
  poster?: string;
  className?: string;
}) {
  const parsed = parse(url);
  const [xVideo, setXVideo] = useState<string | null>(null);
  const [xFail, setXFail] = useState(false);

  useEffect(() => {
    if (parsed.kind !== "x") return;
    let alive = true;
    fetch(
      `https://cdn.syndication.twimg.com/tweet-result?token=a&id=${parsed.id}&lang=en`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http"))))
      .then((d) => {
        if (!alive) return;
        const variants: Array<{
          bitrate?: number;
          content_type?: string;
          url: string;
        }> = d.videoUrls ?? d.mediaDetails?.variants ?? [];
        const mp4s = variants.filter((v) =>
          (v.content_type ?? v.url).includes("mp4")
        );
        const best = mp4s.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
        if (best?.url) setXVideo(best.url);
        else setXFail(true);
      })
      .catch(() => {
        if (alive) setXFail(true);
      });
    return () => {
      alive = false;
    };
  }, [parsed]);

  if (parsed.kind === "youtube")
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${parsed.id}`}
        title="video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
        className={`border-0 ${className}`}
      />
    );

  if (parsed.kind === "vimeo")
    return (
      <iframe
        src={`https://player.vimeo.com/video/${parsed.id}`}
        title="video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className={`border-0 ${className}`}
      />
    );

  if (parsed.kind === "x") {
    if (xVideo)
      return (
        <video
          src={xVideo}
          poster={poster}
          controls
          playsInline
          className={className}
        />
      );
    if (xFail)
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-text-4">
          <span>Video X tidak dapat dimuat otomatis.</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-2 underline underline-offset-4 hover:text-text"
          >
            Buka di X ↗
          </a>
        </div>
      );
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-4">
        Memuat video X…
      </div>
    );
  }

  /* file langsung & URL tak dikenal — coba player native */
  return (
    <video
      src={parsed.kind === "file" ? parsed.url : url}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
