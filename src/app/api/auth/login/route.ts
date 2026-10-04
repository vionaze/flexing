import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { appendLog } from "@/lib/log";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!password) {
    return NextResponse.json(
      { error: "Password wajib diisi" },
      { status: 400 }
    );
  }

  const ok = await verifyPassword(password);
  if (!ok) {
    await appendLog({
      action: "login_failed",
      actor: "unknown",
      summary: "Percobaan login gagal",
    });
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  await createSession();
  await appendLog({
    action: "login",
    actor: "admin",
    summary: "Login studio berhasil",
  });

  return NextResponse.json({ ok: true });
}
