/**
 * The YAML-serializable team-persona shape. Mirrors the runtime
 * `TeamPersona` type at src/defaults/team-personas/types.ts but
 * intentionally splits out `shared_skills` — those are discovered from
 * the `files/` tree under catalog/teams/<id>/, not authored in YAML.
 *
 * A team in the catalog is a *template*: instance fields like
 * `team_id`, `owner_user_id`, and the live roster are filled in at
 * deploy time. The runtime seeder (`maybeRunTeamSeeder`) writes the
 * shared markdown skills to R2 + the team's `shared_skill_manifest`
 * on first activation so member agents can mount them.
 */
export type TeamCategory =
  | "engineering"
  | "ops"
  | "research"
  | "education"
  | "general";

export type TeamMemberRole = "owner" | "admin" | "member" | "observer";

export type ModelTier = "advanced" | "standard" | "basic";

/**
 * A member defined entirely within the team YAML — no catalog persona
 * required. All persona fields are authored inline.
 */
export interface InlineTeamMemberYaml {
  /** Stable id scoped to this team. Used as the agent id when spawned. */
  id: string;
  name: string;
  title: string;
  description: string;
  model_tier: ModelTier;
  system_prompt: string;
  role: TeamMemberRole;
  /** Partial<AgentConfig> overrides applied when this member is spawned. */
  config?: Record<string, unknown>;
}

/**
 * A member that extends an existing catalog persona, optionally overriding
 * or appending to its fields. Only `extends` and `role` are required —
 * every other field is an override that shadows the source persona.
 */
export interface ExtendsTeamMemberYaml {
  /** Id of an existing persona under catalog/personas/<id>/. */
  extends: string;
  role: TeamMemberRole;
  /** Overrides the persona's display name when spawned in this team.
   *  Takes precedence over name_suffix if both are set. */
  name?: string;
  /** Suffix appended to the persona's display name (e.g. "· Research").
   *  Ignored if name is set. */
  name_suffix?: string;
  /** Overrides the persona's title when spawned in this team. */
  title?: string;
  /** Overrides the persona's description when spawned in this team. */
  description?: string;
  /** Replaces the persona's system_prompt entirely when spawned in this team.
   *  Use sparingly — prefer system_prompt_append. */
  system_prompt?: string;
  /** Appended to the persona's system_prompt (blank line separator) when
   *  spawned in this team. Keeps the base persona intact while layering in
   *  team-specific context, upstream/downstream wiring, and output formats. */
  system_prompt_append?: string;
  /** Partial<AgentConfig> overrides applied when this member is spawned. */
  config?: Record<string, unknown>;
}

/** A team member is either fully inline or extends an existing persona. */
export type TeamMemberYaml = InlineTeamMemberYaml | ExtendsTeamMemberYaml;

/** Type guard: is this member fully inline (no extends)? */
export function isInlineMember(m: TeamMemberYaml): m is InlineTeamMemberYaml {
  return "id" in m && !("extends" in m);
}

/** Type guard: does this member extend an existing persona? */
export function isExtendsMember(m: TeamMemberYaml): m is ExtendsTeamMemberYaml {
  return "extends" in m;
}

export interface TeamYaml {
  id: string;
  name: string;
  description: string;
  category: TeamCategory;
  featured: boolean;
  members: TeamMemberYaml[];
  /** Partial<TeamConfig> overrides. Only set fields that differ from defaults. */
  config?: Record<string, unknown>;
}

/**
 * A file discovered under catalog/teams/<id>/files/. Same shape as
 * the persona seed file, but the runtime target is R2 +
 * `shared_skill_manifest`, not the agent VFS.
 */
export interface TeamSeedFile {
  /** Path inside the team's `files/` dir, e.g. "skills/triage.md". */
  rel: string;
  /** Absolute disk path (used by the build script when reading). */
  abs: string;
  /** UTF-8 contents. */
  content: string;
  /** Inferred mime — derived from file extension. */
  mime: string;
}

export interface TeamBundle {
  yaml: TeamYaml;
  /** Absolute path to the team dir (catalog/teams/<id>/). */
  dir: string;
  /** Files under catalog/teams/<id>/files/ (recursive). Empty if none. */
  files: TeamSeedFile[];
}
