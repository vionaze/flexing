import Link from "next/link";

/**
 * Navbar bersama semua halaman publik.
 * active = track yang sedang dibuka (garis bawah permanen warna track).
 */
export function Navbar({ active, sticky = false }: { active?: "si" | "web3"; sticky?: boolean }) {
  const base =
    "border-b-2 px-1 pb-1 pt-0.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors sm:px-2 sm:text-xs";

  return (
    <header
      className={`z-20 border-b border-border bg-bg ${sticky ? "sticky top-0" : "relative"}`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold uppercase tracking-[0.16em] sm:text-2xl">
            FEYBER
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/si"
            className={`${base} ${
              active === "si"
                ? "border-si text-text"
                : "border-transparent text-text-3 hover:border-si hover:text-text"
            }`}
          >
            <span className="sm:hidden">SI</span>
            <span className="hidden sm:inline">Super Intelligence</span>
          </Link>
          <Link
            href="/web3"
            className={`${base} ${
              active === "web3"
                ? "border-web3 text-text"
                : "border-transparent text-text-3 hover:border-web3 hover:text-text"
            }`}
          >
            WEB3
          </Link>
        </nav>
      </div>
    </header>
  );
}
