import { promises as fs } from "fs";
import path from "path";

interface GithubEnv {
  token: string;
  owner: string;
  repo: string;
}

function getGithubEnv(): GithubEnv | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return null;
  return { token, owner, repo };
}

async function getRemoteSha(
  env: GithubEnv,
  filePath: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${env.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const data = (await res.json()) as { sha?: string };
  return data.sha ?? null;
}

async function putFile(
  env: GithubEnv,
  filePath: string,
  contentBase64: string,
  message: string,
  sha?: string
): Promise<boolean> {
  const res = await fetch(
    `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: contentBase64,
        ...(sha ? { sha } : {}),
      }),
    }
  );
  return res.ok;
}

/**
 * Push data/portfolio.json dan data/LOG.md ke GitHub.
 * Hanya jalan kalau GITHUB_TOKEN + GITHUB_OWNER + GITHUB_REPO di-set.
 * Gagal sync tidak menggagalkan operasi utama.
 */
export async function syncDataToGitHub(reason: string): Promise<void> {
  const env = getGithubEnv();
  if (!env) return;

  const files = ["data/portfolio.json", "data/LOG.md"];
  const timestamp = new Date().toISOString();
  const message = `chore(data): ${reason} [${timestamp}]`;

  for (const relPath of files) {
    try {
      const absPath = path.join(process.cwd(), relPath);
      const raw = await fs.readFile(absPath);
      const contentBase64 = raw.toString("base64");
      const sha = await getRemoteSha(env, relPath);
      await putFile(env, relPath, contentBase64, message, sha ?? undefined);
    } catch {
      // Jangan gagalkan request utama hanya karena sync GitHub
    }
  }
}
