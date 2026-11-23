---
name: ai-infrastructure
description: "Define and maintain the core project conventions for AI infrastructure under one project-root .agents directory. Use when organizing durable agent context or deciding where AI-specific configuration, skills, research, terminology, ADRs, and tracker preferences belong."
---

# AI Infrastructure

Keep all project-specific AI infrastructure, configuration, and durable agent context inside the single `./.agents` directory at the project root.

Resolve the project root from the active repository or workspace before writing. Do not create nested `.agents` directories in packages, bounded contexts, example apps, or other descendants. Represent narrower contexts under `.agents/contexts/<context-slug>/` and link them from their parent context or durable artifact.

Store these artifacts under `.agents`:

- Agent configuration and instructions.
- Project- and domain-specific skills.
- Tracker preferences and provider mappings.
- Research notes, context dumps, logs, language specifications, ADRs, and AI documentation.
- Local-only tracker state when the configured tracker provider is local Markdown.

Do not treat `.agents` as a mirror of external systems. Keep collaborative work state—issues, product decisions, comments, assignments, blockers, project status, and implementation history—in the configured issue tracker. Link across the boundary when durable AI context depends on tracker history.

Keep production code and user-facing assets in their normal project locations. An artifact is not AI infrastructure merely because an agent created it.

## Conventional layout

Create directories lazily:

```text
AGENTS.md             # pointer to .agents/AGENTS.md, for harnesses that read the root
CLAUDE.md             # pointer to .agents/AGENTS.md (imports it with @.agents/AGENTS.md)
.claude/skills -> ../.agents/skills
.codex/skills  -> ../.agents/skills
.agents/
├── AGENTS.md         # the project's agent instructions: the one source of truth
├── issue-tracker.md
├── LANGUAGE.md
├── adrs/
├── contexts/
│   └── <context-slug>/
├── research/
├── skills/
└── wayfinder/        # local tracker state, and research scoped to it, only
```

Project-specific skills belong in `./.agents/skills/`. Context-specific language, ADRs, or research belong below `./.agents/contexts/<context-slug>/`, never beside production source in another `.agents` directory.

## Harness pointers

Agent harnesses look for instructions and skills in their own places. Keep each of those a pointer, never a copy, so `.agents` stays the one source of truth:

- The root `AGENTS.md` and `CLAUDE.md` only say where the instructions are. `CLAUDE.md` may import `.agents/AGENTS.md` with an `@.agents/AGENTS.md` line. Put no rules in either.
- `.claude/skills` and `.codex/skills` are relative symlinks to `../.agents/skills`, committed as symlinks (Git mode `120000`). Edit skills under `.agents/skills`, never through a harness folder.
- Anything else a harness keeps in its folder, such as settings or hooks, stays a real file there. Keep personal files, such as `.claude/settings.local.json`, out of Git.

Skills that produce or route AI-specific project artifacts must reference the `ai-infrastructure` skill themselves. This keeps the dependency direction consumer-to-core and allows skill installers to resolve the core preference before those skills are used.
