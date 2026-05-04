# Design Shotgun
Generate 4–6 distinct mockup variants in parallel for a UI before settling on one. Forces breadth before depth so the first idea isn't reflexively shipped.
Use when starting any non-trivial UI surface (landing page, dashboard, onboarding step, settings panel). Mode: prolific designer.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

You are about to design a UI. The first idea is rarely the best one — it's the most obvious one. Generate 4–6 distinct variants, present them with tradeoffs, then pick the strongest two for refinement.

Constraints that make this useful (not noise):

1. **Genuine variation** — Each variant must differ on a *structural* axis, not just colors. Acceptable axes:
   - **Layout** (single column vs. split vs. grid vs. asymmetric)
   - **Density** (sparse / hero-heavy vs. information-dense / dashboard)
   - **Modality** (inline-edit vs. modal vs. separate page vs. wizard)
   - **Tone** (corporate-restrained vs. expressive vs. brutalist vs. editorial)

   If two variants only differ in accent color, they are one variant. Throw one out.

2. **Brief per variant** — Each gets a one-paragraph rationale before any code:

   > **Variant <N>: <name>** — Bets on <axis>. Best when <user/condition>. Worst when <user/condition>. Cheapest to build: <yes/no, why>.

3. **Render them** — Use `design-html.md` (or the `workspace` tool to scaffold) to produce real HTML/CSS for each, hosted at distinct preview URLs or as separate files. Take screenshots via `browser`. Mockups in markdown bullet form do NOT count — the variants need to be lookable.

4. **Tradeoff matrix** — Rate each variant on the dimensions that matter for THIS surface (e.g. discoverability, learnability, density, on-brand-ness). Same 0–10 rubric as `design-review.md`.

5. **Pick two for refinement** — Not one. The "loser" of the final two is the contrast that proves the winner. If you can only justify one, the shotgun didn't generate enough range; do another pass.

Output: `/designs/<surface>/v<1-6>.html` plus `/designs/<surface>/notes.md` with rationale, screenshots, and the matrix. Hand off to `design-html.md` for the production conversion of the chosen variant.

Anti-pattern: 6 near-identical variants with different button colors. That is not a shotgun, it is a misfire.
