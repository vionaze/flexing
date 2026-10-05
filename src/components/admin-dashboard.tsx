"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PortfolioItem, Track } from "@/lib/types";

interface EnrichPreview {
  title: string;
  description: string;
  tags: string[];
  track: Track;
  image?: string;
  source: "ai" | "manual";
}

const trackLabel: Record<Track, string> = {
  si: "Super Intelligence",
  web3: "WEB3 / Crypto",
};

export function AdminDashboard({
  initialItems,
}: {
  initialItems: PortfolioItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [url, setUrl] = useState("");
  const [track, setTrack] = useState<Track>("si");
  const [preview, setPreview] = useState<EnrichPreview | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [enriching, startEnrich] = useTransition();
  const [saving, startSave] = useTransition();

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 3500);
  }

  async function refreshItems() {
    const res = await fetch("/api/portfolio");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  async function handleEnrich(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPreview(null);

    startEnrich(async () => {
      try {
        const res = await fetch("/api/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, track }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Gagal enrich URL");
          return;
        }

        setPreview(data.result);
      } catch {
        setError("Terjadi kesalahan jaringan");
      }
    });
  }

  async function handleSave() {
    if (!preview) return;
    setError(null);

    startSave(async () => {
      try {
        const endpoint = editingId
          ? `/api/portfolio/${editingId}`
          : "/api/portfolio";
        const method = editingId ? "PATCH" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: preview.title,
            description: preview.description,
            tags: preview.tags,
            track: preview.track,
            image: preview.image,
            url,
            source: preview.source,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Gagal menyimpan");
          return;
        }

        setPreview(null);
        setUrl("");
        setEditingId(null);
        flash(editingId ? "Porto diperbarui" : "Porto ditambahkan");
        await refreshItems();
        router.refresh();
      } catch {
        setError("Terjadi kesalahan jaringan");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus porto ini?")) return;

    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      flash("Porto dihapus");
      await refreshItems();
      router.refresh();
    }
  }

  function handleEdit(item: PortfolioItem) {
    setEditingId(item.id);
    setUrl(item.url);
    setTrack(item.track);
    setPreview({
      title: item.title,
      description: item.description,
      tags: item.tags,
      track: item.track,
      image: item.image,
      source: item.source,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/adminku/login");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-bg">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold uppercase tracking-[0.16em]">
                FEYBER
              </span>
              <span className="label">Studio</span>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              Dashboard portfolio
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/adminku/logs" className="btn btn-ghost btn-sm">
              Logs
            </Link>
            <Link href="/" className="btn btn-ghost btn-sm">
              Lihat situs
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_1fr]">
        {/* FORM */}
        <section>
          <div className="card-flat p-7">
            <h2 className="display text-xl">
              {editingId ? "Edit porto" : "Tambah porto"}
            </h2>
            <p className="mt-2 text-sm text-text-3">
              Tempel URL — AI menyiapkan judul, deskripsi, dan tag.
            </p>

            <form onSubmit={handleEnrich} className="mt-6 space-y-5">
              <div>
                <label className="label mb-2.5 block !text-text-3">
                  URL porto
                </label>
                <input
                  type="url"
                  className="field"
                  placeholder="https://github.com/kamu/proyek"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label mb-2.5 block !text-text-3">Track</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(["si", "web3"] as Track[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTrack(t)}
                      className={`btn ${track === t ? (t === "si" ? "btn-si" : "btn-web3") : "btn-ghost"}`}
                    >
                      {trackLabel[t]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={enriching || !url}
              >
                {enriching
                  ? "Membaca halaman…"
                  : editingId
                    ? "Muat ulang dari URL"
                    : "Generate dengan AI"}
              </button>
            </form>

            {error && (
              <p className="mt-5 rounded-xl border border-danger/35 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            {notice && (
              <p className="mt-5 rounded-xl border border-success/35 bg-success/10 px-3.5 py-2.5 text-sm text-success">
                {notice}
              </p>
            )}
          </div>

          {preview && (
            <div className="card-flat mt-5 p-7">
              <div className="flex items-center justify-between">
                <p className="label">Preview hasil AI</p>
                <span className={`chip ${preview.track === "si" ? "chip-si" : "chip-web3"}`}>
                  {preview.source === "ai" ? "AI" : "Metadata"}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-xs text-text-4">Judul</label>
                  <input
                    className="field"
                    value={preview.title}
                    onChange={(e) =>
                      setPreview({ ...preview, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-text-4">
                    Deskripsi
                  </label>
                  <textarea
                    className="field min-h-[110px] resize-y"
                    value={preview.description}
                    onChange={(e) =>
                      setPreview({ ...preview, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-text-4">
                    Tags (pisahkan dengan koma)
                  </label>
                  <input
                    className="field"
                    value={preview.tags.join(", ")}
                    onChange={(e) =>
                      setPreview({
                        ...preview,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Menyimpan…"
                      : editingId
                        ? "Simpan perubahan"
                        : "Simpan ke portofolio"}
                  </button>
                  <button
                    onClick={() => {
                      setPreview(null);
                      setEditingId(null);
                    }}
                    className="btn btn-ghost"
                    type="button"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* LIST */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="display text-xl">Daftar porto</h2>
            <span className="label">{items.length} item</span>
          </div>

          <div className="mt-5 space-y-3">
            {items.length === 0 ? (
              <div className="card-flat px-6 py-16 text-center text-text-3">
                Belum ada porto. Tambahkan yang pertama lewat form di kiri.
              </div>
            ) : (
              items.map((item, i) => (
                <div key={item.id} className="lift card-flat p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="label">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-semibold leading-snug tracking-tight">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-1.5 text-xs text-text-4">
                        {trackLabel[item.track]} · {item.source} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={`mt-1.5 shrink-0 ${
                        item.track === "si" ? "dot-si" : "dot-web3"
                      }`}
                    />
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-text-2">
                    {item.description}
                  </p>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block truncate text-xs text-text-4 transition-colors hover:text-text-2"
                  >
                    {item.url}
                  </a>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn btn-ghost btn-sm lift"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-danger btn-sm lift"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
