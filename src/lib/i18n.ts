import { cookies, headers } from "next/headers";
import type { Lang } from "./types";

export type { Lang };
export const LANG_COOKIE = "lang";

/** Bahasa efektif: toggle cookie > negara dari IP (header CF-IPCountry Cloudflare) > default EN */
export async function getLang(): Promise<Lang> {
  const cookieLang = (await cookies()).get(LANG_COOKIE)?.value;
  if (cookieLang === "en" || cookieLang === "id") return cookieLang;

  const country = (await headers()).get("cf-ipcountry");
  return country === "ID" ? "id" : "en";
}

/** String UI halaman publik — english first, bahasa Indonesia untuk pengunjung ID */
const DICT = {
  id: {
    curatedWorks: "karya terkurasi",
    viewWork: "Lihat karya",
    backHome: "Kembali ke beranda",
    emptyTitle: "belum ada karya!",
    emptyBody: "Karya untuk track ini akan muncul di sini dalam waktu dekat.",
    blurbSi: "AI, data, engineering, dan karya riset.",
    blurbWeb3: "Blockchain, DeFi, NFT, dan on-chain product.",
  },
  en: {
    curatedWorks: "curated works",
    viewWork: "View work",
    backHome: "Back to home",
    emptyTitle: "no works yet!",
    emptyBody: "Works for this track will appear here soon.",
    blurbSi: "AI, data, engineering, and research works.",
    blurbWeb3: "Blockchain, DeFi, NFT, and on-chain products.",
  },
} as const;

export function t(lang: Lang) {
  return DICT[lang];
}
