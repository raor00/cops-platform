# Skill Registry — cops-platform
Generated: 2026-04-08

## Project Context Files
| File | Role |
|------|------|
| CLAUDE.md | Primary project context (stack, sprints, architecture, gotchas) |
| DEPLOYMENT.md | Deployment guide |
| README.md | Public README |
| apps/tickets/next.config.ts | Tickets app Next.js config |
| apps/tickets/vitest.config.ts | Unit test runner config |
| apps/tickets/playwright.config.ts | E2E test config |

## User-Level Skills (global)

### SDD Skills — `~/.config/opencode/skills/`
| Skill | Trigger |
|-------|---------|
| sdd-init | Initialize SDD context in a project |
| sdd-explore | Explore/investigate before a change |
| sdd-propose | Create change proposal |
| sdd-spec | Write specs (Given/When/Then) |
| sdd-design | Write technical design |
| sdd-tasks | Break down tasks |
| sdd-apply | Implement tasks |
| sdd-verify | Validate implementation vs specs |
| sdd-archive | Archive completed change |

### Workflow Skills — `~/.config/opencode/skills/`
| Skill | Trigger |
|-------|---------|
| branch-pr | Creating PRs |
| issue-creation | Creating GitHub issues |
| judgment-day | Adversarial dual review |
| skill-creator | Creating new agent skills |
| go-testing | Go tests / Bubbletea TUI |

### Quality Skills — `~/.agents/skills/`
| Skill | Trigger |
|-------|---------|
| accessibility | a11y audit / WCAG |
| best-practices | Security audit / modernize code |
| core-web-vitals | LCP / INP / CLS optimization |
| performance | Page speed optimization |
| seo | Search engine optimization |
| web-quality-audit | Full site quality audit |
| rn-expandable-tab-liquid-glass | React Native iOS 26 Liquid Glass tabs |

## Project-Level Skills — `.agents/skills/` and `.claude/skills/`
| Skill | Source |
|-------|--------|
| academic-researcher | .agents/skills/ |
| code-reviewer | .agents/skills/ |
| content-creator | .agents/skills/ |
| data-analyst | .agents/skills/ |
| debugger | .agents/skills/ |
| decision-helper | .agents/skills/ |
| deep-research | .agents/skills/ |
| editor | .agents/skills/ |
| email-drafter | .agents/skills/ |
| fact-checker | .agents/skills/ |
| fullstack-developer | .agents/skills/ |
| meeting-notes | .agents/skills/ |
| project-planner | .agents/skills/ |
| python-expert | .agents/skills/ |
| sprint-planner | .agents/skills/ |
| strategy-advisor | .agents/skills/ |
| technical-writer | .agents/skills/ |
| ux-designer | .agents/skills/ |
| visualization-expert | .agents/skills/ |

## Deduplication Note
Project-level `.agents/skills/` duplicates user-level `~/.agents/skills/` for the general-purpose skills.
`~/.config/opencode/skills/` holds SDD + workflow skills (non-overlapping).
