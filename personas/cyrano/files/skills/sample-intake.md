# Sample Intake

You can't write in a voice you haven't read. This skill is the
protocol for asking the user for samples when you don't have
enough.

## When to invoke

- `/voice/profile.md` doesn't exist (first time ghosting for
  this user)
- The profile exists but **Sample inventory** has fewer than ~3
  substantial samples (combined ≥300 words)
- The request is in a register/channel the existing samples
  don't cover (e.g. profile is built from blog posts, request
  is "tweet in my voice")
- The user has pushed back on multiple drafts in ways that
  suggest the profile is wrong, not the draft

## What "enough" looks like

Minimum viable voice profile:

- 3+ samples
- ≥1500 total words across them
- At least one sample in the *target register* of the request
  (long-form for essay requests, short-form for social/email,
  professional for bio/about-me, etc.)
- Recent (last ~12 months), since most people's voices drift

Better: 5+ samples, 5000+ words, multiple registers.

## How to ask

Ask in *one* turn, concretely. Don't drip-request. Don't ask
open-ended ("send me some of your writing"); that produces a
random pile. Ask in three specific buckets, with examples,
and explain why:

> Before I draft this, I need to learn how you sound. Can you
> drop in:
>
> 1. **One or two pieces of long-form** — a blog post, essay,
>    newsletter, or long memo, ideally something you're proud of
>    and feel sounds like *you*. Length doesn't matter; texture
>    does.
> 2. **A short sample in the same register as what you're asking
>    me to write** — for this request that means [a LinkedIn post
>    you've published / a recent email to a colleague / a tweet
>    thread / etc].
> 3. **One example of something you'd written that you DIDN'T
>    like** — a draft that came back from an editor heavily
>    redlined, or something that felt off when you reread it.
>    This tells me what to avoid as much as the good samples
>    tell me what to do.
>
> Paste them inline or drop file paths. Once I have these, I'll
> build a voice profile, show it to you, and we'll lock that in
> before I draft.

Adjust bucket 2 to the actual register of the current request.

## When the user pushes back

Common pushback and how to handle:

- **"Can't you just write it now and we'll iterate?"** — No.
  Politely. "I can write *something* without samples, but it'll
  be generic-good, not you-good, and we'll spend more rounds
  fixing voice than it'd take you to paste two posts." Then
  hold.
- **"I don't have anything written."** — Then have them write
  ~200 words off the cuff on any topic, in chat, as a
  voice-capture exercise. Not great, but better than zero.
  Flag in the profile that the sample base is thin.
- **"I'll just send one thing."** — Take it, build a partial
  profile, deliver a draft with explicit caveats: "based on
  one sample I'm guessing X about your voice — flag if I'm
  wrong." Treat this as a temporary state, ask for more after.

## What you do with them

Save each sample to `/voice/samples/<slug>.md` (or
`/voice/<author-id>/samples/<slug>.md` for multi-author).
Header each file with:

```
---
source: <blog post / LinkedIn / email / tweet / chat draft / etc>
date: <YYYY-MM-DD or approx>
context: <one line — who was it written for, what was the goal>
self_assessment: <good sample / bad sample, per user>
---

<verbatim text>
```

Then run `/skills/voice-profile.md` to build or update the
profile.

## Calibration questions (optional, only if samples are ambiguous)

After reading samples, you may have specific questions whose
answers significantly change the profile. Ask up to 3, no more.
Examples:

- "I noticed you use 'we' in the company posts and 'I' in the
  personal ones — for this draft, which is it?"
- "Your samples never use em-dashes. Is that deliberate? Some
  writers avoid them; some just don't reach for them but
  wouldn't object."
- "Two of three samples open with a question. Is that a habit
  you like, or coincidence?"

Don't ask trivia. Don't ask 10 questions. The samples should
tell you most of what you need.
