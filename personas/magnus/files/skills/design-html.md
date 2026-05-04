# Design — HTML/CSS Production
Convert a design (mockup, screenshot, spec, or shotgun winner) into production-grade semantic HTML and CSS. Bakes in empty/loading/error states by default.
Use when handing a design over to the build phase, or when implementing a UI from a fixed spec. Mode: design engineer.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

You are converting a design into shippable markup. The goal is not "looks like the mockup" — it's "looks like the mockup AND survives reality." Reality includes empty states, loading states, errors, slow networks, accessibility, and the user pasting a 500-character string into a 12-character field.

Process:

1. **Pin the spec** — Have the mockup/screenshot/Figma frame open. If the spec is ambiguous, ask before guessing (or pick deliberately and note the assumption in a comment).

2. **Use the project's primitives, not new ones** — `code_search` for existing button / card / input / modal / form components. Reuse them. Inventing a one-off Button when one already exists is a regression in design quality, not a step forward.

3. **Semantic HTML first** — `<button>` not `<div onClick>`, `<nav>` for navigation, `<main>`/`<aside>`/`<section>` for landmarks, `<label for="">` on every form field. The visual layer is CSS; the structure should make sense to a screen reader on its own.

4. **Build the four states up front, not later** — For every interactive component, define and implement:
   - **Empty** — no data yet (with a useful zero-state CTA, not just "Nothing here.")
   - **Loading** — skeleton / spinner / progressive-fill (NOT a frozen UI)
   - **Error** — human-readable message, retry where applicable, never just "Error" or a stack trace
   - **Loaded happy path** — the one the mockup shows

5. **Responsive, mobile-first** — Author at 375px first, scale up. Never the reverse. Test at 375 / 768 / 1280; layouts that "kind of work" at intermediate widths are a tell that the breakpoints were guessed.

6. **Interaction states** — `:hover`, `:focus-visible`, `:active`, `:disabled`, `aria-busy`. Transition timings around 150ms ease-out for most things; 250ms for layout-affecting changes; never linear.

7. **Verify with the browser** — Open `browser`, take screenshots at each viewport, tab through every interactive element, confirm focus is visible and reading order makes sense. Compare side-by-side with the mockup screenshot. Note any pixel/spacing drift.

8. **No dead CSS** — Every rule maps to something you can point at. Strip unused classes before handing off; they accrue and rot.

Output: working files (HTML/JSX/Vue depending on the project), screenshots committed alongside, a one-paragraph note in the PR description listing which states were implemented and which (if any) were intentionally deferred with a justification.

If you can't implement a state because the data layer doesn't expose it yet, file a follow-up note ("error state needs error shape from /api/foo") instead of leaving it un-handled.
