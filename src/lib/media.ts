export type MediaType = "video" | "image";

/** Deteksi otomatis tipe media dari URL (video vs gambar) */
export function detectMediaType(url: string): MediaType {
  const u = url.toLowerCase().split("?")[0].split("#")[0];
  if (/\.(mp4|webm|mov|m4v|m3u8|ogv)$/.test(u)) return "video";
  if (/youtu\.be|youtube\.com|vimeo\.com|tiktok\.com/.test(u)) return "video";
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(u)) return "image";
  return "image";
}
