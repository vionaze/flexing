# Setup Guide

Panduan konfigurasi Flexing Portfolio.

## 1. Salin environment file

```bash
cp .env.example .env.local
```

## 2. Generate password admin (bcrypt hash)

Password admin **tidak** ditulis plaintext. Generate hash-nya:

```bash
node -e "console.log(require('bcryptjs').hashSync('PASSWORD_KAMU', 12))"
```

Tempel hasilnya ke `AUTH_ADMIN_HASH` di `.env.local`.

### Escape karakter `$` (WAJIB)

`@next/env` melakukan variable expansion, sehingga hash bcrypt yang mengandung
`$2b$12$...` akan terpotong. Escape setiap `$` menjadi `\$`:

```
# Salah (hash akan rusak):
AUTH_ADMIN_HASH=$2b$12$UrmiMHt7...

# Benar:
AUTH_ADMIN_HASH=\$2b\$12\$UrmiMHt7...
```

## 3. Generate `AUTH_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. AI enrichment (opsional)

Tanpa API key, fitur AI tetap jalan memakai fallback metadata halaman
(`og:title`, `og:description`, dsb).

Untuk deskripsi yang digenerate AI, isi:

```
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

`AI_BASE_URL` bisa diganti ke endpoint OpenAI-compatible lain
(Anthropic proxy, OpenRouter, dsb.).

## 5. Auto-commit ke GitHub (opsional)

Supaya `data/portfolio.json` dan `data/LOG.md` otomatis ter-commit ke repo
GitHub setiap ada perubahan:

1. Buat Personal Access Token dengan scope `contents:write` pada repo target
   (fine-grained PAT disarankan).
2. Isi di `.env.local`:

```
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=vionaze
GITHUB_REPO=flexing
```

Tanpa ketiga env ini, sync otomatis nonaktif — kamu tetap bisa commit manual:

```bash
git add data/ && git commit -m "update portfolio"
```

## 6. Jalankan

```bash
npm run dev      # development
npm run build    # build produksi
npm run start    # jalankan build produksi
```

## Catatan deployment

Penyimpanan file (`data/`) bekerja optimal di environment yang filesystem-nya
persisten (VPS, server sendiri, `npm start` lokal). Di serverless (mis. Vercel)
penulisan file tidak persisten antar request — untuk itu aktifkan auto-commit
GitHub dan/atau pindah ke database di iterasi berikutnya.

## Default admin

Password bawaan untuk lingkungan development sudah di-set di `.env.local`
contoh ini. **Ganti sebelum deploy ke produksi.**
