import * as cheerio from "cheerio";

export interface ScrapeResult {
  url: string;
  title: string;
  description: string;
  image?: string;
  siteName?: string;
  textExcerpt: string;
}

function pickMeta($: cheerio.CheerioAPI, ...names: string[]): string {
  for (const name of names) {
    const byProperty = $(`meta[property="${name}"]`).attr("content");
    if (byProperty?.trim()) return byProperty.trim();
    const byName = $(`meta[name="${name}"]`).attr("content");
    if (byName?.trim()) return byName.trim();
  }
  return "";
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FlexingBot/1.0; +https://github.com/vionaze/flexing)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil halaman: HTTP ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Hapus elemen yang tidak relevan untuk excerpt
    $("script, style, noscript, svg, nav, footer, header").remove();

    const title =
      pickMeta($, "og:title", "twitter:title") || $("title").first().text().trim();
    const description =
      pickMeta($, "og:description", "twitter:description", "description") ||
      $("p").first().text().trim().slice(0, 300);
    const image = pickMeta($, "og:image", "twitter:image") || undefined;
    const siteName = pickMeta($, "og:site_name") || undefined;

    const textExcerpt = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);

    return {
      url,
      title: title || url,
      description: description.slice(0, 500),
      image,
      siteName,
      textExcerpt,
    };
  } finally {
    clearTimeout(timeout);
  }
}
