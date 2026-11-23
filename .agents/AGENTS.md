# Arx Manual

This repository is the user manual for Arx, a macOS browser. It is a static Nuxt site in a pnpm workspace; [README.md](../README.md) describes its layout, the Markdown components, the animated previews and the deploy.

- This file is the one source of truth for agent instructions here. The root `AGENTS.md` and `CLAUDE.md` only point to it, and `.claude/skills` and `.codex/skills` are symlinks to `.agents/skills`; put no rules in them.
- Keep AI-specific context in this single `.agents` directory. Consult the `ai-infrastructure` skill (`.agents/skills/ai-infrastructure`, the same published MIT copy as in `../arx-browser`) before adding AI artifacts.
- Track manual work in GitHub issues and pull requests; follow [issue-tracker.md](issue-tracker.md). What Arx plans to ship is in `../arx-browser`'s issues and the website changelog's Coming soon.
- **Pushing `main` deploys the live manual.** Commit locally with explicit-path staging. Never push without Maxim's go-ahead.
- **Write only what Arx does today.** The source of truth is the code in the sibling repository `../arx-browser`. Mark anything that isn't shipped as planned (`status: planned` or `::planned`) and keep `content/8.help/2.planned.md` in step with it. When a step can't be described yet, say so instead of guessing.
- **Use Arx's own words.** The names of things come from `../arx-browser/.agents/LANGUAGE.md`, and the exact names of menus, buttons and settings come from the app's string catalog, `../arx-browser/Packages/design-system/Sources/AppUI/Resources/AppUI.xcstrings`. Quote a control by the name the app shows.
- **Translations follow [LOCALIZATION.md](LOCALIZATION.md).** Read it before adding, changing or translating a page.
- A page that needs a clip gets a `::recording` placeholder with a shot list until its scene is drawn.
- Run `pnpm typecheck` before committing. `.claude/launch.json` starts the dev server (`manual`, `pnpm dev` on port 3100) for a preview.
- When several sessions edit the manual at once, each works in its own worktree of this repository and reports its branch; the main checkout stays on `main`.
