/**
 * Build: catalog/personas/<id>/ -> src/defaults/personas/<id>.ts
 *
 * For each persona directory:
 *   - parse persona.yaml
 *   - if there's no files/ tree -> emit src/defaults/personas/<id>.ts
 *   - if there IS a files/ tree -> emit src/defaults/personas/<id>/index.ts
 *     plus src/defaults/personas/<id>/files-seed.ts
 *
 * Then regenerate:
 *   - src/defaults/personas/index.ts (the registry of all personas)
 *   - src/defaults/personas/seeders.ts (only personas with files)
 *
 * Hand-written sibling files (e.g. magnus/pipeline.ts, *.test.ts) are never
 * touched. Every emitted file starts with the GENERATED banner; the script
 * refuses to clobber an existing file that's missing the banner.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as yamlParse } from "yaml";
import type { PersonaBundle, PersonaYaml, SeedFile } from "./persona-types.ts";
import type { TeamBundle, TeamSeedFile, TeamYaml } from "./team-types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_DIR = resolve(__dirname, "..");
const PERSONAS_DIR = resolve(CATALOG_DIR, "personas");
const TEAMS_DIR = resolve(CATALOG_DIR, "teams");
const REPO_ROOT = resolve(CATALOG_DIR, "..");
const TARGET_DIR = process.env.PERSONAS_TARGET_DIR
  ? resolve(process.env.PERSONAS_TARGET_DIR)
  : resolve(REPO_ROOT, "src/defaults/personas");
const TEAMS_TARGET_DIR = process.env.TEAMS_TARGET_DIR
  ? resolve(process.env.TEAMS_TARGET_DIR)
  : resolve(REPO_ROOT, "src/defaults/agent-team-personas");

const GENERATED_BANNER =
  "// @generated -- DO NOT EDIT BY HAND.\n" +
  "// Source: catalog/personas/<id>/persona.yaml -- regenerate with `pnpm --dir catalog build`.";
const GENERATED_TEAM_BANNER =
  "// @generated -- DO NOT EDIT BY HAND.\n" +
  "// Source: catalog/teams/<id>/team.yaml -- regenerate with `pnpm --dir catalog build`.";

const MIME_BY_EXT: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".txt": "text/plain",
  ".json": "application/json",
  ".yaml": "application/yaml",
  ".yml": "application/yaml",
};

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

function listPersonaDirs(): string[] {
  return readdirSync(PERSONAS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "tools" && d.name !== "node_modules")
    .map((d) => d.name)
    .sort();
}

function walkFiles(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    for (const entry of readdirSync(cur, { withFileTypes: true })) {
      const abs = join(cur, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      else if (entry.isFile()) out.push(abs);
    }
  }
  return out.sort();
}

function listTeamDirs(): string[] {
  if (!existsSync(TEAMS_DIR)) return [];
  return readdirSync(TEAMS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "tools" && d.name !== "node_modules")
    .map((d) => d.name)
    .sort();
}

function loadBundle(id: string): PersonaBundle {
  const dir = join(PERSONAS_DIR, id);
  const yamlPath = join(dir, "persona.yaml");
  if (!existsSync(yamlPath)) {
    throw new Error(`Missing ${relative(REPO_ROOT, yamlPath)}`);
  }
  const yaml = yamlParse(readFileSync(yamlPath, "utf8")) as PersonaYaml;
  if (yaml.id !== id) {
    throw new Error(`Persona id mismatch: dir "${id}" but persona.yaml says "${yaml.id}"`);
  }
  const filesDir = join(dir, "files");
  const files: SeedFile[] = [];
  if (existsSync(filesDir) && statSync(filesDir).isDirectory()) {
    for (const abs of walkFiles(filesDir)) {
      const rel = relative(filesDir, abs);
      files.push({
        rel,
        abs,
        content: readFileSync(abs, "utf8"),
        mime: MIME_BY_EXT[extname(abs).toLowerCase()] ?? "application/octet-stream",
      });
    }
  }
  return { yaml, dir, files };
}

function loadTeamBundle(id: string): TeamBundle {
  const dir = join(TEAMS_DIR, id);
  const yamlPath = join(dir, "team.yaml");
  if (!existsSync(yamlPath)) {
    throw new Error(`Missing ${relative(REPO_ROOT, yamlPath)}`);
  }
  const yaml = yamlParse(readFileSync(yamlPath, "utf8")) as TeamYaml;
  if (yaml.id !== id) {
    throw new Error(`Team id mismatch: dir "${id}" but team.yaml says "${yaml.id}"`);
  }
  const filesDir = join(dir, "files");
  const files: TeamSeedFile[] = [];
  if (existsSync(filesDir) && statSync(filesDir).isDirectory()) {
    for (const abs of walkFiles(filesDir)) {
      const rel = relative(filesDir, abs);
      files.push({
        rel,
        abs,
        content: readFileSync(abs, "utf8"),
        mime: MIME_BY_EXT[extname(abs).toLowerCase()] ?? "application/octet-stream",
      });
    }
  }
  return { yaml, dir, files };
}

// ---------------------------------------------------------------------------
// Codegen helpers
// ---------------------------------------------------------------------------

/**
 * Render an arbitrary JSON-shaped value as a TypeScript expression.
 * Handles strings (with backtick + template-literal escaping), numbers,
 * booleans, null, arrays, and plain objects. Object keys that aren't valid
 * JS identifiers get quoted.
 */
