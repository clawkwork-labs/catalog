# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`catalog/` is the **source of truth** for everything ClawWork deploys from a template — personas now, teams soon. Each `<kind>/<id>/` is one definition. The folder is laid out so it can be lifted into its own repo later: it has its own `package.json` / `tsconfig.json` and depends on **nothing in `../src`**. Don't add cross-imports into the parent worker.

## Commands

```bash
pnpm install        # one-time
pnpm build          # regenerate ../src/defaults/personas/*.ts from YAML+files
pnpm extract        # one-shot YAML extractor (already run; rarely needed)
pnpm check          # tsc --noEmit
```

`PERSONAS_TARGET_DIR=/some/path pnpm build` redirects the output (default is `../src/defaults/personas`).

## Build pipeline (the only thing that matters here)

`tools/build.ts` walks `personas/<id>/`, parses `persona.yaml`, and emits TS:

- **No `files/` tree** → `src/defaults/personas/<id>.ts` (flat, just the persona object).
- **With `files/` tree** → `src/defaults/personas/<id>/index.ts` (persona) **plus** `<id>/files-seed.ts` (`<UPPER>_FILE_SPECS` + an idempotent `seed<Cap>Files(sql)` that writes any missing paths into the agent VFS and stamps a `<id>_files_seeded` flag in `config`). Files at `files/<rel>` land in the VFS at `/<rel>`.
- After all personas, regenerates `src/defaults/personas/index.ts` (registry, sort order, `getPersona` / `listPersonas`) and `src/defaults/personas/seeders.ts` (dispatch map for personas with files).

Three rules the build enforces:

1. **`// @generated` banner gate.** Every emitted file starts with the banner. The build refuses to overwrite a target file that's missing it — protects hand-written siblings (e.g. `magnus/pipeline.ts`, `magnus/*.test.ts`) which live next to generated output and are never touched.
2. **Flat ↔ bundled transitions are destructive.** Adding a `files/` tree deletes the old `<id>.ts`; removing it deletes the `<id>/` directory. Don't keep both shapes.
3. **`persona.yaml` `id` must equal the directory name** — mismatch throws.

VFS seeding is idempotent: existing paths are preserved (user edits survive re-seed). Persona-bundled files (typically `/skills/*.md`) are surfaced to the user by default — only runtime/system skills like `operating-environment.md` start hidden.

## Editing rules

- **YAML is canonical.** Hand-edits to generated TS get clobbered on next `pnpm build`. The grammar is `personas/persona.schema.json`; matching TS types are `tools/persona-types.ts`.
- **Generalist order lives in `tools/build.ts`** (`GENERALIST_ORDER`), not YAML. Adding a new persona with `kind: generalist` requires appending its id there, or `index.ts` will throw at startup ("Generalist X missing from GENERALIST_ORDER").
- **Persona-derived assets** (`profile_image`, `default_site`) are computed at runtime by `withPersonaSiteAssets` in the parent repo — don't author them in YAML and don't try to extract them.
- **Don't import from `../src`.** This package stays standalone.

## Teams (not yet wired)

`teams/team.schema.json` and `tools/team-types.ts` are authoritative for the planned shape. The build currently runs `reportTeamsStub`: zero `team.yaml` files = log line; **any** `team.yaml` present = throw. So dropping a team in before the generator lands fails loudly rather than silently. When wiring it up, mirror `emitBundledPersona` but target `src/defaults/team-personas/<id>/` — see the migration plan in `README.md`.
