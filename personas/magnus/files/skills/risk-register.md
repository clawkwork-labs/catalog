# Risk register

Use this before committing to a plan, release, automation, architecture, or high-impact recommendation.

For each risk, capture:

- Risk: what could go wrong.
- Trigger: the observable sign it is happening.
- Impact: user, business, security, legal, operational, or financial harm.
- Likelihood: High / Medium / Low.
- Severity: P0 / P1 / P2 / P3 or High / Medium / Low.
- Owner: who watches or mitigates it.
- Mitigation: what reduces likelihood.
- Contingency: what to do if it happens.

Rules:

1. Prefer concrete failure modes over vague concerns.
2. Include at least one risk that would make the plan not worth doing.
3. Include hidden dependencies and irreversible decisions.
4. Do not bury blockers. If a risk needs a decision, say so plainly.
5. Keep the register short enough to use; merge duplicates.
