import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readAiSettings, writeAiSettings } from "@/lib/settings";
import { appendLog } from "@/lib/log";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const s = await readAiSettings();
  return NextResponse.json({
    aiBaseUrl: s.aiBaseUrl ?? "",
    aiModel: s.aiModel ?? "",
    hasKey: Boolean(s.aiApiKey || process.env.AI_API_KEY),
  });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { aiBaseUrl?: string; aiModel?: string; aiApiKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const patch: { aiBaseUrl?: string; aiModel?: string; aiApiKey?: string } = {};

  if (body.aiBaseUrl?.trim()) {
    const url = body.aiBaseUrl.trim().replace(/\/+$/, "");
    if (!/^https?:\/\//.test(url)) {
      return NextResponse.json(
        { error: "Base URL harus diawali http:// atau https://" },
        { status: 400 }
      );
    }
    patch.aiBaseUrl = url;
  }
  if (body.aiModel?.trim()) patch.aiModel = body.aiModel.trim();
  if (body.aiApiKey?.trim()) patch.aiApiKey = body.aiApiKey.trim();

  await writeAiSettings(patch);
  await appendLog({
    action: "settings",
    actor: "admin",
    summary: "Pengaturan AI diperbarui",
    detail: `baseUrl=${patch.aiBaseUrl ?? "-"} model=${patch.aiModel ?? "-"} key=${patch.aiApiKey ? "diubah" : "tetap"}`,
  });

  const s = await readAiSettings();
  return NextResponse.json({
    aiBaseUrl: s.aiBaseUrl ?? "",
    aiModel: s.aiModel ?? "",
    hasKey: Boolean(s.aiApiKey || process.env.AI_API_KEY),
  });
}
