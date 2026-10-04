import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readLog, readLogEntries } from "@/lib/log";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("format") === "raw") {
    const raw = await readLog();
    return new NextResponse(raw, {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  const entries = await readLogEntries();
  return NextResponse.json({ entries });
}
