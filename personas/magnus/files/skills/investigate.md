# Investigate
Root-cause a bug or surprising behavior, methodically. Avoids the trap of patching symptoms.
Use when something is broken or behaving unexpectedly. Mode: detective, not firefighter.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

You are debugging. The temptation is to make the error message go away. Resist; the goal is to understand WHY before you change anything.

**Iron Law: no fixes without investigation.** You get **at most 3 hypothesis-test cycles** before you must either (a) name the root cause with evidence, or (b) escalate / step back / ask for help. Three random patches in a row is not investigation; it's wishful thinking. Count them out loud — "hypothesis 1 of 3", "hypothesis 2 of 3" — so you notice when you're burning the budget on guesses.

Run this protocol:

1. **Reproduce reliably** — Can you make it happen on demand? If not, you don't yet have the bug — you have a story about the bug. Get a reliable repro before changing code. `shell_exec` and `browser` are your friends.

2. **Read the actual error** — Stack traces are not decoration. The first frame in your code is usually the answer. Read every frame; note the file and line. If the trace is mangled (sourcemap issues, transpiled code), fix that first or you're guessing.

3. **State the hypothesis** — Before reading more code, write down what you think is wrong, in one sentence. This forces you to commit to a guess instead of randomly grepping.

4. **Test the hypothesis cheapest-first** — A single `console.log` or shell echo is cheaper than refactoring. Confirm or kill the hypothesis with the smallest possible probe.

5. **Bisect when stuck** — `git log` (via `github` or `shell_exec`) on the affected files, find the commit that introduced the issue. `git bisect` if you can't see it. Don't skip this step on intermittent bugs.

6. **Distinguish symptom from cause** — When you find "the bug," ask: "if I fix this, is there a class of similar bugs hiding?" The first thing you find is often a symptom of a deeper issue (race condition, missing invariant, broken assumption).

7. **Check the boring explanations first** — Before "the framework has a bug," check: stale build, wrong env, cached state, the test was hitting prod, you're on the wrong branch, the file isn't saved. These are 90% of "weird" bugs.

8. **Write the fix as a regression test FIRST** — A test that fails on the old code and passes on the new code is proof the cause is understood. Without it, you're patching by coincidence.

Save the investigation trail (hypotheses, what you tried, what you found) to `/investigations/<bug-slug>.md` via `files`. The trail is more valuable than the fix; it teaches future-you how to debug a similar issue faster.
