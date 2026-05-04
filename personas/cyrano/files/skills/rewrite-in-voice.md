# Rewrite In Voice

Workflow for "rewrite this in my voice" / "make this sound like me"
requests. The input is an existing draft (often AI-written, sometimes
written by a colleague, occasionally an old draft of theirs they
want re-toned). The output is the *same content* in the user's voice.

The trap: you read the draft, get anchored on its phrasing, and
end up surface-tweaking instead of re-voicing. Resist this.

## Step 0 — Same gate as voice-match

Read `/voice/profile.md`. If insufficient, run
`/skills/sample-intake.md`. Do not bluff.

## Step 1 — Strip the source draft to claims

Before rewriting, read the input and produce — in your head or
in scratch notes — a bare list of *what it says*, stripped of *how
it says it*. Bullets, not prose. Example:

> Source: "Leveraging cutting-edge AI, our platform empowers users
> to navigate the complexities of modern data analysis with
> unprecedented ease."
>
> Claims:
> - We use AI
> - The product is for data analysis
> - The product is supposedly easier than alternatives

This decoupling is the whole technique. You're going to re-author
the claims, not edit the prose.

## Step 2 — Detect what the source draft is doing wrong

Note specifically what makes the source NOT sound like the user.
Common patterns:

- **AI source:** em-dash overuse, "delve / leverage / navigate",
  rule-of-three lists, "It's not just X, it's Y", hollow openers,
  uniform paragraph rhythm, hedging tone, no specifics
- **Marketing-copy source:** abstractions, claims with no examples,
  "empower / enable / unlock"
- **Colleague-with-different-voice source:** more formal, more
  passive, different vocabulary range
- **User's old voice:** they've evolved; they don't write like that
  anymore

Whatever it is, name it, so you don't accidentally preserve it.

## Step 3 — Re-author from the claim list

Now write the piece from the claim list as if it had never been
written before. Use the voice profile. Don't open the source draft
side-by-side and tweak — that's where surface-rewriting comes from.
Close it (mentally) and write fresh.

If the source has structure that worked (good hook, smart
counterexample, vivid anecdote), preserve those *moves* but
re-author the prose. "Open with the anecdote about the dropped
package" is fine to keep; the actual sentences are not.

## Step 4 — Compare against source ONLY for content fidelity

After your rewrite is done, read source and rewrite side-by-side
and ask:

- Did I lose any factual claims?
- Did I introduce any claims that aren't in the source?
- Did I shift the argument's emphasis or conclusion?

This is a *content* check, not a *voice* check. If the rewrite
says something the source doesn't, decide deliberately whether
to keep it (sometimes the source was missing something obvious;
sometimes you hallucinated). When in doubt, ask the user.

## Step 5 — Humanize + voice-bench + deliver

Same as `/skills/voice-match.md` Steps 3–5.

## Special case: "rewrite this AI-generated thing"

When the user explicitly hands you ChatGPT/Claude/Gemini output and
says "make this sound like me, not AI", be especially aggressive
about Step 2. AI prose is *dense* with tells; surface edits won't
clear it. Do the strip-to-claims-and-re-author cycle, do not
"polish."

If the source is heavily structured (numbered lists, headed
sections), check whether the user actually writes like that.
Often AI imposes structure on prose that should flow. The voice
profile should tell you.
