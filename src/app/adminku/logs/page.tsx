import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readLogEntries } from "@/lib/log";

export const metadata = {
  title: "Activity Log — FEYBER",
};

export default async function StudioLogsPage() {
  if (!(await isAdmin())) {
    redirect("/adminku/login");
  }

  const entries = await readLogEntries();

  return (
    <main className="relative min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-bg">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold uppercase tracking-[0.16em]">
                FEYBER
              </span>
              <span className="label">Logs</span>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              Activity log
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/adminku" className="btn btn-ghost btn-sm">
              Studio
            </Link>
            <a href="/api/logs?format=raw" className="btn btn-ghost btn-sm">
              Unduh LOG.md
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="card-flat px-5 py-4 text-sm text-text-3">
          Setiap aksi tercatat di{" "}
          <code className="rounded-md bg-surface-2 px-1.5 py-0.5 text-text-2">
            data/LOG.md
          </code>{" "}
          dan bisa di-track lewat git history.
        </div>

        <div className="mt-8 space-y-3">
          {entries.length === 0 ? (
            <div className="card-flat px-6 py-16 text-center text-text-3">
              Belum ada aktivitas.
            </div>
          ) : (
            entries.map((entry, i) => (
              <div key={i} className="card-flat p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`chip ${
                      entry.action.includes("failed")
                        ? "chip-danger"
                        : "chip-success"
                    }`}
                  >
                    {entry.action}
                  </span>
                  <span className="label">{entry.timestamp}</span>
                  <span className="text-xs text-text-4">oleh {entry.actor}</span>
                </div>
                <p className="mt-2.5 text-sm text-text">{entry.summary}</p>
                {entry.detail && (
                  <p className="mt-1.5 break-all font-mono text-xs text-text-4">
                    {entry.detail}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
