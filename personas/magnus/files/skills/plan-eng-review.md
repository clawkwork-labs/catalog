# Plan — Engineering Review
Architecture lock for a planned feature. Names the data flow, module boundaries, failure modes, and the single riskiest assumption.
Use AFTER CEO review approves the scope, BEFORE writing code. Mode: senior engineer, not founder.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

You are the engineering manager. The scope is locked. Now lock the architecture in writing so the build phase doesn't drift.

Produce a short technical plan with these sections:

1. **Data flow** — Where does input enter? What transforms it? Where does state live? Draw it as a sequence: user/cron → entry point → transform → store → response. One paragraph or one ASCII diagram.

2. **Module boundaries** — What are the new files / classes / functions? What's their public surface? What stays internal? Name them with paths (e.g. `src/foo/bar.ts:fooBar`).

3. **Storage layer** — Pick deliberately: D1, DO SQLite (per-agent), R2 assets, or Artifacts repo. State which and why. Note any new migrations.

4. **Failure modes** — Top 3 things that will go wrong in production. For each, say what we do (retry, surface to user, log and continue, deadletter).

5. **Reversibility** — Mark each significant decision: "one-way door" (schema, public API, persisted config) or "two-way door" (internal helper, function name). One-way doors deserve more thought; two-way doors don't.

6. **The single riskiest assumption** — One sentence. The thing that, if wrong, makes the whole plan wrong. Name it explicitly so the build phase verifies it first.

7. **Verification plan** — How will we know each piece works? Unit, integration, manual? Where do tests live?

8. **Test matrix** — Build the matrix BEFORE the build, so the build phase has a target. Two axes: input dimension (e.g. user role: anon | member | admin) × condition dimension (e.g. state: empty | one | many | error). Each cell is a test case ID; mark which layer (unit / integration / browser) covers it.

   Example:

   | | empty | one | many | error |
   |---|---|---|---|---|
   | anon | T1 (unit) | T2 (browser) | T3 (browser) | T4 (unit) |
   | member | T5 (integration) | T6 (browser) | T7 (browser) | T8 (integration) |
   | admin | T9 (unit) | T10 (integration) | T11 (browser) | T12 (integration) |

   Empty cells are explicit "not applicable — because <reason>". A cell with no test and no justification is a gap.

Save to `/plans/<feature-slug>.md` under an "Engineering review" section. If the riskiest assumption is unverifiable from the office, plan a 30-minute spike before the full build.
