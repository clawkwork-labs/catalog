# Humanize — strip AI tells from drafts

Before you ship any draft, run this checklist. Every item below is a
known signal that detectors (and humans) use to spot machine-written
prose. None of them is *automatically* wrong — humans use all of
these sometimes. But machine-written text uses them *together*, *all
the time*, in characteristic clusters. Your job is to break the
cluster.

The single best mental model: **AI prose is too uniform**. Uniform
sentence rhythm, uniform paragraph length, uniform politeness,
uniform structure. Real humans write unevenly. Your draft should
look uneven on the page.

## Vocabulary tells (most-cited)

Words and phrases that scream "LLM" because models reach for them
disproportionately. Cut or replace unless the voice profile
specifically says the author uses them:

- **delve** / delve into
- **leverage** (verb), **leverages**, **leveraging**
- **utilize** (almost always: use)
- **navigate** (in the figurative sense — "navigate the
  complexities of...")
- **tapestry** (especially "rich tapestry")
- **testament** ("a testament to...")
- **landscape** (figurative — "the evolving landscape of...")
- **realm** ("in the realm of...")
- **journey** (figurative)
- **unleash**, **unlock**, **empower**, **enable** (when vague)
- **pivotal**, **crucial**, **vital**, **paramount**, **pivot**
- **robust**, **seamless**, **streamlined**, **cutting-edge**,
  **state-of-the-art**, **game-changing**, **revolutionary**
- **multifaceted**, **nuanced** (used as filler, not earned)
- **resonates with**, **align with**, **foster**
- **delineate**, **elucidate**, **underscore**

If the voice profile lists any of these as words the author
*does* use, leave them. Otherwise: cut.

## Phrase / construction tells

- **"It's not just X, it's Y"** and its cousins ("not merely X
  but Y", "more than just X — Y"). Massive AI tell. Almost always
  rewrite.
- **"In today's [adjective] world"** / **"In an era of..."** /
  **"In the ever-evolving world of..."**. Dead opener.
- **"Whether you're A, B, or C, ..."** as an opener.
- **"At its core, X is ..."** / **"At the heart of X lies ..."**
- **"This is where X comes in."**
- **"Let's dive in."** / **"Let's unpack this."**
- **"In conclusion, ..."** / **"Ultimately, ..."** as the closer
  of every section.
- **Rhetorical question → immediate clean answer**: "What does
  this mean? It means..." Humans do this *occasionally*; AI does
  it constantly.
- **Hedge stacking**: "It could be argued that perhaps it's
  possible that..." Cut all but one hedge.

## Structural tells

- **Rule of three.** Listing things in threes, *especially* with
  parallel grammatical structure ("faster, smarter, and more
  efficient"). Once per piece is fine. Three rule-of-three
  constructions in three paragraphs is a tell. Vary list lengths;
  break parallelism.
- **Uniform paragraph length.** AI writes paragraphs of
  remarkably consistent size. Real writing has one-line
  paragraphs next to dense ones. Add one-liners. Let some
  paragraphs run long and some snap short.
- **Uniform sentence length.** Same problem at the sentence
  level. Mix short. Mix long, the kind that wander a bit
  before they get where they're going. Mix fragments. Like
  this.
- **Section headings on everything.** AI loves H2/H3 structure.
  Most human prose flows. If the voice profile doesn't show
  the author using heavy heading structure in this register,
  cut the headings.
- **Bulleted lists where prose would do.** Same problem. Use
  lists when the content is genuinely a list. Don't bulletize
  flowing argument.
- **Closing synthesis paragraph that ties it all back together
  with a bow.** AI almost always ends with one. Humans often
  end mid-thought, on a hard line, with a question, or with
  a small concrete image. Cut the bow unless the voice profile
  says the author writes that way.

## Punctuation tells

- **Em-dash overuse.** This is the big one. AI sprinkles em-dashes
  like seasoning — three or four per paragraph — for any pause.
  Most humans use one or two per *piece*. Convert most em-dashes
  to commas, periods, or parens, depending on the function.
  Keep them only where they're doing real work (interruption,
  not pause).
- **Curly quotes / "smart" punctuation when the author uses
  straight quotes** (or vice versa). Match the profile.
- **Oxford comma applied uniformly when the author is
  inconsistent** (or vice versa).

## Tone tells

- **Excessive politeness / hedging.** "It's worth noting that..."
  "It's important to remember..." Cut the meta-commentary; just
  say the thing.
- **Reassurance the reader didn't ask for.** "Don't worry —
  we'll cover that next!" Unless the author writes that way.
- **No opinions.** AI default is balanced and toothless. If the
  author has opinions, the draft should have opinions. Take a
  side.
- **Apologetic preambles.** "I hope this is helpful..." "Of
  course, I'd be happy to..." None of this. The user didn't
  ask for it.

## Specificity tells

- **No proper nouns.** AI drafts often float in abstraction —
  "leading companies", "many users", "various platforms". Real
  writing names names. If you have facts, drop them in. If you
  don't, ask the user rather than invent or stay vague.
- **Round numbers everywhere.** "Hundreds of users", "tons of
  data". Real numbers when known; approximations only when the
  author would actually approximate.
- **No examples.** Every abstract claim wants a concrete example.
  AI often skips them. You shouldn't.

## The pass

Concretely, after drafting:

1. Ctrl-F the vocabulary list above. Replace or cut.
2. Read the draft aloud (in your head). Wherever it sounds like
   a TED talk introduction, rewrite.
3. Count em-dashes. If more than ~1 per ~200 words, cut to that
   ratio (unless profile says higher).
4. Count rule-of-three lists. Break or vary parallelism in all
   but maybe one.
5. Look at the page shape. Are paragraphs the same size? Break
   one up; merge two; add a one-liner.
6. Find the closing sentence. Is it a synthesis bow? Replace it
   with a sharper landing.
7. Check for opinions. Did you take a side anywhere? If not,
   either the topic genuinely has no side (rare) or you defaulted
   to AI-neutral. Pick a side — the author's, per the profile.

## What you do NOT do

- Insert *deliberate* errors (typos, broken grammar) to "look
  human". Detectors are getting wise to this and it's a trick
  that ages badly. Just write *unevenly*, not *wrongly*.
- Stuff in slang or profanity that isn't in the voice profile.
- Add filler to disguise structure ("Now, here's the thing...").
  AI does that too, in a different key.

The goal is invisible naturalness, not staged messiness.
