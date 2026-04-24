# Skill Registry

**Delegator use only.** Built during `sdd-init` for `cops-platform`.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| scholarly writing, papers, scientific literature | academic-researcher | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/academic-researcher/SKILL.md |
| code review, PR review, security vulnerabilities, performance issues | code-reviewer | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/code-reviewer/SKILL.md |
| content creation, blogging, social media, audience engagement | content-creator | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/content-creator/SKILL.md |
| data analysis, SQL, pandas, statistics | data-analyst | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/data-analyst/SKILL.md |
| debugging, error, bug, crash, not working | debugger | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/debugger/SKILL.md |
| decisions, options, trade-offs | decision-helper | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/decision-helper/SKILL.md |
| research, investigation, synthesis with citations | deep-research | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/deep-research/SKILL.md |
| editing, proofreading, revise, readability | editor | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/editor/SKILL.md |
| emails, message drafting, professional replies | email-drafter | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/email-drafter/SKILL.md |
| fact check, verify claims, misinformation | fact-checker | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/fact-checker/SKILL.md |
| React, Next.js, APIs, databases, full-stack development | fullstack-developer | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/fullstack-developer/SKILL.md |
| meeting notes, minutes, action items | meeting-notes | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/meeting-notes/SKILL.md |
| project planning, roadmap, milestones | project-planner | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/project-planner/SKILL.md |
| Python, PEP 8, Python debugging | python-expert | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/python-expert/SKILL.md |
| sprint planning, agile, scrum, story points | sprint-planner | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/sprint-planner/SKILL.md |
| strategy, business planning, long-term direction | strategy-advisor | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/strategy-advisor/SKILL.md |
| documentation, API references, tutorials | technical-writer | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/technical-writer/SKILL.md |
| UX design, wireframes, prototypes, user research | ux-designer | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/ux-designer/SKILL.md |
| data visualization, charts, dashboards | visualization-expert | /Users/oviedo/Documents/GitHub/cops-platform/.agents/skills/visualization-expert/SKILL.md |
| improve accessibility, a11y audit, WCAG compliance | accessibility | /Users/oviedo/.claude/skills/accessibility/SKILL.md |
| apply best practices, security audit, modernize code | best-practices | /Users/oviedo/.claude/skills/best-practices/SKILL.md |
| improve Core Web Vitals, fix LCP/CLS/INP | core-web-vitals | /Users/oviedo/.claude/skills/core-web-vitals/SKILL.md |
| optimize performance, page speed, load time | performance | /Users/oviedo/.claude/skills/performance/SKILL.md |
| improve SEO, meta tags, structured data | seo | /Users/oviedo/.claude/skills/seo/SKILL.md |
| audit my site, lighthouse, optimize website quality | web-quality-audit | /Users/oviedo/.claude/skills/web-quality-audit/SKILL.md |
| Go tests, Bubbletea TUI testing | go-testing | /Users/oviedo/.config/opencode/skills/go-testing/SKILL.md |
| create GitHub issue, report bug, request feature | issue-creation | /Users/oviedo/.config/opencode/skills/issue-creation/SKILL.md |
| create/open pull request, prepare review | branch-pr | /Users/oviedo/.config/opencode/skills/branch-pr/SKILL.md |

## Compact Rules

### fullstack-developer
- Prefer Next.js App Router and TypeScript-first structure for web work.
- Keep reusable primitives in `components/ui` and feature code near domain folders.
- Validate inputs with Zod/react-hook-form and keep API contracts typed.
- Separate UI, business rules, and persistence concerns; avoid mixing server access into presentational components.
- Consider security, performance, and deployment constraints as first-class design inputs.

### code-reviewer
- Review for correctness, security, performance, and maintainability before style-only feedback.
- Flag risky state management, unvalidated input, and permission boundary issues.
- Prefer concrete evidence from code over speculative criticism.
- Prioritize high-severity issues first, then medium/low concerns.
- Recommend actionable fixes with rationale, not vague opinions.

### debugger
- Reproduce and isolate the failure before proposing a fix.
- Form hypotheses from evidence, then verify each one against code or runtime output.
- Distinguish root cause from symptoms and document both.
- Prefer the smallest safe fix that addresses the real defect.
- Verify the fix with the most direct test or command available.

### technical-writer
- Optimize for clarity, structure, and reader task completion.
- Lead with purpose, prerequisites, and expected outcomes.
- Use precise terminology and stable paths/commands.
- Prefer examples that match the actual codebase conventions.
- Keep docs skimmable with headings, bullets, and short sections.

### project-planner
- Break work into milestones with explicit dependencies.
- Keep tasks small enough to complete and verify in one session.
- Separate discovery, implementation, verification, and rollout.
- Highlight risks, unknowns, and sequencing constraints.
- Prefer plans that create feedback loops early.

### python-expert
- Write explicit, typed, readable Python over clever one-liners.
- Follow PEP 8 and prefer standard-library solutions when sufficient.
- Isolate side effects and make functions easy to test.
- Use clear data models and validation for boundary inputs.
- Optimize only after correctness and profiling evidence.

### accessibility
- Design for keyboard, screen reader, focus order, and semantic HTML first.
- Meet WCAG 2.2 expectations for contrast, labels, and interaction states.
- Avoid inaccessible custom controls when native semantics suffice.
- Ensure errors and status changes are announced appropriately.
- Treat accessibility regressions as product bugs, not polish.

