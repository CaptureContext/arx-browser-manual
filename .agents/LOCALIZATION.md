# Localizing the manual

The rule for people and agents who translate the manual or change a page that has translations.

English is the source. The manual is translated into the languages Arx itself ships in: Polish (`pl`), Russian (`ru`), Ukrainian (`uk`), German (`de`), French (`fr`), Spanish (`es`), Japanese (`ja`) and Simplified Chinese (`zh-Hans`). A language is added to the manual only after the app ships in it.

## Status

The site is English only today. `nuxt.config.ts` sets `lang: 'en'`, `content/` holds one set of pages, and the search index is built once. The structure below is the plan the translations are written for; setting it up is the first step of the translation work, not something a translator assumes exists.

## Where translations live

- English pages stay where they are: `apps/manual/content/<n>.<group>/<n>.<page>.md`.
- A translation mirrors that path under its language: `apps/manual/content/<lang>/<n>.<group>/<n>.<page>.md`, with the same file names and number prefixes, so a page and its translations share a URL slug. `/tabs/peek` is English; `/de/tabs/peek` is German.
- Each language has its own `.navigation.yml` per group, with the group's title and description translated.
- A page with no translation yet shows the English page under the language's URL, with a note saying so. A language is never half-linked: its sidebar lists every page.
- The site's own text (sidebar, pager, search dialog, theme toggle, the "first draft" and Planned labels) and the text inside the animated previews (`app/utils/arxModel.ts` and the scenes) are translated too. A preview must show the same names the translated app shows.
- Search is built per language from that language's pages.

## The naming rule

The manual describes the app, so it uses the app's translated names exactly.

1. **A menu item, button, setting, Settings page or command is written as the app shows it in that language.** Look the English text up in Arx's string catalog (`../arx-browser/Packages/design-system/Sources/AppUI/Resources/AppUI.xcstrings`) and copy that language's value. Never translate a control's name yourself. If the catalog and the manual disagree, the catalog is right.
2. **Terms come from the app's glossary for the language**: `../arx-browser/.agents/localization/glossary.<lang>.md`. It says which Arx names stay in English everywhere (Arx, Little Arx, Peek, Air Traffic Control, Runway, bang), how PiP and PagePiP are written, and the language's word for an Arx space, which is never Apple's word for macOS Spaces.
3. **Everything else follows the conventions of localized software**, as `../arx-browser/.agents/LOCALIZATION.md` sets out: a system concept is named the way Apple names it in that language in macOS and Safari, then the way Chrome names it. macOS's own menus, System Settings panes and apps (Finder, Dock, Keychain Access, the Passwords app) are written as Apple localizes them.
4. The per-language conventions in that file apply here too: the form of address, capitals, quotation marks, punctuation and the ellipsis.

## What is not translated

- Keyboard symbols and key combinations (`:keys{combo="⇧ ⌘ T"}`), URLs, file names and paths, code and command lines, environment variables and feature flag names.
- MCP tool names, arguments and error codes on the assistants and developers pages. The sentences around them are translated.
- Frontmatter keys, component names and their attribute names (`::tip`, `::recording{shot="…"}`, `scene="…"`). Translate the values a reader sees: `title`, `description`, `caption`, the text of a `shot` list, the `rows` of a `::shortcut-table`.
- `icon`, `status` and scene names.

## Writing a translation

- Translate meaning, sentence by sentence, in the plain style of the English: short sentences, concrete steps, no marketing tone.
- Keep the page's structure: the same headings in the same order, the same callouts, tables, previews and placeholders. Headings become anchors, so a link to a heading on another page (`/tabs/peek#closing`) must use that language's anchor.
- Internal links point at the same language: `/de/tabs/peek`, not `/tabs/peek`.
- A page marked `status: planned`, and every `::planned` callout, stays marked in every language.
- Don't add facts the English page doesn't have, and don't drop any. If the English looks wrong, fix the English first.

## When the English changes

- A change to an English page is not finished until its translations are updated or marked. Each translated page records the commit of the English it was translated from in its frontmatter (`source: <short hash>`); a page whose English has changed since is stale.
- A small fix (a typo, a link) updates the hash without retranslating.
- When the app renames a control, the manual changes in every language in the same piece of work, using the catalog's new values.

## Checks

- `pnpm typecheck`, as for any change.
- Before a language goes live: every page exists or falls back, no internal link leaves the language, every quoted control name matches the catalog, and someone has looked at the built site in that language.

## Who has read the translations

The app's translations were made by machine against the glossaries and reviewed for consistency, not by fluent speakers. The manual's translations start the same way. Say so on the manual's help page for each language until a fluent reader has gone through it.
