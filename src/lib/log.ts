import { promises as fs } from "fs";
import path from "path";
import type { LogAction, LogEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LOG_PATH = path.join(DATA_DIR, "LOG.md");

function formatEntry(entry: LogEntry): string {
  const lines = [
    `## ${entry.timestamp} — ${entry.action}`,
    `- siapa: ${entry.actor}`,
    `- apa: ${entry.summary}`,
  ];
  if (entry.detail) {
    lines.push(`- detail: ${entry.detail}`);
  }
  return lines.join("\n") + "\n";
}

export async function appendLog(entry: {
  action: LogAction;
  actor: string;
  summary: string;
  detail?: string;
}): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const timestamp = new Date().toISOString();
  const block = formatEntry({ ...entry, timestamp });
  await fs.appendFile(LOG_PATH, "\n" + block, "utf8");
}

export async function readLog(): Promise<string> {
  try {
    return await fs.readFile(LOG_PATH, "utf8");
  } catch {
    return "# Activity Log\n\n_(belum ada aktivitas)_\n";
  }
}

export async function readLogEntries(): Promise<LogEntry[]> {
  const raw = await readLog();
  const blocks = raw.split(/^## /m).slice(1);
  const entries: LogEntry[] = [];

  for (const block of blocks) {
    const [header, ...body] = block.split("\n");
    const match = header.match(
      /^(\S+)\s+—\s+(\S+)\s*$/
    );
    if (!match) continue;

    const fields: Record<string, string> = {};
    for (const line of body) {
      const fieldMatch = line.match(/^- ([^:]+):\s*(.*)$/);
      if (fieldMatch) fields[fieldMatch[1]] = fieldMatch[2];
    }

    entries.push({
      timestamp: match[1],
      action: match[2] as LogAction,
      actor: fields["siapa"] ?? "unknown",
      summary: fields["apa"] ?? "",
      detail: fields["detail"],
    });
  }

  return entries.reverse();
}
