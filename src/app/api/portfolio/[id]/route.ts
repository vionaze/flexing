import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteItem, getItem, updateItem } from "@/lib/db";
import { syncDataToGitHub } from "@/lib/github";
import { appendLog } from "@/lib/log";
import type { Track } from "@/lib/types";

function isTrack(value: unknown): value is Track {
  return value === "si" || value === "web3";
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const patch: Parameters<typeof updateItem>[1] = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.description === "string") patch.description = body.description;
  if (typeof body.url === "string") patch.url = body.url;
  if (typeof body.image === "string") patch.image = body.image;
  if (isTrack(body.track)) patch.track = body.track;
  if (Array.isArray(body.tags)) patch.tags = body.tags.map(String);

  const item = await updateItem(id, patch);
  if (!item) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  await appendLog({
    action: "update",
    actor: "admin",
    summary: `Update porto "${item.title}"`,
    detail: `id=${item.id} fields=${Object.keys(patch).join(",")}`,
  });
  await syncDataToGitHub(`update portfolio "${item.title}"`);

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteItem(id);
  if (!ok) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  await appendLog({
    action: "delete",
    actor: "admin",
    summary: `Hapus porto id=${id}`,
    detail: `id=${id}`,
  });
  await syncDataToGitHub(`delete portfolio id=${id}`);

  return NextResponse.json({ ok: true });
}
