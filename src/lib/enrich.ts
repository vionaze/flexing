import { scrapeUrl, type ScrapeResult } from "./scrape";
import { getEffectiveAiSettings } from "./settings";
import { detectMediaType, type MediaType } from "./media";
import type { Track } from "./types";

export interface EnrichResult {
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  tags: string[];
  track: Track;
  mediaType: MediaType;
  image?: string;
  source: "ai" | "manual";
  scrape: ScrapeResult;
}

interface AiEnrichPayload {
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  tags: string[];
  track: Track;
  mediaType: MediaType;
}

function isTrack(value: unknown): value is Track {
  return value === "si" || value === "web3";
}

function isMediaType(value: unknown): value is MediaType {
  return value === "video" || value === "image";
}

function heuristicTrack(scrape: ScrapeResult): Track {
  const haystack = `${scrape.title} ${scrape.description} ${scrape.textExcerpt}`.toLowerCase();
  const web3Signals = [
    "crypto",
    "blockchain",
    "web3",
    "defi",
    "nft",
    "token",
    "ethereum",
    "solana",
    "bitcoin",
    "wallet",
    "smart contract",
    "dao",
  ];
  const siSignals = [
    "ai",
    "artificial intelligence",
    "machine learning",
    "llm",
    "model",
    "agent",
    "intelligence",
    "neural",
    "data science",
    "super intelligence",
  ];

  const web3Score = web3Signals.filter((s) => haystack.includes(s)).length;
  const siScore = siSignals.filter((s) => haystack.includes(s)).length;

  if (web3Score === 0 && siScore === 0) return "si";
  return web3Score >= siScore ? "web3" : "si";
}

function heuristicTags(scrape: ScrapeResult): string[] {
  const text = `${scrape.title} ${scrape.description}`.toLowerCase();
  const candidates = [
    "ai",
    "machine learning",
    "llm",
    "agent",
    "web3",
    "crypto",
    "blockchain",
    "defi",
    "nft",
    "data",
    "design",
    "engineering",
    "product",
    "research",
  ];
  return candidates.filter((c) => text.includes(c)).slice(0, 5);
}

async function callLlm(scrape: ScrapeResult): Promise<AiEnrichPayload | null> {
  const { apiKey, baseUrl, model } = await getEffectiveAiSettings();
  if (!apiKey) return null;

  const prompt = `Kamu adalah kurator portfolio. Berdasarkan konten URL berikut, buatkan metadata portfolio.

URL: ${scrape.url}
Judul halaman: ${scrape.title}
Deskripsi meta: ${scrape.description}
Excerpt konten: ${scrape.textExcerpt.slice(0, 1500)}

Balas HANYA dengan JSON valid (tanpa markdown fence) dengan skema:
{
  "title": "portfolio title in ENGLISH, max 80 characters",
  "titleId": "judul versi Bahasa Indonesia, maksimal 80 karakter",
  "description": "portfolio description in ENGLISH, 2-3 sentences, max 400 characters",
  "descriptionId": "deskripsi versi Bahasa Indonesia, 2-3 kalimat, maksimal 400 karakter",
  "tags": ["tag1", "tag2", "tag3"],
  "track": "si" | "web3",
  "mediaType": "video" | "image"
}

Semua teks wajib dua bahasa: title/description dalam ENGLISH,
titleId/descriptionId dalam Bahasa Indonesia.
mediaType: "video" jika URL utama adalah video (YouTube, Vimeo, file .mp4/.webm),
"image" jika gambar atau halaman web biasa.

Track "si" untuk karya Super Intelligence / AI / data / engineering.
Track "web3" untuk karya crypto / blockchain / DeFi / NFT.`;

  try {
    const messages = [
      {
        role: "system" as const,
        content:
          "Kamu adalah asisten kurator portfolio yang hanya membalas JSON valid.",
      },
      { role: "user" as const, content: prompt },
    ];

    /* response_format json_object tidak didukung semua model open —
       coba dengan, lalu tanpa */
    let content: string | null = null;
    for (const useFormat of [true, false]) {
      const body: Record<string, unknown> = {
        model,
        temperature: 0.7,
        messages,
      };
      if (useFormat) body.response_format = { type: "json_object" };

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) continue;

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      content = data.choices?.[0]?.message?.content ?? null;
      if (content) break;
    }
    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<AiEnrichPayload>;
    return {
      title: String(parsed.title ?? scrape.title),
      titleId: String(parsed.titleId ?? parsed.title ?? scrape.title),
      description: String(parsed.description ?? scrape.description),
      descriptionId: String(
        parsed.descriptionId ?? parsed.description ?? scrape.description
      ),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 8) : [],
      track: isTrack(parsed.track) ? parsed.track : heuristicTrack(scrape),
      mediaType: isMediaType(parsed.mediaType)
        ? parsed.mediaType
        : detectMediaType(scrape.url),
    };
  } catch {
    return null;
  }
}

export async function enrichFromUrl(
  url: string,
  trackHint?: Track
): Promise<EnrichResult> {
  const scrape = await scrapeUrl(url);
  const ai = await callLlm(scrape);

  if (ai) {
    return {
      title: ai.title,
      titleId: ai.titleId,
      description: ai.description,
      descriptionId: ai.descriptionId,
      tags: ai.tags,
      track: trackHint ?? ai.track,
      mediaType: ai.mediaType,
      image: scrape.image,
      source: "ai",
      scrape,
    };
  }

  return {
    title: scrape.title.slice(0, 80),
    titleId: scrape.title.slice(0, 80),
    description:
      scrape.description ||
      `Dokumentasi karya dari ${scrape.siteName ?? "sumber eksternal"}.`,
    descriptionId:
      scrape.description ||
      `Dokumentasi karya dari ${scrape.siteName ?? "sumber eksternal"}.`,
    tags: heuristicTags(scrape),
    track: trackHint ?? heuristicTrack(scrape),
    mediaType: detectMediaType(url),
    image: scrape.image,
    source: "manual",
    scrape,
  };
}
