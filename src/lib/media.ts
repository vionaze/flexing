export type MediaType = "video" | "image";

/** Deteksi otomatis tipe media dari URL (video vs gambar) */
export function detectMediaType(url: string): MediaType {
  const clean = url.toLowerCase();
  const u = clean.split("?")[0].split("#")[0];
  if (/\.(mp4|webm|mov|m4v|m3u8|ogv)$/.test(u)) return "video";
  if (/youtu\.be|youtube\.com|vimeo\.com|video\.twimg\.com|tiktok\.com/.test(clean))
    return "video";
  if (/format=(jpg|jpeg|png|webp|gif)/.test(clean)) return "image";
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(u)) return "image";
  return "image";
}

/** URL yang bisa diputar via MediaEmbed (native/iframe/ekstraksi X) */
export function isPlayableVideoUrl(url: string): boolean {
  return /youtu\.be|youtube\.com|vimeo\.com|(?:x|twitter)\.com\/\w+\/status\/|video\.twimg\.com|\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(
    url
  );
}
