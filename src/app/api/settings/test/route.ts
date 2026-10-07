import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getEffectiveAiSettings } from "@/lib/settings";

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

  const stored = await getEffectiveAiSettings();
  const baseUrl = (body.aiBaseUrl?.trim() || stored.baseUrl).replace(/\/+$/, "");
  const model = body.aiModel?.trim() || stored.model;
  const apiKey = body.aiApiKey?.trim() || stored.apiKey;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "API key belum diisi" },
      { status: 400 }
    );
  }
  if (!/^https?:\/\//.test(baseUrl)) {
    return NextResponse.json(
      { ok: false, error: "Base URL harus diawali http:// atau https://" },
      { status: 400 }
    );
  }

  const started = Date.now();
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 8,
        messages: [{ role: "user", content: "ping" }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    const ms = Date.now() - started;

    if (!res.ok) {
      const raw = (await res.text()).slice(0, 400);
      let detail = raw;
      try {
        const parsed = JSON.parse(raw) as {
          error?: { message?: string } | string;
        };
        detail =
          typeof parsed.error === "string"
            ? parsed.error
            : parsed.error?.message ?? raw.slice(0, 200);
      } catch {
        /* biarkan raw */
      }
      return NextResponse.json({
        ok: false,
        status: res.status,
        ms,
        error: `HTTP ${res.status} — ${detail}`,
      });
    }

    const data = (await res.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      ok: true,
      ms,
      model: data.model ?? model,
      reply: reply ? reply.slice(0, 80) : undefined,
    });
  } catch (e) {
    const ms = Date.now() - started;
    const msg = e instanceof Error ? e.message : "Gagal terhubung";
    return NextResponse.json({
      ok: false,
      ms,
      error:
        msg.includes("timeout") || msg.includes("abort")
          ? "Timeout — host tidak merespons dalam 15 detik"
          : msg,
    });
  }
}
