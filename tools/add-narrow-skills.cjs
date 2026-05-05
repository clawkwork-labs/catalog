const fs = require('fs');
const path = require('path');

const skillsDir = path.join(process.cwd(), 'personas/magnus/files/skills');

const skills = {
  'engineering-handoff.md': `# Engineering handoff\n\nUse when turning a goal into buildable engineering work. Capture outcome, non-goals, data flow, interfaces, storage, failure modes, owners, test matrix, rollout, and rollback. The handoff is not ready until a builder can start without re-litigating scope.\n`,
  'qa-charter.md': `# QA charter\n\nUse before testing. Define user flow, environment, accounts/test data, happy path, edge cases, permissions, empty/loading/error states, browser/device matrix, and bug severity rubric. File bugs only when reproduced or clearly marked intermittent.\n`,
  'translation-brief.md': `# Translation brief\n\nCapture source locale, target locale, audience, domain, formality, tone, regional variant, terms not to translate, glossary entries, placeholders, formatting, and whether the task is literal translation, polished translation, localization, transcreation, or bilingual review.\n`,
  'tutoring-loop.md': `# Tutoring loop\n\nDiagnose current level first. Teach one concept at a time using worked example, guided practice, independent practice, and retrieval check. Ask before telling when the student is stuck. Track misconceptions and schedule spaced review. Do not do graded work dishonestly.\n`,
  'meeting-notes.md': `# Meeting notes\n\nExtract decisions, action items, owners, due dates, open questions, risks, and follow-up message. Do not summarize conversation turns. Mark unclear attribution or uncertain decisions instead of inventing certainty.\n`,
  'voice-ethics.md': `# Voice ethics\n\nWrite in the user's own voice only with consent and source samples. Do not impersonate another real person deceptively. Preserve facts while changing style. Track channel adaptation separately from core voice. Offer a voice diff when useful.\n`,
  'dx-audit.md': `# DX audit\n\nAudit as the target developer persona. Time Time To Hello World, record every step, command, confusion, error, doc mismatch, missing prerequisite, and first value moment. Classify friction as stop-ship, confusing, or polish.\n`,
  'devops-ci.md': `# DevOps CI\n\nReview pipeline duration, queue time, flake rate, caching, parallelism, failure classes, token scopes, OIDC/secrets, local/CI parity, artifact retention, rollback path, and cost. Slow or flaky CI is broken CI.\n`,
  'home-automation.md': `# Home automation\n\nInventory rooms, devices, protocols, household members, presence signals, safety-critical devices, and overrides. Every automation needs trigger, conditions, actions, fallback, test, conflict check, and manual override. Prefer fewer reliable routines.\n`,
  'status-rollup.md': `# Status rollup\n\nLead with delta since last check. Track shipped, in flight, blocked, risks, decisions needed, owners, last update, source, and confidence. Keep executive answers under ten lines and link out for detail.\n`,
  'design-system-governance.md': `# Design system governance\n\nClassify primitive, pattern, or one-off. Review tokens, component API, accessibility, examples, adoption, migration, and deprecation. Reject boolean prop explosions and raw values that should be semantic tokens.\n`,
  'chief-of-staff.md': `# Chief of staff operating system\n\nMaintain priority stack, decision log, commitment ledger, delegation ledger, stale-thread list, and escalation filter. Protect principal attention: surface judgment calls, risks, and cross-cutting decisions; absorb or route the rest.\n`,
  'task-router.md': `# Task router\n\nClassify work as tiny, small, non-trivial, incident, or high-risk. Choose the lightest sufficient process. High-risk work gets planning, review, QA, security/release gates, and rollback. Low-risk work should not drown in ceremony.\n`,
  'scholarship-pipeline.md': `# Scholarship pipeline\n\nCheck eligibility, deadline, required materials, essay prompts, amount, odds, effort, renewability, stackability, disbursement, and scam signals. Maintain reusable essay blocks and submission confirmations. Prioritize expected value over raw award size.\n`,
  'design-exploration.md': `# Design exploration\n\nGenerate directions that differ by layout skeleton, density, information architecture, tone, interaction model, and visual metaphor. For each direction, state when it is right, when it is wrong, and what user assumption it tests.\n`,
  'code-review.md': `# Code review\n\nReview production risk before style. Findings need severity, confidence, affected behavior, evidence, suggested fix, and test expectation. Avoid personal-preference churn. End with approve, comment, or request changes.\n`,
  'product-design-review.md': `# Product design review\n\nStart with user task, state, and success criterion. Review flow, hierarchy, affordance, copy, states, accessibility, responsiveness, and instrumentation/prototype next step. Recommendations must attach to concrete UI elements.\n`,
  'project-plan.md': `# Project plan\n\nWork backward from outcome. Capture assumptions, non-goals, milestones that ship useful artifacts, dependency graph, critical path, owner model, risks, first irreversible decision, and first useful deliverable.\n`,
  'travel-planning.md': `# Travel planning\n\nCapture destination, dates, budget, pace, travelers, mobility/dietary needs, passport/visa constraints, weather/closures, cancellation risk, loyalty preferences, neighborhoods, transit buffers, backup plans, and booking readiness.\n`,
  'sales-workflow.md': `# Sales workflow\n\nResearch ICP, account, role, trigger event, pain hypothesis, current workaround, decision process, objection risks, and next ask. Outreach must be specific, honest, short, and low-pressure. Stop before spam or deceptive familiarity.\n`,
  'architecture-adr.md': `# Architecture ADR\n\nCapture context, forces, decision, alternatives rejected, consequences, data ownership, interfaces, failure modes, migration path, fitness functions, and what becomes easy or hard to change later.\n`,
  'college-list.md': `# College list\n\nCapture student profile, budget, aid expectations, geography, major, rigor, scores, size/culture, support needs, and family constraints. Classify admissions reach/match/safety separately from financial safety. Prefer official sources and net price calculators.\n`,
  'social-calendar.md': `# Social calendar\n\nCapture audience, platform, goal, voice, format, hook, CTA, media, approval need, schedule, brand-safety risks, engagement policy, and analytics loop. Learn from performance instead of repeating generic posts.\n`,
  'content-writing.md': `# Content writing\n\nCapture audience, goal, thesis, channel, brand voice, source material, CTA, claims needing support, SEO/search intent if relevant, and banned phrases. Outline first, draft second, edit for specificity and redundancy third.\n`,
  'recruiting-scorecard.md': `# Recruiting scorecard\n\nBefore sourcing, capture role outcomes, must-haves, nice-to-haves, dealbreakers, comp/location constraints, interview loop, and calibration examples. Score candidates with job-relevant evidence, confidence, risks, and follow-up questions.\n`,
  'forecast-question.md': `# Forecast question\n\nTurn vague predictions into resolvable questions: event/value, horizon, unit, source of truth, base rate, forecast range/probability, assumptions, leading indicators, update triggers, and resolution date.\n`,
  'product-interrogation.md': `# Product interrogation\n\nAsk one forcing question at a time. Push vague answers toward named users, concrete examples, current workaround, willingness to pay/change, distribution path, smallest useful test, kill criteria, and contradictions with prior answers. End with a brief.\n`,
  'systems-profiling.md': `# Systems profiling\n\nMeasure before changing. Define workload, environment, baseline, profiler, resource ceiling, variance, correctness constraints, and rollback. For concurrency, prove race/deadlock/cancellation/backpressure behavior, not just speed.\n`,
  'debugging-repro.md': `# Debugging repro\n\nReproduce before fixing unless applying an explicit mitigation. Build a timeline, recent changes, blast radius, three hypotheses max, targeted instrumentation, minimal repro, root cause, regression test, and verification.\n`,
  'software-implementation.md': `# Software implementation\n\nOrient in the repo before coding. Follow existing conventions. Make the smallest coherent diff, test alongside changes, avoid opportunistic refactors, record files changed, behavior changed, tests run, risks, and specialist escalation triggers.\n`,
  'basic-agent-loop.md': `# Basic agent loop\n\nUnderstand the task, make a brief plan, use tools when needed for current facts/files/math/actions, verify results, then summarize outcome and next options. Ask only when ambiguity blocks progress. Never fabricate tool results.\n`,
  'personal-assistant.md': `# Personal assistant\n\nMaintain principal profile, daily brief, calendar conflicts, meeting prep, inbox/message triage, commitment ledger, follow-ups, and weekly review. Draft but do not send without approval unless permission is explicit.\n`,
  'product-strategy.md': `# Product strategy\n\nFrame user problem, current workaround, competitive/substitute landscape, wedge, why now, adoption path, 90-day scope, riskiest assumption, validation plan, kill criteria, and what not to build.\n`,
  'research-brief.md': `# Research brief\n\nUse primary sources first. Produce topic, answer, key findings with claim-level citations, contradictions, gaps, confidence, source dates, and next research checks. Label facts, inference, and speculation.\n`,
  'performance-budget.md': `# Performance budget\n\nSet budgets by route and resource type. Separate lab from field data. Attribute LCP, INP, CLS, bundle, network, server, and runtime costs. Change one variable at a time and report before/after with confidence.\n`
};

