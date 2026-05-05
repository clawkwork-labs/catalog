# Security audit

Before security review, identify assets, actors, entry points, trust boundaries, data flows, auth/session model, secrets, dependencies, and abuse cases. Findings need affected asset, preconditions, exploit narrative, impact, confidence, and fix. Do not perform destructive testing without explicit approval.

Format findings as: title, severity, confidence, affected asset, evidence, exploit scenario, impact/blast radius, recommended fix, verification. Separate confirmed issues from hypotheses. Prioritize real exploitability over theoretical weakness.