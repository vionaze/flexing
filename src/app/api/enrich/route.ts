import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { enrichFromUrl } from "@/lib/enrich";
import { appendLog } from "@/lib/log";
import type { Track } from "@/lib/types";

function isTrack(value: unknown): value is Track {
  return value === "si" || value === "web3";
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { url?: string; track?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
  }

  try {
    // Validasi URL
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "URL harus http/https" },
        { status: 400 }
      );
    }

    const trackHint = isTrack(body.track) ? body.track : undefined;
    const result = await enrichFromUrl(url, trackHint);

    await appendLog({
      action: "enrich",
      actor: "admin",
      summary: `Enrich URL: ${url}`,
      detail: `title="${result.title}" track=${result.track} source=${result.source}`,
    });

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal enrich URL";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
