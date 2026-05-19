/**
 * The YAML-serializable persona shape. Mirrors the runtime `Persona` type
 * in src/defaults/personas/types.ts but intentionally omits the
 * derived/auto-generated fields (`profile_image`, `default_site`) — those
 * are computed from category + name at runtime via `withPersonaSiteAssets`.
 */
export type PersonaCategory =
  | "engineering"
  | "design-product"
  | "research-data"
  | "communication"
  | "ops-reliability"
  | "personal"
  | "general"
  | "gstack";

export type PersonaKind = "generalist" | "specialist";
export type ModelTier = "fast" | "advanced" | "standard" | "basic";

export interface PersonaHookYaml {
  name: string;
  timing: "before" | "after";
  tool_pattern: string;
  action: "log" | "block" | "modify_args" | "notify";
  config?: Record<string, unknown>;
  enabled?: boolean;
}

export interface PersonaOrderYaml {
  name: string;
  schedule: string;
  instruction: string;
}

export interface PersonaInheritFilesYaml {
  /** Source persona id — must be a persona with a files/ tree. */
  from: string;
  /** VFS paths to mount; each starts with `/`. */
  paths: string[];
  /** Idempotency flag key. Defaults to `<id>_<from>_files_seeded`. */
  flag?: string;
}

export interface PersonaSeedYaml {
  hooks?: PersonaHookYaml[];
  orders?: PersonaOrderYaml[];
  inherit_files?: PersonaInheritFilesYaml[];
}

export interface PersonaYaml {
  id: string;
  /** Catalog content version. Missing legacy YAML is normalized to v0. */
  version?: number;
  name: string;
  title: string;
  description: string;
  category: PersonaCategory;
  kind: PersonaKind;
  /** Concrete routing triggers for persona selection. */
  use_when?: string[];
  /** Adjacent work this persona should hand off instead of absorbing. */
  not_for?: string[];
  featured: boolean;
  model_tier: ModelTier;
  system_prompt: string;
  config?: Record<string, unknown>;
  seed?: PersonaSeedYaml;
  /**
   * Side-effect import paths added to the generated index.ts. Only valid
   * for bundled personas (those with a files/ tree). Used to wire
   * hand-written sibling modules like `./tools` that register persona-
   * specific tools into the global registry on first import.
   */
  extra_index_imports?: string[];
}

/**
 * A file discovered under personas/<id>/files/. The relative path is
 * preserved as the VFS path the agent will see (e.g. files/skills/foo.md
 * lands at /skills/foo.md inside the agent's virtual filesystem).
 */
export interface SeedFile {
  /** Path inside the persona's `files/` dir, e.g. "skills/foo.md". */
  rel: string;
  /** Absolute disk path (used by the build script when reading). */
  abs: string;
  /** UTF-8 contents. */
  content: string;
  /** Inferred mime — derived from file extension. */
  mime: string;
}

export interface PersonaBundle {
  yaml: PersonaYaml;
  /** Absolute path to the persona dir (personas/<id>/). */
  dir: string;
  /** Files under personas/<id>/files/ (recursive). Empty if none. */
  files: SeedFile[];
}
