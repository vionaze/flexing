# Flexing — Portfolio Website

Platform portfolio dual-track: **Super Intelligence (SI)** dan **WEB3/Crypto**.

## Fitur

- Landing page dengan pemilihan jalur SI / WEB3-Crypto
- Studio privat di `/adminku` (login + proteksi proxy) — tidak ditautkan dari halaman publik
- Tambah porto cukup dengan **paste URL** — AI otomatis menyiapkan judul, deskripsi, tag, dan thumbnail
- Data porto tersimpan sebagai `data/portfolio.json` (bisa di-commit ke Git)
- Semua aksi tercatat di `data/LOG.md` — audit trail bisa di-track lewat git history GitHub
- Opsional: auto-commit data + log ke GitHub setiap perubahan

## Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | bcrypt + JWT session cookie (jose) + `proxy.ts` |
| Scraper | cheerio |
| AI | OpenAI-compatible chat completions (opsional) |
| Data | File JSON + Markdown di `data/` |

## Quick Start

```bash
npm install
cp .env.example .env.local
# isi .env.local sesuai docs/SETUP.md
npm run dev
```

Buka http://localhost:3000

## Struktur

```
src/
  app/
    page.tsx              # Landing (pilih SI / WEB3)
    si/page.tsx           # Portfolio SI
    web3/page.tsx         # Portfolio WEB3/Crypto
    adminku/              # Studio privat (login + kelola porto)
    api/                  # Route handlers
  components/
  lib/                    # auth, db, log, enrich, scrape, github
  proxy.ts                # Proteksi route /adminku (Next.js 16)
data/
  portfolio.json          # Data porto
  LOG.md                  # Audit trail aktivitas
```

## Dokumentasi

- [docs/SETUP.md](docs/SETUP.md) — konfigurasi env, generate password hash, AI key, auto-commit GitHub

## Keamanan

- Password admin **tidak** disimpan di kode. Simpan bcrypt hash-nya di `.env.local`.
- `.env*` sudah masuk `.gitignore` — jangan di-commit.
- Session memakai cookie `httpOnly` + JWT yang di-sign dengan `AUTH_SECRET`.
