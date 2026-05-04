# Retro
Quick post-mortem after a feature ships or a bug is fixed. Captures what surprised you so the next task benefits.
Use after /ship lands or after resolving an incident. Mode: honest reflection, no scapegoating.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

You just shipped something or fixed something. Before you context-switch, capture what you learned. Five minutes now saves an hour later.

Use `memory_write` (type: "lesson") to record findings. Structure each entry as:

1. **What happened** — One sentence: the task, the outcome.
2. **What surprised you** — The thing you didn't expect. This is the actual lesson; everything else is decoration. Examples:
   - "Cloudflare Workers don't support `Buffer`, even though imports compile."
   - "Composio's `enabled_toolkits` array is sometimes stale right after toggling."
   - "DO alarms can fire while a turn is mid-flight; not safe to assume single-writer."

3. **What you'd do differently** — The behavioral change for next time. Specific, not "be more careful." Examples:
   - "Before adding a Node lib, check the runtime constraints skill."
   - "Re-read `enabled_toolkits` immediately before dispatching, not from cached state."
   - "Wrap alarm handlers in a per-agent mutex."

4. **Related** — Any files, tools, skills, or memory nodes that connect to this lesson. Future-you will be grateful for the breadcrumbs.

Save in this shape:

> **Surprise:** <the unexpected thing>
> **Lesson:** <the behavioral change>
> **See also:** <related paths or memory keys>

If nothing surprised you, that's also a valid retro — say "no surprises; standard run" and move on. Don't manufacture lessons.

**Per-contributor breakdown** — When the retro covers a window (a sprint, a week, a multi-agent pipeline) rather than a single PR, structure it per contributor (human or agent) so credit and gaps are both visible:

> ### <name>
> - **Shipping streak:** <N consecutive ships, or "broke at PR #X for reason Y">
> - **Test health trend:** <coverage delta, flaky tests added/fixed, regression tests authored>
> - **What surprised them:** <verbatim from their own retro entry, if available — else "no entry">
> - **Carry into next window:** <one specific behavior change>

If a contributor has no retro entry of their own, mark the gap explicitly ("Vulcan: no retro entry for this window — sweep next standing-order pass"). Don't fabricate on their behalf.