### best-practices
- Prefer secure defaults and remove legacy patterns that add risk.
- Validate input/output boundaries and avoid implicit trust in client data.
- Keep dependencies current and architecture simple enough to reason about.
- Use framework conventions instead of ad hoc custom infrastructure.
- Make compatibility, observability, and maintainability explicit.

### performance
- Measure hotspots before optimizing and focus on user-perceived latency.
- Reduce JS, network, and rendering cost before micro-optimizing code.
- Prefer caching, streaming, and lazy loading where it matches the UX.
- Avoid unnecessary re-renders and duplicate data fetching.
- Verify gains with concrete metrics, not intuition.

### core-web-vitals
- Optimize LCP by prioritizing critical content and asset delivery.
- Reduce CLS by reserving space and stabilizing async UI.
- Improve INP by shortening main-thread work and interaction chains.
- Audit third-party scripts and heavy client components aggressively.
- Tie recommendations back to measurable CWV outcomes.

### seo
- Ensure metadata, canonicalization, and crawlability are correct first.
- Structure content for intent matching and clear hierarchy.
- Use structured data only when it reflects visible page content.
- Prevent duplicate or thin content from polluting index signals.
- Validate technical SEO changes against rendering and routing behavior.

### web-quality-audit
- Evaluate performance, accessibility, SEO, and best practices together.
- Report problems by severity and user impact, not just tool scores.
- Prefer fixes that solve multiple quality dimensions at once.
- Ground findings in actual page behavior and configuration.
- Leave a prioritized remediation list with expected benefit.

### go-testing
- Keep Go tests table-driven and deterministic.
- Test behavior and contracts, not private implementation details.
- Use `teatest` patterns for Bubbletea/TUI work when applicable.
- Verify edge cases, error paths, and zero values explicitly.
- Keep fixtures lightweight and isolated.

### issue-creation
- Write issue titles that state the problem or desired capability clearly.
- Include context, expected behavior, and evidence/reproduction steps.
- Separate user impact from implementation speculation.
- Capture acceptance criteria that can be verified later.
- Avoid vague requests that cannot drive design or testing.

### branch-pr
- Summarize the branch as a coherent change, not a commit dump.
- Review all commits and net diff since divergence from base.
- Include verification evidence and notable risks in the PR body.
- Push safely without force unless explicitly requested.
- Return the PR URL after creation.

### academic-researcher
- Synthesize sources comparatively rather than listing them independently.
- Distinguish evidence strength, methodology, and limitations.
- Preserve citations and attribution accurately.
- Avoid overstating claims beyond the literature.
- Structure outputs for literature review or research decision-making.

### data-analyst
- Start from the analytical question and define the metric precisely.
- Check data quality and assumptions before interpreting results.
- Use reproducible transformations and explicit filters.
- Separate descriptive findings from causal claims.
- Present results in the clearest chart or table for the decision.

### decision-helper
- Frame the decision, criteria, and constraints before comparing options.
- Make trade-offs explicit instead of hiding them in narrative.
- Distinguish reversible from irreversible choices.
- Prefer decision matrices when multiple criteria compete.
- End with a recommendation tied to the stated priorities.

### deep-research
- Gather multiple sources and reconcile conflicts explicitly.
- Prefer primary and high-authority references when available.
- Keep citations attached to claims during synthesis.
- Surface open questions and uncertainty honestly.
- Produce concise conclusions supported by evidence.

### editor
- Improve clarity first, then grammar and style.
- Preserve author intent while removing ambiguity and redundancy.
- Tighten structure so each paragraph does one job.
- Use consistent tone and terminology throughout.
- Prefer direct sentences over inflated prose.

### email-drafter
- Lead with purpose and required action.
- Keep tone professional, concise, and audience-appropriate.
- Make deadlines, asks, and next steps explicit.
- Avoid unnecessary filler or defensive phrasing.
- End with a clear call to action.

### fact-checker
- Verify claims against evidence before repeating them as facts.
- Distinguish confirmed, disputed, and unsupported statements.
- Prefer authoritative and recent sources.
- Explain why a claim is weak when evidence is missing.
- Keep conclusions proportional to the data.

### meeting-notes
- Capture decisions, action items, owners, and deadlines explicitly.
- Separate discussion context from commitments.
- Keep notes chronological enough to reconstruct the conversation.
- Summarize unresolved questions for follow-up.
- Format for fast scanning after the meeting.

### sprint-planner
- Define a sprint goal before filling capacity.
- Estimate work relative to team capacity and dependencies.
- Keep backlog items small and testable.
- Balance feature delivery with bugs, tech debt, and support load.
- Identify spillover risk early.

### strategy-advisor
- Start from objectives, constraints, and competitive context.
- Compare options by leverage, risk, and reversibility.
- Surface second-order effects and execution complexity.
- Recommend a direction with explicit trade-offs.
- Avoid strategy that ignores operational reality.

### ux-designer
- Optimize for user goals, task flow, and clarity before visuals.
- Reduce cognitive load with obvious hierarchy and sensible defaults.
- Validate interactions against accessibility and edge states.
- Use research or proxies for user evidence whenever possible.
- Treat copy, layout, and feedback as part of the UX system.

### visualization-expert
- Choose charts based on comparison task and data shape.
- Avoid decorative visuals that weaken interpretation.
- Label axes, units, and series clearly.
- Prefer readability and honest scaling over novelty.
- Use dashboards to support decisions, not to display everything.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| CLAUDE.md | /Users/oviedo/Documents/GitHub/cops-platform/CLAUDE.md | Root project conventions and architecture context |

Read the convention files listed above for project-specific patterns and rules.
