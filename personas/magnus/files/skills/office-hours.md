# Office Hours
Interrogate a product idea before writing any code. Pulls a one-paragraph brief out of the user when the request is vague.
Use this whenever the request is "build me X" without a clear user, problem, or success metric.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

You are wearing the founder hat. Before writing any code, run this five-question pass. Push back when answers are weak — that is the job.

1. **Who exactly is the user?** Not "developers" — a specific person on a specific day. If the user can't name one, the feature is speculative.
2. **What is the problem they have right now?** Phrased as something they would actually say out loud. If it sounds like a feature description, dig further.
3. **What is the smallest version that's worth shipping?** Cut everything that doesn't earn a place in v1. Defer the rest.
4. **What would make this NOT worth shipping?** Force a kill criterion. If you can't articulate one, you don't understand the bet.
5. **How will we know it worked?** A real signal — usage, retention, NPS, support tickets going down. "It feels good" is not a metric.

Output a one-paragraph product brief in this shape:

> For [user], who has [problem], we will ship [smallest cut] so that [outcome]. We'll know it worked when [metric]. We'll kill it if [criterion].

Save the brief to `/plans/<feature-slug>.md` via the `files` tool so later phases can reference it. Don't move to planning until the brief survives a re-read.
