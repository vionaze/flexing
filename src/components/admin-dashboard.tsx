"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { detectMediaType } from "@/lib/media";
import { PORTO_CATEGORIES, type PortfolioItem, type Track } from "@/lib/types";

interface EnrichPreview {
  title: string;
  titleId?: string;
  description: string;
  descriptionId?: string;
  tags: string[];
  track: Track;
  image?: string;
  source: "ai" | "manual";
  mediaUrl?: string;
  mediaType?: "video" | "image";
  category?: string;
  date?: string;
  dateEnd?: string;
  keterangan?: string;
  roleDesc?: string;
  yearStart?: string;
  yearEnd?: string;
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
  const [filter, setFilter] = useState<"semua" | Track>("semua");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [enriching, startEnrich] = useTransition();
  const [saving, startSave] = useTransition();

  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiHasKey, setAiHasKey] = useState(false);
  const [savingSettings, startSaveSettings] = useTransition();
  const [testing, startTest] = useTransition();
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setAiBaseUrl(data.aiBaseUrl ?? "");
        setAiModel(data.aiModel ?? "");
        setAiHasKey(Boolean(data.hasKey));
      })
      .catch(() => {});
  }, []);

  async function handleTestConnection() {
    setTestResult(null);
    setError(null);

    startTest(async () => {
      try {
        const res = await fetch("/api/settings/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aiBaseUrl,
            aiModel,
            aiApiKey: aiApiKey || undefined,
          }),
        });
        const data = await res.json();
        const ms = data.ms ? ` · ${data.ms}ms` : "";

        if (data.ok) {
          setTestResult({
            ok: true,
            text: `Koneksi OK${ms} — model ${data.model ?? aiModel ?? "default"} merespons`,
          });
        } else {
          setTestResult({
            ok: false,
            text: `${data.error ?? "Gagal terhubung"}${ms}`,
          });
        }
      } catch {
        setTestResult({ ok: false, text: "Terjadi kesalahan jaringan" });
      }
    });
  }

  async function handleSaveSettings() {
    setError(null);

    startSaveSettings(async () => {
      try {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aiBaseUrl,
            aiModel,
            aiApiKey: aiApiKey || undefined,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Gagal menyimpan pengaturan");
          return;
        }

        setAiBaseUrl(data.aiBaseUrl ?? "");
        setAiModel(data.aiModel ?? "");
        setAiHasKey(Boolean(data.hasKey));
        setAiApiKey("");
        flash("Pengaturan AI disimpan");
      } catch {
        setError("Terjadi kesalahan jaringan");
      }
    });
  }

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
            titleId: preview.titleId,
            description: preview.description,
            descriptionId: preview.descriptionId,
            tags: preview.tags,
            track: preview.track,
            image: preview.image,
            url,
            source: preview.source,
            mediaUrl: preview.track === "si" ? preview.mediaUrl : undefined,
            mediaType: preview.track === "si" ? preview.mediaType : undefined,
            category: preview.category,
            date: preview.track === "si" ? preview.date : undefined,
            dateEnd: preview.track === "si" ? preview.dateEnd : undefined,
            keterangan: preview.keterangan,
            roleDesc:
              preview.track === "web3" ? preview.roleDesc : undefined,
            yearStart:
              preview.track === "web3" ? preview.yearStart : undefined,
            yearEnd: preview.track === "web3" ? preview.yearEnd : undefined,
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
      titleId: item.titleId,
      description: item.description,
      descriptionId: item.descriptionId,
      tags: item.tags,
      track: item.track,
      image: item.image,
      source: item.source,
      mediaUrl: item.mediaUrl,
      mediaType: item.mediaType,
      category: item.category,
      date: item.date,
      dateEnd: item.dateEnd,
      keterangan: item.keterangan,
      roleDesc: item.roleDesc,
      yearStart: item.yearStart,
      yearEnd: item.yearEnd,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formatDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  const filteredItems = items.filter(
    (i) => filter === "semua" || i.track === filter
  );

  async function handleArchive(item: PortfolioItem) {
    const res = await fetch(`/api/portfolio/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !item.archived }),
    });
    if (res.ok) {
      flash(item.archived ? "Porto dikembalikan" : "Porto diarsipkan");
      await refreshItems();
      router.refresh();
    }
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

          {/* PENGATURAN AI */}
          <div className="card-flat mt-5 p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="display text-xl">Pengaturan AI</h2>
              <span
                className={`chip ${aiHasKey ? "chip-success" : "chip-danger"}`}
              >
                {aiHasKey ? "API key aktif" : "belum ada key"}
              </span>
            </div>
            <p className="mt-2 text-sm text-text-3">
              Endpoint OpenAI-compatible untuk tombol Generate dengan AI.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="label mb-2.5 block !text-text-3">
                  Base URL
                </label>
                <input
                  className="field"
                  placeholder="https://api.openai.com/v1"
                  value={aiBaseUrl}
                  onChange={(e) => setAiBaseUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="label mb-2.5 block !text-text-3">Model</label>
                <input
                  className="field"
                  placeholder="gpt-4o-mini"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                />
              </div>
              <div>
                <label className="label mb-2.5 block !text-text-3">
                  API Key
                </label>
                <input
                  type="password"
                  className="field"
                  placeholder={
                    aiHasKey ? "tersimpan — isi untuk mengganti" : "sk-..."
                  }
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                />
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={handleTestConnection}
                  className="btn btn-ghost flex-1"
                  disabled={testing}
                >
                  {testing ? "Menguji…" : "Test koneksi"}
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="btn btn-ghost flex-1"
                  disabled={savingSettings}
                >
                  {savingSettings ? "Menyimpan…" : "Simpan"}
                </button>
              </div>

              {testResult && (
                <p
                  className={`rounded-xl border px-3.5 py-2.5 text-sm ${
                    testResult.ok
                      ? "border-success/35 bg-success/10 text-success"
                      : "border-danger/35 bg-danger/10 text-danger"
                  }`}
                >
                  {testResult.ok ? "✓ " : "✗ "}
                  {testResult.text}
                </p>
              )}
            </div>
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
                  <label className="mb-2 block text-xs text-text-4">
                    Judul (EN)
                  </label>
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
                    Judul (ID)
                  </label>
                  <input
                    className="field"
                    value={preview.titleId ?? ""}
                    placeholder="opsional — kosongkan untuk pakai versi EN"
                    onChange={(e) =>
                      setPreview({ ...preview, titleId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-text-4">
                    Deskripsi (EN)
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
                    Deskripsi (ID)
                  </label>
                  <textarea
                    className="field min-h-[70px] resize-y"
                    value={preview.descriptionId ?? ""}
                    placeholder="opsional — kosongkan untuk pakai versi EN"
                    onChange={(e) =>
                      setPreview({ ...preview, descriptionId: e.target.value })
                    }
                  />
                </div>
                {preview.track === "si" && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-xs text-text-4">
                        URL Video / Gambar
                      </label>
                      {preview.mediaUrl && (
                        <span
                          className={`chip ${
                            preview.mediaType === "video"
                              ? "chip-web3"
                              : "chip-si"
                          }`}
                        >
                          {preview.mediaType === "video" ? "Video" : "Gambar"}
                        </span>
                      )}
                    </div>
                    <input
                      className="field"
                      placeholder="https://youtube.com/watch?v=... atau URL gambar"
                      value={preview.mediaUrl ?? ""}
                      onChange={(e) =>
                        setPreview({
                          ...preview,
                          mediaUrl: e.target.value,
                          mediaType: e.target.value
                            ? detectMediaType(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs text-text-4">
                    Kategori
                  </label>
                  <select
                    className="field"
                    value={preview.category ?? ""}
                    onChange={(e) =>
                      setPreview({ ...preview, category: e.target.value })
                    }
                  >
                    <option value="">— pilih kategori —</option>
                    {PORTO_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {preview.track === "si" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-xs text-text-4">
                        Dari
                      </label>
                      <input
                        type="date"
                        className="field"
                        value={preview.date ?? ""}
                        onChange={(e) =>
                          setPreview({ ...preview, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs text-text-4">
                        Sampai
                      </label>
                      <input
                        type="date"
                        className="field"
                        value={preview.dateEnd ?? ""}
                        onChange={(e) =>
                          setPreview({ ...preview, dateEnd: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-xs text-text-4">
                          Gambar
                        </label>
                        {preview.image && (
                          <span className="chip chip-success">otomatis</span>
                        )}
                      </div>
                      <input
                        className="field"
                        placeholder="otomatis dari Generate — atau tempel URL gambar"
                        value={preview.image ?? ""}
                        onChange={(e) =>
                          setPreview({ ...preview, image: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs text-text-4">
                        Gue ngapain aja di proyek ini
                      </label>
                      <textarea
                        className="field min-h-[70px] resize-y"
                        placeholder="otomatis oleh AI saat Generate — atau tulis manual"
                        value={preview.roleDesc ?? ""}
                        onChange={(e) =>
                          setPreview({ ...preview, roleDesc: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-xs text-text-4">
                          Dari tahun
                        </label>
                        <select
                          className="field"
                          value={preview.yearStart ?? ""}
                          onChange={(e) =>
                            setPreview({
                              ...preview,
                              yearStart: e.target.value,
                            })
                          }
                        >
                          <option value="">—</option>
                          {Array.from({ length: 20 }, (_, i) =>
                            String(new Date().getFullYear() + 1 - i)
                          ).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs text-text-4">
                          Sampai
                        </label>
                        <select
                          className="field"
                          value={preview.yearEnd ?? ""}
                          onChange={(e) =>
                            setPreview({ ...preview, yearEnd: e.target.value })
                          }
                        >
                          <option value="">—</option>
                          <option value="now">Now</option>
                          {Array.from({ length: 20 }, (_, i) =>
                            String(new Date().getFullYear() + 1 - i)
                          ).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs text-text-4">
                    Keterangan (proyek & periode kerja)
                  </label>
                  <textarea
                    className="field min-h-[70px] resize-y"
                    placeholder="Contoh: Kerja di PixVerse Canvas, dari Januari sampai Maret 2026"
                    value={preview.keterangan ?? ""}
                    onChange={(e) =>
                      setPreview({ ...preview, keterangan: e.target.value })
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

        {/* LIST — ringkas per track */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(["semua", "si", "web3"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn btn-sm ${
                    filter === f
                      ? f === "si"
                        ? "btn-si"
                        : f === "web3"
                          ? "btn-web3"
                          : "btn-primary"
                      : "btn-ghost"
                  }`}
                >
                  {f === "semua" ? "Semua" : trackLabel[f]}
                </button>
              ))}
            </div>
            <span className="label">{filteredItems.length} item</span>
          </div>

          <div className="mt-5 space-y-2.5">
            {filteredItems.length === 0 ? (
              <div className="card-flat px-6 py-14 text-center text-text-3">
                Tidak ada porto di kategori ini.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`card-flat flex items-center gap-3 px-5 py-4 ${
                    item.archived ? "opacity-50" : ""
                  }`}
                >
                  <span
                    className={`shrink-0 ${
                      item.track === "si" ? "dot-si" : "dot-web3"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.title}
                      {item.archived && (
                        <span className="label ml-2">arsip</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-text-4">
                      {trackLabel[item.track]}
                      {item.category ? ` · ${item.category}` : ""}
                      {item.date ? ` · ${formatDate(item.date)}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn btn-ghost btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(item)}
                      className="btn btn-ghost btn-sm"
                    >
                      {item.archived ? "Kembalikan" : "Arsip"}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-danger btn-sm"
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
