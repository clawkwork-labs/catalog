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

export interface TeamMemberYaml {
  /** Id of an existing persona under catalog/personas/<id>/. */
  persona_id: string;
  role: TeamMemberRole;
  /** Optional suffix appended to the persona's display name when the team
   *  spawns the agent (e.g. " · Applications"). */
  name_suffix?: string;
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
