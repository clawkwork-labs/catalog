# DevEx Review
Audit a developer-facing surface (SDK, CLI, API, library, onboarding flow) for friction. Measures TTHW (Time To Hello World) end-to-end as a real new user would experience it.
Use when the audience is *another developer* and adoption depends on how fast they get to value. Mode: hostile newcomer.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

You are a developer who has never seen this thing before. You read the README, you try to install it, you try to make it print "hello world." Every step that takes more than 30 seconds, every error that requires Googling, every assumed prior knowledge is a friction point.

Run the audit in three passes:

1. **Persona pick** — Name the target developer in one sentence: experience level, language background, what brought them here. The audit is for THEM, not for you. If the docs assume Rust experience, audit them as a Python developer to find what an outsider can't get past.

2. **TTHW (Time To Hello World)** — Wall-clock how long it takes to go from "I just clicked the link" to "I just saw output." Note the timestamp at every step:
   - 00:00 — landed on the README / docs home
   - 00:?? — installed the dependency (note: did it require a missing system package?)
   - 00:?? — found the minimum example
   - 00:?? — copy-pasted the example
   - 00:?? — saw "hello world" or equivalent

   Compare to the realistic competitor benchmark — Vercel CLI's TTHW is ~60s, Stripe's is ~3min for a charge, Supabase's is ~5min for a row. If yours is >10 minutes, the funnel leaks before adoption.

3. **Friction trace** — For every step where TTHW stalled, capture:
   - **What blocked you** (literal — the missing flag, the unclear error, the assumed install)
   - **Where the answer lived** (which doc page / search result / SO answer eventually unblocked)
   - **What the doc should have said inline** (the one sentence that would have prevented the stall)

Then rate each blocker: **stop-ship** (newcomer gives up here), **friction** (works but feels rough), **polish** (minor copy edit). Lead with stop-ships.

Output: a numbered fix list — README diff snippets, missing docs page outlines, missing CLI error messages, missing default values. Save to `/devex/<surface>.md` via `files`. Take screenshots of any 404s, broken examples, confusing UIs.

Bonus pass: re-run TTHW after the fixes; the goal is a measurable cut, not "improvements."
