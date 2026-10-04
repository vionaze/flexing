"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Login gagal");
          return;
        }

        const from = searchParams.get("from");
        router.push(from && from.startsWith("/adminku") ? from : "/adminku");
        router.refresh();
      } catch {
        setError("Terjadi kesalahan jaringan");
      }
    });
  }

  return (
    <main className="aura relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <span className="text-xl font-bold uppercase tracking-[0.16em]">
              FEYBER
            </span>
          </div>
          <h1 className="display mt-6 text-3xl">Masuk studio</h1>
          <p className="mt-2 text-sm text-text-3">
            Kelola portfolio dari satu tempat.
          </p>
        </div>

        <div className="card-flat p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="label mb-2.5 block !text-text-3"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="rounded-xl border border-danger/35 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isPending || !password}
            >
              {isPending ? "Memverifikasi…" : "Masuk"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-text-4">
          Private area · FEYBER
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
