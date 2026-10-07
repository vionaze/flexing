import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");

export interface AiSettings {
  aiBaseUrl?: string;
  aiModel?: string;
  aiApiKey?: string;
}

export async function readAiSettings(): Promise<AiSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(raw) as AiSettings;
    return {
      aiBaseUrl: parsed.aiBaseUrl,
      aiModel: parsed.aiModel,
      aiApiKey: parsed.aiApiKey,
    };
  } catch {
    return {};
  }
}

export async function writeAiSettings(patch: AiSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const current = await readAiSettings();
  const next: AiSettings = {
    ...current,
    ...Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined && v !== "")
    ),
  };
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), "utf8");
}

/** Efektif: settings dari /adminku menang, fallback ke env lama */
export async function getEffectiveAiSettings(): Promise<{
  apiKey: string;
  baseUrl: string;
  model: string;
}> {
  const file = await readAiSettings();
  return {
    apiKey: file.aiApiKey || process.env.AI_API_KEY || "",
    baseUrl:
      file.aiBaseUrl || process.env.AI_BASE_URL || "https://api.openai.com/v1",
    model: file.aiModel || process.env.AI_MODEL || "gpt-4o-mini",
  };
}
