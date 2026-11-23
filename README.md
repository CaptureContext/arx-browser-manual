# Arx Manual

The user manual for [Arx](https://arxbrowser.net), served at
`manual.arxbrowser.net`.

It is a static Nuxt site in a pnpm workspace, built the same way as
`capturecontext-frontend`: `nuxt generate` writes plain files, and nginx serves
them from a Docker image on Railway.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3100
pnpm generate     # static site in apps/manual/.output/public
pnpm typecheck
pnpm recordings   # every screen recording in the manual, planned or done
```

Node 24 or newer. The dev server uses port 3100 so it can run next to the main
site on 3000.

## Layout

```
apps/manual/
  content/                 Markdown pages, one folder per sidebar group
    1.start/.navigation.yml  group title, description and icon
    1.start/1.getting-started.md
  app/
    layouts/default.vue    sidebar, mobile top bar, ⌘K
    pages/index.vue        home page
    pages/[...slug].vue    doc page: title, body, table of contents, pager
    components/            sidebar, search dialog, table of contents
    components/content/    components usable from Markdown
    assets/css/main.css    theme tokens
  server/routes/search.json.get.ts   search index, prerendered
  public/recordings/       screen recordings (empty until we record)
packages/nuxt-raycast-icons  copy of the Raycast icon module from capturecontext-frontend
```

The number prefixes on folders and files set the order and are dropped from
URLs: `content/2.tabs/3.peek.md` is `/tabs/peek`.

## Writing pages

Each page has frontmatter:

```yaml
---
title: Peek
description: One sentence. Shown under the title, on home page cards and in search.
icon: raycast:eye     # optional, shown on home page cards
status: ready         # draft (default) adds a "first draft" note;
                      # planned adds a Planned badge here and in the sidebar
---
```

Write only what Arx does today, and mark anything else as planned (a
`status: planned` page or a `::planned` callout), then list it on
`content/8.help/2.planned.md`. The source of truth is the arx-browser code;
its GitHub issues and the "Coming soon" list of the website's changelog say
what's planned. Product facts and wording come from the website in
`arx-browser-frontend` (`apps/web/shared/arx.ts` and
`apps/web/app/components/domain/arx/`). When a page needs a step we can't
describe yet, say so plainly instead of guessing.

Markdown components:

| Component | Use |
| --- | --- |
| `::tip`, `::note`, `::warning` | Callouts |
| `:keys{combo="⇧ ⌘ T"}` | Keycaps inline, one per space-separated key |
| `::shortcut-table` with `rows: [[Action, ⌘ K], …]` in YAML | Action and key list |
| `::recording{shot="…"}` | Screen recording, or a placeholder until it exists |
| `::planned` | A callout for something Arx doesn't do yet |
| `:planned-badge` | An inline Planned badge |

Icons are Raycast icons (`raycast:<name>`, see `packages/nuxt-raycast-icons/icons`).
Icons named in content are added to the client bundle by `nuxt.config.ts`.

## Search

`/search.json` is built at generate time from every heading section of every
page (`queryCollectionSearchSections`). The dialog loads it on first open and
ranks matches in the browser: title prefix, then title, heading trail, then body.
⌘K, Ctrl+K or `/` opens it.

## Theme

`app/assets/css/main.css` follows manual.raycast.com's palette with more
contrast: a darker window (`#111` against Raycast's `#151515`), body text at 86%
instead of 80%, firmer borders. Components (sidebar, keycaps, inline code,
callouts, code blocks, pager, table of contents) use Raycast's measured sizes,
radii and states.

The accent is a saturated blue, tuned to stand out as much as Raycast's red does
on its background. Light mode uses a pure sRGB blue so browsers don't dull it
while mapping an out-of-gamut colour:

| | Raycast | Arx Manual | Contrast |
| --- | --- | --- | --- |
| Dark | `#ff6363` on `#151515`: 6.3:1 | `oklch(0.68 0.18 252)` (`#309aff`) on `#111` | 6.5:1 |
| Light | `#d02423` on white: 5.3:1 | `#0066ff` (`oklch(0.563 0.241 260.8)`) on white | 4.8:1 |

The same value is used for links, the active sidebar and TOC items, keycaps and
focus rings.

The theme toggle cycles System → Light → Dark. System follows the Mac's
appearance live. A script in the page head applies the choice (saved in
`localStorage` as `arx-manual-theme`) before first paint, so there's no flash.

## Animated previews

The manual's clips aren't videos: they're Arx's window drawn in HTML from its own sizes and colors (`BrowserMetrics` and `BrowserTheme` in arx-browser) and played by a script. They stay sharp at any size, follow the manual's light or dark theme, weigh a few kilobytes and are easy to change when Arx changes.

- `app/components/arx/` draws the window: `Window`, `Sidebar`, `CommandBar`, `ChatPanel`, `HoverCard`, `Menu`, `Page` and `Sites` (stand-in web pages) and `Favicon`. `Overlays` draws what floats over it: dialogs, prompt cards, the Runway, the list under a form field, Little Arx and other apps' windows. `Form` draws a settings-style sheet, popover or assistant window from sections of rows, so most new surfaces need no component of their own, and `ThemeEditor` is the colors editor. `Stage` plays a scene: it scales the 1280 × 800 window to fit, moves a drawn pointer, zooms, shows pressed keys, loops while on screen and holds still for reduced motion. It ignores the pointer and keyboard.
- `app/utils/arxModel.ts` is the state they draw (`ArxWorld`) and the demo spaces, profiles and tabs. `app/utils/arxScene.ts` is the scene API.
- Actions show what kind they are, while the pointer stays the same: the rounded, tailless arrowhead in the manual's accent that the recordings used (`cursor.swift` in arx-browser). `click`, `doubleClick`, `rightClick` and `forceClick` each have their own effect around the pointer (one ring, two rings, a purple ring, pressure then a deep ring) and their own motion of the arrow (a dip, two dips, a wiggle, a squash and pop). `drag` holds the arrow down with a grab ring and lands with a green drop ring. `swipe` draws two fingertips sliding with trails, for two-finger swipes and scrolls. Gestures show a short, quiet label under the pointer that always moves with it; keys show as keycaps at the bottom. The pointer, effects and labels are drawn above the camera at one size on screen (`--fx` on `.pointer-layer` in `Stage.vue`), so nothing about them changes with the preview's size or a zoom. The camera runs frame by frame: it eases to the scene's zoom and follows the pointer near the edges, keeping room for a label under it (`POINTER_ROOM`).
- `app/scenes/<name>.ts` is one scene: `setup` changes the starting world, `run` moves, clicks, drags, types and changes the world step by step. Targets are elements marked `data-arx="tab:<id>"`, `folder:<id>`, `space:<id>`, `menu:<label>` and so on. Register it in `app/scenes/index.ts`.
- Pages show a scene with `::preview{scene="<name>" caption="…"}`; without `caption`, the scene's own caption shows.
- To review frames in the browser: `window.__arxPaused = true` holds every preview at its next step, and `window.__arxSpeed = 4` plays them four times as fast.
- A preview never holds a secret. Password fields fill with dots, a card number shows masked, and each profile's accounts stay in that profile's windows.
- Icons render as `span` elements, so style a part's own `span`s by class or as direct children (`> span`). A bare `.part span` rule restyles the icons inside it too.
- An icon name a scene or the model builds at runtime is only bundled when it's written as `icon: '<name>'` or `name: '<name>'` in `app/scenes`, `app/utils/arxModel.ts` or `app/components/arx` (see `nuxt.config.ts`); restart `pnpm dev` after adding one.

## Planned clips

Every clip in the manual is an animated preview (above), and none is waiting to be drawn. A new clip can start as a placeholder, `::recording{shot="…"}`, which shows its shot list; `pnpm recordings` prints them all. To draw one, write `app/scenes/<name>.ts`, register it, and change the tag to `::preview{scene="<name>" caption="…"}`.

`::recording{src="<name>"}` still plays a scene by that name, or a video from `public/recordings/` (`<name>.webm`, `<name>.jpg`, with `dark` for `<name>-dark.*`) if one is ever needed. arx-browser's `make recordings` (`Scripts/recordings/`) can still record and encode such clips.

## Deploy on Railway

The Railway project is `arx`, with one service, `manual-frontend`, in `ams`.

| Environment | Branch | Domain | Indexable |
| --- | --- | --- | --- |
| production | `main` | `manual.arxbrowser.net`, `manual-frontend-production.up.railway.app` | yes |
| staging | `main` | `manual-frontend-staging.up.railway.app` | no |
| PR previews | the PR's branch | generated per PR, posted on the PR by Railway | no |

PR environments copy `staging`, the same setup as capturecontext-frontend. A PR
gets its own `*.up.railway.app` domain because the staging service has a
Railway domain; Railway removes the environment when the PR is merged or closed.

- Builder: the root `Dockerfile`. The image builds the site and serves
  `apps/manual/.output/public` with nginx on `$PORT` (Railway's default, 8080;
  use that port for the custom domain).
- `RAILWAY_ENVIRONMENT_NAME` is set by Railway. Only `production` lets search
  engines index the site; every other environment sends
  `X-Robots-Tag: noindex, nofollow` and a robots meta tag.
- `NUXT_PUBLIC_SITE_URL`: unset in production (defaults to
  `https://manual.arxbrowser.net`), `https://${{RAILWAY_PUBLIC_DOMAIN}}`
  in staging, so every preview builds with its own address.
- Custom domain: `manual.arxbrowser.net`. The earlier
  `manual.arx.capturecontext.dev` (a CNAME at Squarespace to the target Railway
  shows) stays attached: Arx 0.1.0 opens it from Help → Arx Manual and What's
  New.

Railway no longer reads `railway.json` for newly created services, so the
service settings live in Railway itself. The ones that matter:

- **Start command: empty.** Railway may fill in `pnpm … dev` from
  `package.json`; that overrides the Dockerfile's nginx command, and the nginx
  image has no `pnpm`, so the container fails with "pnpm could not be found".
- Health check `/`, timeout 100 s, restart on failure up to 3 times.
- Watch paths: `/apps/manual/**`, `/packages/**`, and the root `Dockerfile`,
  `nginx.conf`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` and
  `railway.json`. A change outside them, such as this README, doesn't deploy.
