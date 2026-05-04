# Voice Profile

The voice profile is the *spec* you write against. It lives at
`/voice/profile.md` and is the one document you read at the start of
every write-in-voice request. Without it you're guessing.

## Structure

Maintain `/voice/profile.md` with these sections. Keep it tight —
this is a working document, not a portrait. Cite specific phrases
from samples, not vibes.

```
# Voice profile: <Author name>

## Snapshot
One paragraph in plain language: who they sound like when they write.
"Plainspoken tech founder, allergic to corporate language, writes the
way they talk — short sentences, occasional swears, drops articles
('Ran the numbers, doesn't add up')."

## Cadence
- Sentence length: avg ~N words, range A–B. Mix: <ratio of short to long>.
- Paragraph length: typically N–M sentences. One-liners common? rare?
- Rhythm tics: starts with conjunctions? sentence fragments? semicolons
  rare or common? em-dash, en-dash, parens — which do they reach for?

## Diction
- Register: casual / neutral / formal / mixed how
- Vocabulary range: small/big; do they reach for SAT words or stay plain?
- Words they use a lot: <list with sample-line cite>
- Words they never use: (often: "delve", "leverage", "tapestry",
  "testament to", "navigate", "navigate the complexities of", etc.)
- Contractions: yes always / no never / mixed (when?)
- Profanity: never / rarely (which contexts?) / freely
- Jargon they own (domain terms used naturally): <list>
- Jargon they avoid even when relevant: <list>

## Signature moves
Things this author does that most writers don't. Each one with a
sample-line cite. Examples:
- Opens essays with a single-sentence paragraph that lands the thesis
- Uses parenthetical asides as commentary on their own argument
- Coins compound nouns ("agents-as-apps", "soul-tax")
- Breaks the fourth wall ("I'll be honest, I don't know")
- Rhetorical questions answered immediately
- Em-dashes for *interruption*, not for *pause*

## Anti-patterns (things that would NOT sound like them)
- "It's not just X, it's Y" construction
- Lists of three balanced items
- Hedge stacking ("perhaps it could be argued that...")
- "In today's fast-paced world" / "In an era of..."
- Closing on a synthesis paragraph that ties it all together with a bow
- (whatever else jumped out as "they would never")

## Punctuation quirks
- Oxford comma: yes / no / inconsistent
- Sentence-ending punctuation patterns
- Capitalization habits in titles, headings
- Idiosyncratic things to PRESERVE: "alot", missing commas, single-em
  dashes with no spaces, lowercase-i, etc.

## Topics & stances (only if relevant to ghosting)
Recurring themes, known positions, things they've publicly committed to.
Useful so you don't write the opposite of what they believe.

## Sample inventory
- /voice/samples/<filename>.md — <one-line summary, date, context>
- ...

## Open questions
Things you've asked the author and not yet gotten answers on. Keep
this short; resolve via /skills/sample-intake.md.
```

## Building it from scratch

When the user gives you the first batch of samples:

1. Read every sample end-to-end before writing a single profile line.
   Don't sample-skim; voice is in the texture.
2. Save originals verbatim to `/voice/samples/<slug>.md` with a
   header noting source, date, and context (blog post / Slack DM /
   email / tweet — register varies by channel and you need to know
   which channel a sample came from).
3. Draft the profile. Every claim must point at a specific sample
   line. "They use em-dashes" is wrong; "Em-dashes appear in
   roughly half their paragraphs, always for interruption (`/voice/samples/post-2024-04.md` line 17)" is right.
4. Show the draft profile back to the user and ask: "Does this
   sound right? What did I miss? What did I get wrong?" Iterate
   before any write-in-voice work.

## Updating it

Every time the user pushes back ("I'd never write 'leverage'",
"this is too formal", "you used three em-dashes in one paragraph") —
that correction is a permanent rule. Append it to the profile under
**Anti-patterns** or **Punctuation quirks**. Then commit it to
memory via `memory_write` so it survives even if the file is
later edited.

## Multi-author ghosting

If you ghost for multiple people, profiles live at
`/voice/<author-id>/profile.md` and samples at
`/voice/<author-id>/samples/`. Always read the right author's
profile at the start of a turn — don't bleed Author A's voice
into Author B's draft. Memories should be tagged with the
author id.
