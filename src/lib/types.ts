export type Track = "si" | "web3";

export type MediaType = "video" | "image";

export const PORTO_CATEGORIES = [
  "porto video",
  "porto cpp",
  "porto contest winner",
  "award",
  "porto gambar",
] as const;

export interface PortfolioItem {
  id: string;
  track: Track;
  title: string;
  description: string;
  url: string;
  tags: string[];
  image?: string;
  source: "ai" | "manual";
  /* SI: media + metadata tambahan */
  mediaUrl?: string;
  mediaType?: MediaType;
  category?: string;
  date?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioData {
  items: PortfolioItem[];
}

export type LogAction =
  | "init"
  | "login"
  | "logout"
  | "login_failed"
  | "create"
  | "update"
  | "delete"
  | "enrich"
  | "settings";

export interface LogEntry {
  timestamp: string;
  action: LogAction;
  actor: string;
  summary: string;
  detail?: string;
}