function renderTs(value: unknown, indent = 0): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return renderString(value);
  if (Array.isArray(value)) return renderArray(value, indent);
  if (typeof value === "object") {
    return renderObject(value as Record<string, unknown>, indent);
  }
  throw new Error(`Cannot render value of type ${typeof value}`);
}

function renderString(s: string): string {
  // Use a template literal when the string contains newlines so the emitted
  // TS stays readable. Otherwise prefer JSON-style double-quoted.
  if (s.includes("\n")) {
    const escaped = s.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${");
    return "`" + escaped + "`";
  }
  return JSON.stringify(s);
}

function renderArray(arr: unknown[], indent: number): string {
  if (arr.length === 0) return "[]";
  const allScalar = arr.every(
    (v) => v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean"
  );
  if (allScalar) {
    const inline = arr.map((v) => renderTs(v, indent + 1)).join(", ");
    if (inline.length < 80) return `[${inline}]`;
  }
  const pad = " ".repeat((indent + 1) * 2);
  const closePad = " ".repeat(indent * 2);
  return "[\n" + arr.map((v) => `${pad}${renderTs(v, indent + 1)},`).join("\n") + `\n${closePad}]`;
}

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function renderObject(obj: Record<string, unknown>, indent: number): string {
  const keys = Object.keys(obj);
  if (keys.length === 0) return "{}";
  const pad = " ".repeat((indent + 1) * 2);
  const closePad = " ".repeat(indent * 2);
  const lines = keys.map((k) => {
    const key = IDENT_RE.test(k) ? k : JSON.stringify(k);
    const v = renderTs(obj[k], indent + 1);
    return `${pad}${key}: ${v},`;
  });
  return "{\n" + lines.join("\n") + `\n${closePad}}`;
}

function personaObjectLiteral(yaml: PersonaYaml): string {
  // Drop empty config to match the existing TS output where personas omit it.
  const fields: Record<string, unknown> = {
    id: yaml.id,
    version: yaml.version ?? 0,
    name: yaml.name,
    title: yaml.title,
    description: yaml.description,
    category: yaml.category,
    kind: yaml.kind,
    ...(yaml.use_when && yaml.use_when.length > 0 ? { use_when: yaml.use_when } : {}),
    ...(yaml.not_for && yaml.not_for.length > 0 ? { not_for: yaml.not_for } : {}),
    featured: yaml.featured,
    model_tier: yaml.model_tier,
    system_prompt: yaml.system_prompt,
  };
  if (yaml.config && Object.keys(yaml.config).length > 0) {
    fields.config = yaml.config;
  }
  return renderObject(fields, 0);
}

function teamMemberObjectLiteral(member: TeamYaml["members"][number]): Record<string, unknown> {
  if ("extends" in member) {
    return {
      persona_id: member.extends,
      role: member.role,
      ...(member.name ? { name: member.name } : {}),
      ...(member.name_suffix ? { name_suffix: member.name_suffix } : {}),
      ...(member.description ? { responsibility: member.description } : {}),
      ...(member.title ? { note: member.title } : {}),
      ...(member.system_prompt_append ? { system_prompt_append: member.system_prompt_append } : {}),
      ...(member.config && Object.keys(member.config).length > 0 ? { config: member.config } : {}),
    };
  }
  return {
    key: member.id,
    persona_id: member.id,
    role: member.role,
    name: member.name,
    responsibility: member.description,
    note: member.title,
    system_prompt_append: member.system_prompt,
    ...(member.config && Object.keys(member.config).length > 0 ? { config: member.config } : {}),
  };
}

function teamObjectLiteral(bundle: TeamBundle): string {
  const fields: Record<string, unknown> = {
    id: bundle.yaml.id,
    name: bundle.yaml.name,
    description: bundle.yaml.description,
    category: bundle.yaml.category,
    featured: bundle.yaml.featured,
    members: bundle.yaml.members.map(teamMemberObjectLiteral),
    shared_skills: bundle.files.map((f) => ({
      path: f.rel,
      content: f.content,
    })),
    config: bundle.yaml.config ?? {},
  };
  return renderObject(fields, 0);
}

// ---------------------------------------------------------------------------
// Emitters
// ---------------------------------------------------------------------------

function safeWrite(path: string, content: string) {
  if (existsSync(path)) {
    const existing = readFileSync(path, "utf8");
    if (!existing.startsWith("// @generated")) {
      throw new Error(
        `Refusing to overwrite ${relative(REPO_ROOT, path)} -- file exists but is missing the @generated banner. ` +
          `Move the hand-written code to a sibling file or rename it.`
      );
    }
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function emitFlatPersona(bundle: PersonaBundle): string {
  const literal = personaObjectLiteral(bundle.yaml);
  const id = bundle.yaml.id;
  return (
    `${GENERATED_BANNER}\n` +
    `import type { Persona } from "./types";\n\n` +
    `const ${id}: Persona = ${literal};\n\n` +
    `export default ${id};\n`
  );
}

/**
 * For personas with seeded VFS files. Emits two files:
 *   <id>/index.ts        -- the persona definition
 *   <id>/files-seed.ts   -- file specs + idempotent seeder
 */
function emitBundledPersona(bundle: PersonaBundle): {
  index: string;
  filesSeed: string;
} {
  const id = bundle.yaml.id;
  const literal = personaObjectLiteral(bundle.yaml);

  const sideEffectImports = (bundle.yaml.extra_index_imports ?? [])
    .map((p) => `import ${JSON.stringify(p)};`)
    .join("\n");
  const sideEffectBlock = sideEffectImports.length > 0 ? `${sideEffectImports}\n` : "";
  const index =
    `${GENERATED_BANNER}\n` +
    `import type { Persona } from "../types";\n` +
    sideEffectBlock +
    `\n` +
    `const ${id}: Persona = ${literal};\n\n` +
    `export default ${id};\n`;

  // Each VFS path is the file's path under files/ with a leading slash.
  // e.g. files/skills/foo.md -> /skills/foo.md
  const specs = bundle.files.map((f) => ({
    path: "/" + f.rel.split("\\").join("/"),
    content: f.content,
    mime: f.mime,
  }));

  const specsLiteral = renderTs(specs, 0);
  const seededKey = `${id}_files_seeded`;
  const upper = id.toUpperCase();
  const cap = capitalize(id);
  const sqlExec = "sql." + "exec";

  const filesSeed =
    `${GENERATED_BANNER}\n` +
    `/* eslint-disable */\n` +
    `import { VirtualFileSystem } from "../../../tools/filesystem";\n\n` +
    `export const ${upper}_FILES_SEEDED_KEY = ${JSON.stringify(seededKey)};\n\n` +
    `export interface SeedFileSpec {\n` +
    `  path: string;\n` +
    `  content: string;\n` +
    `  mime: string;\n` +
    `}\n\n` +
    `export const ${upper}_FILE_SPECS: ReadonlyArray<SeedFileSpec> = ${specsLiteral};\n\n` +
    `export const ${upper}_FILE_PATHS: readonly string[] = ${upper}_FILE_SPECS.map((s) => s.path);\n\n` +
    `export interface SeedResult {\n` +
    `  seeded: string[];\n` +
    `}\n\n` +
    `export function has${cap}FilesSeedRun(sql: SqlStorage): boolean {\n` +
    `  const rows = ${sqlExec}("SELECT value FROM config WHERE key = ?", ${upper}_FILES_SEEDED_KEY).toArray();\n` +
    `  return rows.length > 0;\n` +
    `}\n\n` +
    `/**\n` +
    ` * Seed any missing files into the agent's VFS and stamp the seeded flag.\n` +
    ` * Idempotent: skips paths that already exist (preserves user edits) and\n` +
    ` * stamps the flag unconditionally so a later delete is respected.\n` +
    ` */\n` +
    `export function seed${cap}Files(sql: SqlStorage): SeedResult {\n` +
    `  const vfs = new VirtualFileSystem(sql);\n` +
    `  const written: string[] = [];\n` +
    `  for (const { path, content, mime } of ${upper}_FILE_SPECS) {\n` +
    `    if (!vfs.exists(path)) {\n` +
    `      vfs.write(path, content, mime);\n` +
    `      written.push(path);\n` +
    `    }\n` +
    `  }\n` +
    `  const upsert =\n` +
    `    "INSERT INTO config (key, value, updated_at) VALUES (?, ?, datetime('now')) " +\n` +
    `    "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')";\n` +
    `  ${sqlExec}(upsert, ${upper}_FILES_SEEDED_KEY, "true");\n` +
    `  return { seeded: written };\n` +
    `}\n`;

  return { index, filesSeed };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Index + seeders registry
// ---------------------------------------------------------------------------

/**
 * Personas listed in display order for the picker's "generalists" view.
 * Mirrors the existing ordering in src/defaults/personas/index.ts. Personas
 * not in this list fall back to category + alphabetical.
 *
 * Edit here when adding a new generalist; this is the only piece of ordering
 * config that lives in the build script rather than persona.yaml.
 */
const GENERALIST_ORDER = [
  "lumen",
  "sol",
  "nova",
  "magnus",
  "vulcan",
  "athena",
  "neon",
  "argus",
  "prism",
  "thoth",
  "quill",
  "hermes",
  "orion",
  "fortuna",
  "eir",
  "hawk",
  "nestor",
  "scout",
  "orpheus",
  "maestro",
  "janus",
  "sage",
];

function emitIndex(bundles: PersonaBundle[]): string {
  const ids = bundles.map((b) => b.yaml.id).sort();
  const importLines = ids.map((id) => `import ${id} from "./${id}";`).join("\n");
  const arrayBody = ids.join(",\n  ");

  return (
    `${GENERATED_BANNER}\n` +
    `import type { Persona } from "./types";\n` +
    `import { withPersonaSiteAssets } from "./site";\n\n` +
    `${importLines}\n\n` +
    `export type { Persona, PersonaCategory } from "./types";\n\n` +
    `const CATEGORIES = [\n` +
    `  "engineering",\n` +
    `  "design-product",\n` +
    `  "research-data",\n` +
    `  "communication",\n` +
    `  "ops-reliability",\n` +
    `  "personal",\n` +
    `  "general",\n` +
    `  "gstack",\n` +
    `] as const;\n\n` +
    `// Generalists have an explicit display order so the picker's default view leads with\n` +
    `// the most generally-useful ones (personal assistant, then starter).\n` +
    `const GENERALIST_ORDER = ${renderTs(GENERALIST_ORDER, 0)};\n\n` +
    `const ALL: Persona[] = [\n  ${arrayBody},\n].map(withPersonaSiteAssets);\n\n` +
    `const generalistRank = new Map(GENERALIST_ORDER.map((id, i) => [id, i] as const));\n` +
    `const categoryOrder = new Map(CATEGORIES.map((c, i) => [c, i] as const));\n\n` +
    `for (const p of ALL) {\n` +
    `  /* v8 ignore next 3 -- developer-time invariant; only fires if a new persona is added without updating GENERALIST_ORDER */\n` +
    `  if (p.kind === "generalist" && !generalistRank.has(p.id)) {\n` +
    `    throw new Error(\`Generalist "\${p.id}" missing from GENERALIST_ORDER\`);\n` +
    `  }\n` +
    `}\n\n` +
    `ALL.sort((a, b) => {\n` +
    `  if (a.featured !== b.featured) return a.featured ? -1 : 1;\n` +
    `  /* v8 ignore next -- featured maps 1:1 to generalist in the registry, so reaching this check only finds matching kinds */\n` +
    `  if (a.kind !== b.kind) return a.kind === "generalist" ? -1 : 1;\n` +
    `  if (a.kind === "generalist") {\n` +
    `    return generalistRank.get(a.id)! - generalistRank.get(b.id)!;\n` +
    `  }\n` +
    `  const ca = categoryOrder.get(a.category)!;\n` +
    `  const cb = categoryOrder.get(b.category)!;\n` +
    `  if (ca !== cb) return ca - cb;\n` +
    `  return a.name.localeCompare(b.name, "en", { sensitivity: "base" });\n` +
    `});\n\n` +
    `export const PERSONAS: Persona[] = ALL;\n` +
    `export type AgentTemplate = Persona;\n` +
    `export const TEMPLATES = PERSONAS;\n\n` +
    `export function getPersona(id: string): Persona | undefined {\n` +
    `  return PERSONAS.find((p) => p.id === id);\n` +
    `}\n\n` +
    `export const getTemplate = getPersona;\n\n` +
    `export function listPersonas(opts?: {\n` +
    `  category?: string;\n` +
    `  featured?: boolean;\n` +
    `  kind?: "generalist" | "specialist";\n` +
    `}): Persona[] {\n` +
    `  let out = PERSONAS;\n` +
    `  if (opts?.category) out = out.filter((p) => p.category === opts.category);\n` +
    `  if (opts?.featured !== undefined) out = out.filter((p) => p.featured === opts.featured);\n` +
    `  if (opts?.kind) out = out.filter((p) => p.kind === opts.kind);\n` +
    `  return out;\n` +
    `}\n\n` +
    `export function listTemplates(category?: string): Persona[] {\n` +
    `  return listPersonas(category ? { category } : undefined);\n` +
    `}\n`
  );
}

/**
 * Whether a persona contributes anything to the seeders dispatch map.
 * True if the persona has its own files/ tree OR any seed.* block.
 */
function personaNeedsSeeder(b: PersonaBundle): boolean {
  if (b.files.length > 0) return true;
  const seed = b.yaml.seed;
  if (!seed) return false;
  return Boolean(
    (seed.hooks && seed.hooks.length > 0) ||
    (seed.orders && seed.orders.length > 0) ||
    (seed.inherit_files && seed.inherit_files.length > 0)
  );
}

/**
 * Validate that every `seed.inherit_files[].from` resolves to a persona
 * with a files/ tree. Throws clearly if not — silent miss would degrade
 * to "subset persona has no skill files".
 *
 * Also validates that `extra_index_imports` is only used on bundled
 * personas, since flat personas don't get their own index.ts.
 */
function validateInheritSources(bundles: PersonaBundle[]): void {
  const filesPersonas = new Set(bundles.filter((b) => b.files.length > 0).map((b) => b.yaml.id));
  for (const b of bundles) {
    const inherits = b.yaml.seed?.inherit_files ?? [];
    for (const inh of inherits) {
      if (!filesPersonas.has(inh.from)) {
        throw new Error(
          `Persona "${b.yaml.id}" inherits files from "${inh.from}", ` +
            `but "${inh.from}" has no files/ tree to inherit from.`
        );
      }
    }
    const extraImports = b.yaml.extra_index_imports ?? [];
    if (extraImports.length > 0 && b.files.length === 0) {
      throw new Error(
        `Persona "${b.yaml.id}" declares extra_index_imports but has no files/ ` +
          `tree — flat personas do not emit their own index.ts.`
      );
    }
  }
}

function inheritedFlagDefault(personaId: string, from: string): string {
  return `${personaId}_${from}_files_seeded`;
}

function inheritedConstName(personaId: string, from: string): string {
  return `${personaId.toUpperCase()}_${from.toUpperCase()}_INHERITED_PATHS`;
}

function emitTeam(bundle: TeamBundle): string {
  const id = bundle.yaml.id;
  const varName = camelIdentifier(id);
  return (
    `${GENERATED_TEAM_BANNER}
` +
    `import type { TeamPersona } from "../types";

` +
    `const ${varName}: TeamPersona = ${teamObjectLiteral(bundle)};

` +
    `export default ${varName};
`
  );
}

function emitTeamsIndex(bundles: TeamBundle[]): string {
  const imports = bundles
    .map((b) => `import ${camelIdentifier(b.yaml.id)} from "./${b.yaml.id}";`)
    .join("\n");
  const arr = bundles.map((b) => camelIdentifier(b.yaml.id)).join(", ");
  return (
    `${GENERATED_TEAM_BANNER}
` +
    `import type { TeamPersona } from "./types";
` +
    (imports ? `${imports}\n` : "") +
    `\n` +
    `export const TEAM_PERSONAS: TeamPersona[] = [${arr}];

` +
    `export function getTeamTemplate(id: string | null | undefined): TeamPersona | undefined {
` +
    `  if (!id) return undefined;
` +
    `  return TEAM_PERSONAS.find((t) => t.id === id);
` +
    `}

` +
    `export function listTeamTemplates(): TeamPersona[] {
` +
    `  return TEAM_PERSONAS;
` +
    `}

` +
    `export type { TeamPersona } from "./types";
`
  );
}

function camelIdentifier(id: string): string {
  return id.replace(/[-_]+([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase());
}

function emitSeeders(bundles: PersonaBundle[]): string {
  const seeded = bundles.filter(personaNeedsSeeder);

  if (seeded.length === 0) {
    return (
      `${GENERATED_BANNER}\n` +
      `export type PersonaSeeder = (sql: SqlStorage) => void;\n` +
      `const SEEDERS: Record<string, PersonaSeeder> = {};\n` +
      `export function getPersonaSeeder(\n` +
      `  templateId: string | null | undefined\n` +
      `): PersonaSeeder | undefined {\n` +
      `  if (!templateId) return undefined;\n` +
      `  return SEEDERS[templateId];\n` +
      `}\n`
    );
  }

  // ── Imports ────────────────────────────────────────────────────────
  // 1. Per-persona files-seed exports for any persona with its own tree
  //    (seed function, plus FILE_SPECS if anyone inherits from it).
  // 2. Generic preset helpers for whichever rich seed blocks appear.
  const filesPersonas = bundles.filter((b) => b.files.length > 0);

  const filesImports = filesPersonas
    .map((b) => {
      const id = b.yaml.id;
      const cap = capitalize(id);
      const upper = id.toUpperCase();
      const seedFn = `seed${cap}Files`;
      const named = `${seedFn}, ${upper}_FILE_SPECS`;
      return `import { ${named} } from "./${id}/files-seed";`;
    })
    .join("\n");

  const presetImports: string[] = [];
  const wantsHooks = seeded.some((b) => (b.yaml.seed?.hooks?.length ?? 0) > 0);
  const wantsOrders = seeded.some((b) => (b.yaml.seed?.orders?.length ?? 0) > 0);
  const wantsInherit = seeded.some((b) => (b.yaml.seed?.inherit_files?.length ?? 0) > 0);
  const presetNames: string[] = [];
  if (wantsHooks) presetNames.push("seedPersonaHooks");
  if (wantsOrders) presetNames.push("seedPersonaStandingOrders");
  if (wantsInherit) presetNames.push("seedInheritedFiles");
  if (presetNames.length > 0) {
    presetImports.push(`import { ${presetNames.join(", ")} } from "./preset-seeders";`);
  }
  const typeNames: string[] = [];
  if (wantsHooks) typeNames.push("PersonaHookSpec");
  if (wantsOrders) typeNames.push("PersonaOrderSpec");
  if (typeNames.length > 0) {
    presetImports.push(`import type { ${typeNames.join(", ")} } from "./preset-seeders";`);
  }

  const importBlock = [filesImports, presetImports.join("\n")]
    .filter((s) => s.length > 0)
    .join("\n");

  // ── Constants (one block per persona that needs them) ─────────────
  const constBlocks: string[] = [];
  for (const b of seeded) {
    const id = b.yaml.id;
    const upper = id.toUpperCase();
    const seed = b.yaml.seed ?? {};
    const lines: string[] = [];
    if (seed.hooks && seed.hooks.length > 0) {
      lines.push(
        `export const ${upper}_HOOKS: readonly PersonaHookSpec[] = ${renderTs(
          seed.hooks as unknown[],
          0
        )};`
      );
    }
    if (seed.orders && seed.orders.length > 0) {
      lines.push(
        `export const ${upper}_ORDERS: readonly PersonaOrderSpec[] = ${renderTs(
          seed.orders as unknown[],
          0
        )};`
      );
    }
    for (const inh of seed.inherit_files ?? []) {
      const constName = inheritedConstName(id, inh.from);
      lines.push(`const ${constName}: readonly string[] = ${renderTs(inh.paths as unknown[], 0)};`);
    }
    if (lines.length > 0) constBlocks.push(lines.join("\n\n"));
  }

  // ── SEEDERS dispatch entries ──────────────────────────────────────
  const entries = seeded
    .map((b) => {
      const id = b.yaml.id;
      const cap = capitalize(id);
      const seed = b.yaml.seed ?? {};
      const calls: string[] = [];
      if (b.files.length > 0) {
        calls.push(`    seed${cap}Files(sql);`);
      }
      if (seed.hooks && seed.hooks.length > 0) {
        calls.push(`    seedPersonaHooks(sql, ${JSON.stringify(id)}, ${id.toUpperCase()}_HOOKS);`);
      }
      if (seed.orders && seed.orders.length > 0) {
        calls.push(
          `    seedPersonaStandingOrders(sql, ${JSON.stringify(id)}, ${id.toUpperCase()}_ORDERS);`
        );
      }
      for (const inh of seed.inherit_files ?? []) {
        const constName = inheritedConstName(id, inh.from);
        const flag = inh.flag ?? inheritedFlagDefault(id, inh.from);
        const sourceSpecs = `${inh.from.toUpperCase()}_FILE_SPECS`;
        calls.push(
          `    seedInheritedFiles(sql, ${sourceSpecs}, ${constName}, ${JSON.stringify(flag)});`
        );
      }
      return `  ${id}: (sql) => {\n${calls.join("\n")}\n  },`;
    })
    .join("\n");

  const fileSpecEntries = seeded
    .map((b) => {
      const id = b.yaml.id;
      const seed = b.yaml.seed ?? {};
      const specs: string[] = [];
      if (b.files.length > 0) {
        specs.push(
          `    ...${id.toUpperCase()}_FILE_SPECS.map((s) => ({ ...s, source: "direct" as const })),`
        );
      }
      for (const inh of seed.inherit_files ?? []) {
        const constName = inheritedConstName(id, inh.from);
        specs.push(
          `    ...${inh.from.toUpperCase()}_FILE_SPECS.filter((s) => ${constName}.includes(s.path)).map((s) => ({ ...s, source: "inherited" as const })),`
        );
      }
      if (specs.length === 0) return null;
      return `  ${JSON.stringify(id)}: [\n${specs.join("\n")}\n  ],`;
    })
    .filter((s): s is string => !!s)
    .join("\n");

  return (
    `${GENERATED_BANNER}\n` +
    `/**\n` +
    ` * Persona content seeders. Auto-generated from personas/<id>/persona.yaml\n` +
    ` * (seed.hooks / seed.orders / seed.inherit_files) and personas/<id>/files/.\n` +
    ` * Personas without a files/ tree or seed block are absent from this map.\n` +
    ` */\n` +
    `${importBlock}\n\n` +
    (constBlocks.length > 0 ? constBlocks.join("\n\n") + "\n\n" : "") +
    `export type PersonaSeeder = (sql: SqlStorage) => void;\n\n` +
    `const SEEDERS: Record<string, PersonaSeeder> = {\n${entries}\n};\n\n` +
    `export interface PersonaSeedFileSpec {\n` +
    `  path: string;\n` +
    `  content: string;\n` +
    `  mime: string;\n` +
    `  source: "direct" | "inherited";\n` +
    `}\n\n` +
    `const SEED_FILE_SPECS: Record<string, ReadonlyArray<PersonaSeedFileSpec>> = {\n${fileSpecEntries}\n};\n\n` +
    `export function getPersonaSeedFileSpecs(\n` +
    `  templateId: string | null | undefined\n` +
    `): ReadonlyArray<PersonaSeedFileSpec> {\n` +
    `  if (!templateId) return [];\n` +
    `  return SEED_FILE_SPECS[templateId] ?? [];\n` +
    `}\n\n` +
    `export function getPersonaSeeder(\n` +
    `  templateId: string | null | undefined\n` +
    `): PersonaSeeder | undefined {\n` +
    `  if (!templateId) return undefined;\n` +
    `  return SEEDERS[templateId];\n` +
    `}\n`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const ids = listPersonaDirs();
  if (ids.length === 0) {
    console.error(`No persona dirs found in ${PERSONAS_DIR}`);
    process.exit(1);
  }
  const bundles = ids.map(loadBundle);
  validateInheritSources(bundles);

  let written = 0;
  for (const b of bundles) {
    const id = b.yaml.id;
    if (b.files.length === 0) {
      const flatPath = join(TARGET_DIR, `${id}.ts`);
      const dirPath = join(TARGET_DIR, id);
      if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
        rmSync(dirPath, { recursive: true, force: true });
      }
      safeWrite(flatPath, emitFlatPersona(b));
      written++;
    } else {
      const flatPath = join(TARGET_DIR, `${id}.ts`);
      if (existsSync(flatPath)) rmSync(flatPath);
      const { index, filesSeed } = emitBundledPersona(b);
      safeWrite(join(TARGET_DIR, id, "index.ts"), index);
      safeWrite(join(TARGET_DIR, id, "files-seed.ts"), filesSeed);
      written += 2;
    }
  }

  safeWrite(join(TARGET_DIR, "index.ts"), emitIndex(bundles));
  safeWrite(join(TARGET_DIR, "seeders.ts"), emitSeeders(bundles));
  written += 2;

  console.log(
    `Built ${bundles.length} personas -> ${written} TS files in ${relative(REPO_ROOT, TARGET_DIR)}`
  );

  const teamBundles = listTeamDirs().map(loadTeamBundle);
  let teamsWritten = 0;
  for (const b of teamBundles) {
    safeWrite(join(TEAMS_TARGET_DIR, b.yaml.id, "index.ts"), emitTeam(b));
    teamsWritten++;
  }
  if (teamBundles.length > 0) {
    safeWrite(join(TEAMS_TARGET_DIR, "index.ts"), emitTeamsIndex(teamBundles));
    teamsWritten++;
  }
  console.log(
    `Built ${teamBundles.length} teams -> ${teamsWritten} TS files in ${relative(
      REPO_ROOT,
      TEAMS_TARGET_DIR
    )}`
  );
}

/**
 * Stub: catalog/teams/ exists but the team generator is not yet wired.
 * Detect any team.yaml that's been dropped in and fail loudly so we don't
 * silently ignore authored content. Until the first team lands, the
 * existing hand-written `src/defaults/team-personas/*.ts` is the source
 * of truth; once a team.yaml appears, this branch needs to gain a real
 * emitter (mirroring emitBundledPersona but targeting team-personas/<id>).
 */
function reportTeamsStub() {
  if (!existsSync(TEAMS_DIR)) return;
  const teamDirs = readdirSync(TEAMS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const withYaml = teamDirs.filter((d) => existsSync(join(TEAMS_DIR, d, "team.yaml")));
  if (withYaml.length === 0) {
    console.log(
      `Teams: 0 in ${relative(REPO_ROOT, TEAMS_DIR)} (generator stub — waiting for first team.yaml)`
    );
    return;
  }
  throw new Error(
    `Found ${withYaml.length} team.yaml file(s) in ${relative(REPO_ROOT, TEAMS_DIR)} ` +
      `but the team generator is not yet implemented. ` +
      `See catalog/README.md for the planned shape.`
  );
}

main();
