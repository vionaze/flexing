import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { MediaType, PortfolioData, PortfolioItem, Track } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PORTFOLIO_PATH = path.join(DATA_DIR, "portfolio.json");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PORTFOLIO_PATH);
  } catch {
    await fs.writeFile(
      PORTFOLIO_PATH,
      JSON.stringify({ items: [] } satisfies PortfolioData, null, 2),
      "utf8"
    );
  }
}

export async function readPortfolio(): Promise<PortfolioData> {
  await ensureDataFile();
  const raw = await fs.readFile(PORTFOLIO_PATH, "utf8");
  const parsed = JSON.parse(raw) as PortfolioData;
  return { items: parsed.items ?? [] };
}

export async function writePortfolio(data: PortfolioData): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(PORTFOLIO_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function listByTrack(track: Track): Promise<PortfolioItem[]> {
  const data = await readPortfolio();
  return data.items
    .filter((item) => item.track === track)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getItem(id: string): Promise<PortfolioItem | null> {
  const data = await readPortfolio();
  return data.items.find((item) => item.id === id) ?? null;
}

export interface CreateItemInput {
  track: Track;
  title: string;
  description: string;
  url: string;
  tags?: string[];
  image?: string;
  source?: "ai" | "manual";
  mediaUrl?: string;
  mediaType?: MediaType;
  category?: string;
  date?: string;
  keterangan?: string;
}

export async function createItem(input: CreateItemInput): Promise<PortfolioItem> {
  const data = await readPortfolio();
  const now = new Date().toISOString();
  const item: PortfolioItem = {
    id: randomUUID(),
    track: input.track,
    title: input.title.trim(),
    description: input.description.trim(),
    url: input.url.trim(),
    tags: input.tags ?? [],
    image: input.image,
    source: input.source ?? "manual",
    mediaUrl: input.mediaUrl,
    mediaType: input.mediaType,
    category: input.category,
    date: input.date,
    keterangan: input.keterangan,
    createdAt: now,
    updatedAt: now,
  };
  data.items.push(item);
  await writePortfolio(data);
  return item;
}

export interface UpdateItemInput {
  title?: string;
  description?: string;
  url?: string;
  track?: Track;
  tags?: string[];
  image?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  category?: string;
  date?: string;
  keterangan?: string;
}

export async function updateItem(
  id: string,
  patch: UpdateItemInput
): Promise<PortfolioItem | null> {
  const data = await readPortfolio();
  const index = data.items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = data.items[index];
  const updated: PortfolioItem = {
    ...current,
    ...Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    ),
    updatedAt: new Date().toISOString(),
  };
  data.items[index] = updated;
  await writePortfolio(data);
  return updated;
}

export async function deleteItem(id: string): Promise<boolean> {
  const data = await readPortfolio();
  const before = data.items.length;
  data.items = data.items.filter((item) => item.id !== id);
  if (data.items.length === before) return false;
  await writePortfolio(data);
  return true;
}
