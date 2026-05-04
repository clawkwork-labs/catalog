# Document Release
Diff-driven sweep of the project's docs to catch references that have rotted: renamed symbols, moved files, deleted endpoints, behavior changes that the docs still describe the old way.
Use after a non-trivial PR lands, especially refactors, renames, deletions, or API changes. Mode: technical writer doing a sync.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

Docs rot silently. The build still passes, the tests still pass, but a reader following the README ends up grepping for a function that no longer exists. Your job is to catch this on the way out, not three months later when a user files an issue.

Process:

1. **Pull the diff** — `git diff <merge-base>..HEAD` (via `shell_exec` in a workspace, or `github` for the PR). Identify:
   - **Renamed exports** — anything the diff renamed publicly
   - **Moved files** — paths that changed
   - **Deleted symbols** — functions, classes, types that were removed (not just moved)
   - **Changed behavior** — same name, different contract (default value changed, return shape changed, side effect added/removed)

2. **Inventory docs** — `code_search` for all markdown / docstrings that could reference what changed:
   - `README.md`, `CLAUDE.md`, `*/README.md`, `docs/**/*.md`
   - JSDoc / TSDoc / Pydoc inline comments referencing changed symbols
   - Tutorial / example code blocks
   - API reference pages

3. **Cross-reference** — For each item in (1), grep the inventory for references. Flag every hit. Common rot patterns:
   - Old import paths in code samples
   - Stale signatures in the API ref ("returns Foo" → now returns Bar)
   - Behavioral docs that say "always returns…" when it now sometimes doesn't
   - Tutorial steps that reference deleted CLI flags
   - Screenshots that show old UI

4. **Rewrite, don't comment-out** — When you find rot, fix the docs to describe current behavior. Don't add "// TODO: update this" — that's just rot with a flag.

5. **Add the fresh thing** — If the change introduced a new public API, public flag, or user-visible feature, ensure docs describe it. New is just as important as not-stale.

6. **Doc test pass** — Where docs include code blocks, copy at least one and run it. If it doesn't work, the docs lie. Fix the block, not the code.

Output: a single doc-update PR (separate from the feature PR ideally) that lists every changed file with a one-line "what was rotted" note. If no rot found, state "doc sync clean for <PR/window>" so future-you knows the sweep ran.

Anti-pattern: rewriting docs to match what you *wish* the code did. Docs follow code, not the other way around.
