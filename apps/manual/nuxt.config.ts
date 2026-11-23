import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteIndexable = process.env.RAILWAY_ENVIRONMENT_NAME === 'production'

// The icon scanner only sees names written literally in Vue templates. Icons
// named in content (frontmatter and .navigation.yml) are collected here and
// added to the client bundle.
const contentDir = fileURLToPath(new URL('./content', import.meta.url))
const contentIcons = [...new Set(
  readdirSync(contentDir, { recursive: true, encoding: 'utf8' })
    .filter(file => /\.(md|yml)$/.test(file))
    .flatMap(file => [...readFileSync(join(contentDir, file), 'utf8').matchAll(/\braycast:[a-z0-9-]+/g)].map(match => match[0]))
)]

// The animated Arx previews build icon names at runtime (favicons and space icons
// in app/utils/arxModel.ts and app/scenes), so those are collected the same way.
const previewIcons = [
  'app/utils/arxModel.ts',
  ...readdirSync(fileURLToPath(new URL('./app/scenes', import.meta.url))).map(file => `app/scenes/${file}`),
  ...readdirSync(fileURLToPath(new URL('./app/components/arx', import.meta.url))).map(file => `app/components/arx/${file}`),
]
  .flatMap(file => [...readFileSync(fileURLToPath(new URL(`./${file}`, import.meta.url)), 'utf8').matchAll(/(?:name|icon): '([a-z0-9-]+)'/g)].map(match => `raycast:${match[1]}`))

// An icon that isn't in the set stops the client bundle from compiling, and the build
// then fails far from the cause, so a misspelt name fails here, naming the icon.
const knownIcons = new Set<string>(
  JSON.parse(readFileSync(createRequire(import.meta.url).resolve('nuxt-raycast-icons/icon-names.json'), 'utf8')).icons
)
const unknownIcons = [...contentIcons, ...previewIcons].filter(icon => !knownIcons.has(icon.replace(/^raycast:/, '')))
if (unknownIcons.length > 0) {
  throw new Error(`Unknown Raycast icons: ${[...new Set(unknownIcons)].join(', ')}. See packages/nuxt-raycast-icons/icon-names.json.`)
}

export default defineNuxtConfig({
  compatibilityDate: '2026-03-23',
  devtools: { enabled: true },
  modules: ['nuxt-raycast-icons', '@nuxt/icon', '@nuxt/content'],
  css: ['~/assets/css/main.css', '~/assets/css/arx-wordmark.css'],
  content: {
    // Node's built-in SQLite, so installs need no native build step.
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          theme: { default: 'github-dark-high-contrast', light: 'github-light', dark: 'github-dark-high-contrast' },
          langs: ['bash', 'json', 'shell']
        }
      }
    },
    renderer: { anchorLinks: { h2: true, h3: true } }
  },
  icon: {
    provider: 'none',
    clientBundle: { scan: true, includeCustomCollections: false, icons: [...contentIcons, ...previewIcons, 'raycast:blank-document', 'raycast:desktop', 'raycast:sun', 'raycast:moon'] }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Arx Manual',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ...(siteIndexable ? [] : [{ name: 'robots', content: 'noindex, nofollow' }])
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/brand/arx-icon.png' },
        { rel: 'preload', href: '/fonts/ArxWordmark-VariableFont_wght.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap' }
      ],
      script: [
        {
          // Runs before first paint, so there's no flash of the wrong theme.
          // The preference is system, light or dark; data-theme is always the
          // resolved light or dark. System follows prefers-color-scheme live.
          // ThemeToggle.vue drives it through window.__arxTheme.
          key: 'arx-manual-theme',
          innerHTML: `(() => {
            const key = 'arx-manual-theme'
            const query = matchMedia('(prefers-color-scheme: dark)')
            const read = () => { try { const v = localStorage.getItem(key); return v === 'light' || v === 'dark' ? v : 'system' } catch { return 'system' } }
            let preference = read()
            const apply = () => {
              const root = document.documentElement
              root.dataset.theme = preference === 'system' ? (query.matches ? 'dark' : 'light') : preference
              root.dataset.themePreference = preference
            }
            apply()
            const follow = () => { if (preference === 'system') apply() }
            query.addEventListener('change', follow)
            // Also re-check when the window comes back, in case a change event was missed.
            addEventListener('focus', follow)
            document.addEventListener('visibilitychange', follow)
            window.__arxTheme = {
              get: () => preference,
              set: (value) => {
                preference = value
                try { value === 'system' ? localStorage.removeItem(key) : localStorage.setItem(key, value) } catch {}
                apply()
              }
            }
          })();`
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://manual.arxbrowser.net',
      landingUrl: 'https://arxbrowser.net',
      siteIndexable
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/search.json'],
      failOnError: true
    }
  }
})