fs.mkdirSync(skillsDir, { recursive: true });
for (const [name, body] of Object.entries(skills)) fs.writeFileSync(path.join(skillsDir, name), body);

const personaSkills = {
  apollo:['engineering-handoff.md'], artemis:['qa-charter.md'], atlas:['release-readiness.md'], babel:['translation-brief.md'], chiron:['tutoring-loop.md'], clio:['meeting-notes.md'], cyrano:['voice-ethics.md'], flint:['dx-audit.md'], hawk:['devops-ci.md'], hestia:['home-automation.md'], janus:['status-rollup.md'], loom:['design-system-governance.md'], lumen:['personal-assistant.md','chief-of-staff.md'], magnus:['task-router.md'], midas:['scholarship-pipeline.md'], muse:['design-exploration.md'], nemesis:['code-review.md'], neon:['product-design-review.md'], nestor:['project-plan.md'], nova:['basic-agent-loop.md'], orion:['travel-planning.md'], orpheus:['sales-workflow.md'], pharos:['architecture-adr.md'], polaris:['college-list.md'], pulse:['social-calendar.md'], quill:['content-writing.md'], scout:['recruiting-scorecard.md'], sibyl:['forecast-question.md'], sol:['chief-of-staff.md'], sphinx:['product-interrogation.md'], tectonic:['systems-profiling.md'], theseus:['debugging-repro.md'], vulcan:['software-implementation.md'], athena:['product-strategy.md'], argus:['research-brief.md'], vega:['performance-budget.md'], daedalus:['product-design-review.md'], echo:['docs-audit.md'], eir:['health-coaching.md'], fortuna:['finance-planning.md'], hermes:['message-triage.md'], juno:['incident-response.md'], kai:['threat-model.md','security-finding.md'], maestro:['dispatch-manifest.md'], prism:['data-quality-check.md'], raven:['message-triage.md'], ren:['support-intake.md'], sage:['automation-safety.md'], themis:['legal-review.md'], thoth:['data-quality-check.md'], arachne:['synthesis-map.md']
};

for (const [id, list] of Object.entries(personaSkills)) {
  const file = path.join(process.cwd(), 'personas', id, 'persona.yaml');
  let text = fs.readFileSync(file, 'utf8');
  const paths = list.map(s => `/skills/${s}`);
  const line = `\n  Narrow persona skills to read when relevant: ${paths.join(', ')}.\n`;
  if (!text.includes('Narrow persona skills to read when relevant:')) {
    text = text.replace(/(system_prompt: \|\n[\s\S]*?)(\nconfig:)/, (m, prompt, config) => prompt.replace(/\s+$/, '') + line + config);
  }
  if (id !== 'magnus') {
    for (const p of paths) {
      if (!text.includes(`    - ${p}`)) {
        const idx = text.lastIndexOf('    paths:\n');
        if (idx >= 0) {
          const after = idx + '    paths:\n'.length;
          text = text.slice(0, after) + `    - ${p}\n` + text.slice(after);
        }
      }
    }
  }
  fs.writeFileSync(file, text);
}
