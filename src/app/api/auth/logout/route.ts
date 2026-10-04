import { NextResponse } from "next/server";
import { destroySession, isAdmin } from "@/lib/auth";
import { appendLog } from "@/lib/log";

export async function POST() {
  const wasAdmin = await isAdmin();
  await destroySession();

  if (wasAdmin) {
    await appendLog({
      action: "logout",
      actor: "admin",
      summary: "Logout studio",
    });
  }

  return NextResponse.json({ ok: true });
}
