export type Track = "si" | "web3";

export interface PortfolioItem {
  id: string;
  track: Track;
  title: string;
  description: string;
  url: string;
  tags: string[];
  image?: string;
  source: "ai" | "manual";
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
