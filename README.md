# catalog

Source-of-truth definitions for everything ClawkWork can deploy from a
template: **personas** today, **teams** soon. Each subfolder is a kind;
each `<kind>/<id>/` is one definition.

This folder is laid out so it can be lifted into its own repo later — it
has its own `package.json`, `tsconfig.json`, and build tooling and depends
on nothing in `../src`.

## Layout

```
catalog/
├── README.md
├── package.json                    # standalone; deps: yaml, tsx
├── tsconfig.json
├── tools/
│   ├── persona-types.ts            # shared TS types for persona.yaml
│   ├── team-types.ts               # shared TS types for team.yaml
│   ├── extract.ts                  # one-shot: src/defaults/personas/*.ts → YAML
│   └── build.ts                    # YAML+files → src/defaults/<kind>/*.ts
├── personas/
│   ├── persona.schema.json         # JSON-Schema for persona.yaml
│   └── <id>/
│       ├── persona.yaml            # the persona config
│       └── files/                  # optional — VFS-seeded content
│           ├── skills/<skill>.md
│           └── html/index.html     # optional persona HTML home override
└── teams/
    ├── team.schema.json            # JSON-Schema for team.yaml
    └── <id>/                       # (none yet — see "Teams" below)
        ├── team.yaml
        └── files/
            └── skills/<skill>.md   # mounted into every member-agent's VFS
```

### Why this shape?

AI-harness conventions for "skills as files" (Anthropic's Claude Code skill
bundles, Cursor's `.cursor/rules/`, GitHub Copilot's `chatmodes`) all
converge on the same idea: a small structured config plus a tree of plain
markdown the model reads on demand. Keeping each definition's content
beside its config means:

- **Diffs are reviewable.** Editing a skill is a markdown edit, not a TS
  string edit. Reviewers can read the prose, not parse template literals.
- **Authoring is portable.** A non-engineer can write a persona or team
  in a text editor and drop it in.
- **Compilation is one-way.** `tools/build.ts` is the only thing that
  writes into `src/defaults/`. Hand-edits there get clobbered, so the
  YAML stays canonical.

## Workflow

```bash
# one-time setup
cd catalog
pnpm install

# regenerate src/defaults/personas/*.ts from this folder
pnpm build

# (one-shot, already run once) extract existing TS → YAML
pnpm extract
```

The build script writes:

- `src/defaults/personas/<id>.ts` — for personas without a `files/` tree.
- `src/defaults/personas/<id>/index.ts` — for personas with a `files/` tree.
  The seeder for that persona's files is generated as
  `src/defaults/personas/<id>/files-seed.ts`.

The build script never touches sibling files like `pipeline.ts` or
`*.test.ts` in those directories — those are hand-maintained TS that lives
beside the generated output. A `// @generated` banner marks every emitted
file; the build script will refuse to overwrite a non-generated file.

## persona.yaml

See `personas/persona.schema.json` for the full grammar. Minimum:

```yaml
id: vulcan
name: Vulcan
title: Software Engineer
description: Builds features end-to-end — writes code, integrates services, lands PRs.
category: engineering
kind: generalist
featured: true
model_tier: advanced
system_prompt: |
  You are a senior engineer who builds features end-to-end...
config:
  approval_policy: auto
  turn_max_rounds: 25
  budget_daily_tokens: 0
  tags: [engineering, build, github]
  tool_permissions:
    github: auto
```

Personas with seeded files declare them via the filesystem layout under
`files/` — no extra YAML wiring needed. The build script discovers them
and generates the seeder automatically.

## Teams

`catalog/teams/` is the source-of-truth surface for team-persona templates
that today live, hand-written, at `src/defaults/team-personas/`. The build
script polls the directory and currently emits a stub — adding a
`team.yaml` before the generator is wired will fail loudly so authored
content never sits silent.

A team yaml mirrors the persona pattern but adds `members[]` (refs to
persona ids) and treats files under `files/` as **R2-mounted shared
skills** rather than VFS files (since teams already write to R2 +
`shared_skill_manifest`, see `src/runtime/team-assets.ts` and
`src/team/team-do.ts`).

```yaml
# catalog/teams/college-pod/team.yaml  (example, not yet authored)
id: college-pod
name: College Pod
description: Two agents sharing one profile — applications + scholarships.
category: education
featured: true
members:
  - persona_id: chiron
    role: owner
    name_suffix: " · Applications"
  - persona_id: scout
    role: member
    name_suffix: " · Scholarships"
config:
  visibility: private
```

`team.schema.json` is the authoritative grammar; `tools/team-types.ts`
holds the matching TS types.

### Migration plan (when the first team.yaml lands)

1. Extend `tools/build.ts` with a `loadTeamBundle()` + `emitTeam()` pair,
   mirroring `emitBundledPersona`. Output goes to
   `src/defaults/team-personas/<id>/index.ts` + `<id>/skills.ts`
   (matches the existing hand-written shape).
2. The build emits the same `SeedFileSpec[]` data shape as personas —
   only the consumer differs. Personas seed via `seedPersonaFiles(sql, ...)`
   (sync, agent VFS); teams seed via the existing `maybeRunTeamSeeder`
   in `src/defaults/team-personas/seeders.ts` (async, R2 +
   `shared_skill_manifest`).
3. Once `college-pod` is migrated, remove its hand-written copy.
   `tools/extract.ts` should be extended at the same time so the existing
   TS can be dumped to YAML one shot.

Until step 1 lands, the team generator throws if any `team.yaml` is
present — see `reportTeamsStub` in `tools/build.ts`.

## Seeders registry

`src/defaults/personas/seeders.ts` is regenerated by `tools/build.ts`
based on which persona directories contain a `files/` tree. Don't
hand-edit it. The team-persona seeder
(`src/defaults/team-personas/seeders.ts`) stays hand-written for now —
its dispatch logic is already generic over the registry, so the generated
team modules will plug in without touching it.
