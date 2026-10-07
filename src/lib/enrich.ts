import { scrapeUrl, type ScrapeResult } from "./scrape";
import { getEffectiveAiSettings } from "./settings";
import type { Track } from "./types";

export interface EnrichResult {
  title: string;
  description: string;
  tags: string[];
  track: Track;
  image?: string;
  source: "ai" | "manual";
  scrape: ScrapeResult;
}

interface AiEnrichPayload {
  title: string;
  description: string;
  tags: string[];
  track: Track;
}

function isTrack(value: unknown): value is Track {
  return value === "si" || value === "web3";
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
  "title": "judul portfolio yang menarik, maksimal 80 karakter",
  "description": "deskripsi portfolio 2-3 kalimat dalam bahasa Indonesia, profesional, maksimal 400 karakter",
  "tags": ["tag1", "tag2", "tag3"],
  "track": "si" | "web3"
}

Track "si" untuk karya Super Intelligence / AI / data / engineering.
Track "web3" untuk karya crypto / blockchain / DeFi / NFT.`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah asisten kurator portfolio yang hanya membalas JSON valid.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<AiEnrichPayload>;
    return {
      title: String(parsed.title ?? scrape.title),
      description: String(parsed.description ?? scrape.description),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 8) : [],
      track: isTrack(parsed.track) ? parsed.track : heuristicTrack(scrape),
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
      description: ai.description,
      tags: ai.tags,
      track: trackHint ?? ai.track,
      image: scrape.image,
      source: "ai",
      scrape,
    };
  }

  return {
    title: scrape.title.slice(0, 80),
    description:
      scrape.description ||
      `Dokumentasi karya dari ${scrape.siteName ?? "sumber eksternal"}.`,
    tags: heuristicTags(scrape),
    track: trackHint ?? heuristicTrack(scrape),
    image: scrape.image,
    source: "manual",
    scrape,
  };
}
