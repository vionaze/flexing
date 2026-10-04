import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createItem, listByTrack, readPortfolio } from "@/lib/db";
import { syncDataToGitHub } from "@/lib/github";
import { appendLog } from "@/lib/log";
import type { Track } from "@/lib/types";

function isTrack(value: unknown): value is Track {
  return value === "si" || value === "web3";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackParam = searchParams.get("track");

  if (trackParam && isTrack(trackParam)) {
    const items = await listByTrack(trackParam);
    return NextResponse.json({ items });
  }

  const data = await readPortfolio();
  return NextResponse.json({ items: data.items });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const { track, title, description, url, tags, image, source } = body;

  if (!isTrack(track) || typeof title !== "string" || typeof description !== "string" || typeof url !== "string") {
    return NextResponse.json(
      { error: "Field track, title, description, url wajib valid" },
      { status: 400 }
    );
  }

  const item = await createItem({
    track,
    title,
    description,
    url,
    tags: Array.isArray(tags) ? tags.map(String) : [],
    image: typeof image === "string" ? image : undefined,
    source: source === "ai" ? "ai" : "manual",
  });

  await appendLog({
    action: "create",
    actor: "admin",
    summary: `Menambah porto "${item.title}"`,
    detail: `id=${item.id} track=${item.track} url=${item.url} source=${item.source}`,
  });
  await syncDataToGitHub(`create portfolio "${item.title}"`);

  return NextResponse.json({ item }, { status: 201 });
}
