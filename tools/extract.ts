/**
 * One-shot extractor: src/defaults/personas/*.ts → catalog/personas/<id>/persona.yaml
 *
 * Run once to populate the YAML source-of-truth from the existing TS files.
 * After that, edits happen in YAML and `pnpm build` regenerates the TS.
 *
 * Magnus's gstack skill markdowns (currently inlined as template literals in
 * src/defaults/personas/magnus/skills.ts) are extracted to
 * catalog/personas/magnus/files/skills/*.md.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify as yamlStringify } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_DIR = resolve(__dirname, "..");
const REPO_ROOT = resolve(CATALOG_DIR, "..");
const PERSONAS_DIR = resolve(CATALOG_DIR, "personas");

interface PersonaInput {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  kind: string;
  featured: boolean;
  model_tier: string;
  system_prompt: string;
  config: Record<string, unknown>;
  // The runtime objects also carry profile_image / default_site (derived from
  // withPersonaSiteAssets). We strip those during extraction — they're recomputed
  // at runtime, never authored.
  profile_image?: unknown;
  default_site?: unknown;
}

async function loadPersonas(): Promise<PersonaInput[]> {
  // Importing the personas index pulls in `./site` which is pure Node-safe
  // code and individual persona modules which only `import type` from the
  // wider codebase. Safe to import under tsx.
  const mod = await import(join(REPO_ROOT, "src/defaults/personas/index.ts"));
  return mod.PERSONAS as PersonaInput[];
}

function stripDerived(p: PersonaInput) {
  const { profile_image: _pi, default_site: _ds, ...rest } = p;
  void _pi;
  void _ds;
  return rest;
}

/**
 * Order keys in the output so the YAML reads top-down: identity → display →
 * behavior → config. Stringify in this order regardless of the source object.
 */
const KEY_ORDER = [
  "id",
  "name",
  "title",
  "description",
  "category",
  "kind",
  "featured",
  "model_tier",
  "system_prompt",
  "config",
] as const;

function orderedYaml(obj: Record<string, unknown>): string {
  const ordered: Record<string, unknown> = {};
  for (const k of KEY_ORDER) {
    if (k in obj && obj[k] !== undefined) ordered[k] = obj[k];
  }
  // Anything unexpected gets appended at the bottom so it's not silently dropped.
  for (const [k, v] of Object.entries(obj)) {
    if (!(k in ordered)) ordered[k] = v;
  }
  return yamlStringify(ordered, {
    lineWidth: 0,
    blockQuote: "literal",
    defaultStringType: "PLAIN",
    defaultKeyType: "PLAIN",
    minContentWidth: 0,
  });
}

function writePersonaYaml(p: PersonaInput) {
  const stripped = stripDerived(p);
  const dir = join(PERSONAS_DIR, p.id);
  mkdirSync(dir, { recursive: true });
  // If config is empty, drop the key entirely.
  if (
    stripped.config &&
    typeof stripped.config === "object" &&
    Object.keys(stripped.config).length === 0
  ) {
    delete (stripped as Record<string, unknown>).config;
  }
  const yaml = orderedYaml(stripped as Record<string, unknown>);
  writeFileSync(join(dir, "persona.yaml"), yaml, "utf8");
}

/**
 * Magnus is the only persona today that bundles VFS-seed content. Its
 * markdowns live as TS template literals in
 * src/defaults/personas/magnus/skills.ts; we walk the GSTACK_SKILL_SPECS array
 * and dump each to personas/magnus/files/skills/<name>.md.
 */
async function extractMagnusFiles() {
  const skillsMod = await import(
    join(REPO_ROOT, "src/defaults/personas/magnus/skills.ts")
  );
  const specs = skillsMod.GSTACK_SKILL_SPECS as ReadonlyArray<{
    path: string;
    content: string;
  }>;
  for (const spec of specs) {
    // VFS path looks like "/skills/office-hours.md" — drop leading slash and
    // root it under personas/magnus/files/.
    const rel = spec.path.replace(/^\/+/, "");
    const abs = join(PERSONAS_DIR, "magnus", "files", rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, spec.content, "utf8");
  }
  console.log(`  + magnus/files/skills/ (${specs.length} skill files)`);
}

async function main() {
  const personas = await loadPersonas();
  console.log(`Extracting ${personas.length} personas → ${PERSONAS_DIR}`);
  for (const p of personas) {
    writePersonaYaml(p);
    console.log(`  + ${p.id}/persona.yaml`);
  }
  await extractMagnusFiles();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
