// Key-parity check: every lib/i18n/<lang>.ts must expose the same key structure
// as en.ts (source of truth). `legal` is optional outside en/ro (falls back to
// English), so it is excluded from the comparison. Run: npm run i18n:check
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = join(process.cwd(), "lib", "i18n");

function shape(value: unknown, path: string, out: string[]): string[] {
  if (value === null || typeof value !== "object") {
    out.push(path);
    return out;
  }
  if (Array.isArray(value)) {
    out.push(path + "[]");
    return out;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  if (entries.length === 0) {
    out.push(path + "{}");
    return out;
  }
  for (const [k, v] of entries) shape(v, path ? `${path}.${k}` : k, out);
  return out;
}

async function load(file: string): Promise<Record<string, unknown>> {
  const mod = (await import(pathToFileURL(join(dir, file)).href)) as Record<string, unknown>;
  const exported = Object.entries(mod).find(
    ([, v]) => v !== null && typeof v === "object" && !Array.isArray(v),
  );
  if (!exported) throw new Error(`${file}: no object export found`);
  return exported[1] as Record<string, unknown>;
}

async function main(): Promise<void> {
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
  const en = await load("en.ts");
  const enKeys = shape(en, "", []).filter((k) => !k.startsWith("legal"));

  const failures: string[] = [];
  for (const f of files) {
    if (f === "en.ts") continue;
    let mod: Record<string, unknown>;
    try {
      mod = await load(f);
    } catch (err) {
      failures.push(`${f}: import failed: ${(err as Error).message}`);
      continue;
    }
    const keys = shape(mod, "", []).filter((k) => !k.startsWith("legal"));
    const missing = enKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !enKeys.includes(k));
    if (missing.length || extra.length) {
      failures.push(
        `${f}: missing [${missing.join(", ")}] extra [${extra.join(", ")}]`,
      );
    }
  }

  if (failures.length) {
    console.error("i18n key parity FAILED:\n" + failures.join("\n"));
    process.exit(1);
  }
  console.log(`i18n OK: ${files.length} language files match en key structure (${enKeys.length} leaf keys, legal excluded).`);
}

void main();
