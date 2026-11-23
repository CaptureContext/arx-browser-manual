<script setup lang="ts">
import type { ArxWorld } from '~/utils/arxModel'
import { selectedIn, speakerIcon } from '~/utils/arxModel'

// An Arx window, 1280 × 800 points: the tinted frame, the sidebar, the page card
// (or a Split View), and whatever floats over them.
const props = defineProps<{ world: ArxWorld }>()

const root = ref<HTMLElement>()
const space = computed(() => props.world.spaces[Math.round(props.world.space)]!)
const selected = computed(() => selectedIn(props.world, space.value))
const left = computed(() => props.world.library ? 418 : props.world.sidebarHidden ? 8 : 286)
const right = computed(() => props.world.chat ? props.world.chat.width + 16 : 8)

// The swipe's history list (DEV-1276): five rows at most, starting two above the selection
// and clamped to the ends, placed so the selected row is level with the arrow.
type HistoryList = { rows: unknown[], selected: number }
function historyListStart(list: HistoryList) {
  if (list.rows.length <= 5) return 0
  return Math.min(Math.max(list.selected - 2, 0), list.rows.length - 5)
}
function historyListStyle(list: HistoryList) {
  const shown = Math.min(list.rows.length, 5)
  const above = 4 + (list.selected - historyListStart(list)) * 42 + 20
  return { top: '50%', height: `${8 + shown * 42 - 2}px`, marginTop: `${-above}px` }
}

// Reading mode's themes (ReaderAppearance in arx-browser): background and text.
const readerThemes = { Light: ['#fff', '#1d1d1f'], Sepia: ['#f8f1e3', '#4f3e2c'], Gray: ['#4a4a4d', '#ededef'], Dark: ['#1c1c1e', '#e5e5e7'] } as const
const readerTab = computed(() => {
  const tab = selected.value ? props.world.tabs[selected.value] : undefined
  return tab?.page.kind === 'article' ? tab.page : null
})
const ink = computed(() => props.world.look.ink === 'light'
  ? { '--arx-text': 'rgb(240 240 248)', '--arx-secondary': 'rgb(240 240 248 / .72)', '--arx-control': 'rgb(255 255 255 / .09)', '--arx-selected': 'rgb(255 255 255 / .16)', '--arx-hairline': 'rgb(255 255 255 / .1)' }
  : props.world.look.ink === 'dark'
    ? { '--arx-text': 'rgb(39 34 57)', '--arx-secondary': 'rgb(39 34 57 / .78)', '--arx-control': 'rgb(39 34 57 / .055)', '--arx-selected': 'rgb(255 255 255 / .92)', '--arx-hairline': 'rgb(39 34 57 / .08)' }
    : {})

// The volume popover sits beside its tab's row, like the hover card.
const volumeTop = ref(0)
watch(() => props.world.volume, async (id) => {
  if (!id || !root.value) return
  await nextTick()
  const row = root.value.querySelector<HTMLElement>(`[data-arx="tab:${id}"]`)
  if (!row) return
  const frame = root.value.getBoundingClientRect()
  volumeTop.value = (row.getBoundingClientRect().top - frame.top) / (frame.width / 1280) - 30
})
const speaker = speakerIcon

// The hover card sits beside its row.
const cardTop = ref(0)
const box = ([x, y, w, h]: [number, number, number, number]) => ({ left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` })
const captureMenu = [
  { label: 'Copy', icon: 'copy-clipboard', shortcut: '⌘C' },
  { label: 'Save…', icon: 'arrow-down-circle' },
  { label: 'Edit', icon: 'pencil' },
  { label: 'Send to Chat', icon: 'speech-bubble' },
  { label: 'Retake', icon: 'arrow-counter-clockwise' },
]
watch(() => props.world.card, async (card) => {
  if (!card || !root.value) return
  await nextTick()
  const row = root.value.querySelector<HTMLElement>(`[data-arx="${card.kind}:${card.id}"]`)
    ?? root.value.querySelector<HTMLElement>(`[data-arx="fav:${card.id}"]`)
  if (!row) return
  const frame = root.value.getBoundingClientRect()
  const ratio = frame.width / 1280
  const top = (row.getBoundingClientRect().top - frame.top) / ratio
  cardTop.value = Math.min(Math.max(8, top - 20), 800 - 260)
}, { deep: true })
</script>

<template>
  <div ref="root" class="window" :class="{ 'is-zen': world.sidebarHidden, 'is-away': world.windowHidden, 'is-clear': world.look.wallpaper }" :style="ink">
    <div v-if="world.look.wallpaper" class="backdrop" />
    <div class="tint" :style="{ opacity: world.look.opacity }"><i :style="{ backgroundColor: world.look.tint ?? 'transparent' }" /></div>
    <ArxLibrary v-if="world.library" :world="world" :library="world.library" />
    <ArxSidebar v-else :world="world" :class="{ 'is-hidden': world.sidebarHidden && !world.sidebarFloating, 'is-floating': world.sidebarHidden && world.sidebarFloating }" />

    <div class="content" :style="{ left: `${left}px`, right: `${right}px` }">
      <div class="stack" :class="{ 'is-receded': world.peek?.open }">
        <template v-if="world.split">
          <div class="panes" :class="{ 'is-vertical': world.split.vertical }">
            <template v-for="(id, index) in world.split.panes" :key="id">
              <span v-if="index === 1" class="divider" data-arx="split-divider" />
              <div
                class="page-card is-pane"
                :class="{ 'is-focused': world.split.focused === index }"
                :style="{ flexGrow: index === 0 ? world.split.ratio : 1 - world.split.ratio }"
                :data-arx="`pane:${id}`"
              >
                <ArxPaneBody :world="world" :id="id" pane />
              </div>
            </template>
          </div>
        </template>
        <div v-else-if="selected" class="page-card" data-arx="page">
          <div class="zoomed" :style="{ transform: `scale(${world.pageZoom})`, width: `${100 / world.pageZoom}%`, height: `${100 / world.pageZoom}%` }">
            <Transition name="swap" mode="out-in">
              <ArxPaneBody :key="selected" :world="world" :id="selected" />
            </Transition>
          </div>
          <Transition name="fade"><span v-if="world.zoomBadge" class="zoom-badge" data-arx="zoom-badge"><Icon name="raycast:magnifying-glass" />{{ world.zoomBadge }}</span></Transition>
        </div>
        <div v-else-if="world.homepage" class="homepage" data-arx="homepage">
          <i v-for="n in 26" :key="n" class="homepage__mote" :style="{ left: `${(n * 37) % 100}%`, top: `${(n * 61) % 100}%`, animationDelay: `${-n * .7}s`, width: `${2 + n % 3}px`, height: `${2 + n % 3}px` }" />
          <img src="/brand/arx-icon.png" alt="" class="homepage__mark">
          <Transition name="tip" mode="out-in">
            <div :key="world.homepage.tip" class="homepage__tip">
              <small>Tip {{ world.homepage.tip }} of {{ world.homepage.total }}</small>
              <p>{{ world.homepage.text }}</p>
            </div>
          </Transition>
          <span class="homepage__bar"><i :key="world.homepage.turn" /></span>
        </div>
        <Transition name="reader">
          <div v-if="world.reader && readerTab" class="reader" :style="{ background: readerThemes[world.reader.theme][0], color: readerThemes[world.reader.theme][1] }" data-arx="reader">
            <span class="reader__controls">
              <i v-for="(colors, name) in readerThemes" :key="name" class="reader__swatch" :class="{ 'is-on': world.reader.theme === name }" :style="{ background: colors[0] }" :data-arx="`reader:${name}`" />
              <em />
              <Icon name="raycast:text" class="is-small" data-arx="reader:smaller" /><Icon name="raycast:text" data-arx="reader:larger" />
              <Icon name="raycast:arrows-contract" /><Icon name="raycast:arrows-expand" />
              <em />
              <Icon name="raycast:xmark" data-arx="reader:exit" />
            </span>
            <article :style="{ fontSize: `${world.reader.size}px` }">
              <small>Encyclopedia</small>
              <h1>{{ readerTab.title }}</h1>
              <p>{{ readerTab.lead }}</p>
              <p>The first browsers ran on workstations and showed text with simple links. Graphical browsers followed, adding images, styles and, later, scripts that let pages behave like applications.</p>
              <p>Today most browsers share a handful of rendering engines, and set themselves apart by how they organize tabs, protect privacy and fit in with the rest of the computer.</p>
              <p>A browser keeps a history of visited pages, lets the reader bookmark the ones worth keeping, and remembers passwords and form entries when asked to.</p>
            </article>
          </div>
        </Transition>
        <Transition name="fade">
          <span v-if="world.linkStatus" class="link-status" :class="`is-${world.linkStatus.side}`" data-arx="link-status">
            <i v-if="world.linkStatus.verb">{{ world.linkStatus.verb }}</i>{{ world.linkStatus.address }}<b v-if="world.linkStatus.action">{{ world.linkStatus.action }}</b>
          </span>
        </Transition>
        <div v-if="world.picker" class="hide-toast" :class="{ 'is-open': world.picker.list }" data-arx="hide-toast">
          <div v-if="world.picker.list" class="hide-toast__list">
            <small>Hidden on {{ world.picker.site }}</small>
            <TransitionGroup name="fade">
              <span v-for="entry in world.picker.entries" :key="entry.id" class="hide-toast__row">
                <Icon name="raycast:app-window" /><span><b>{{ entry.title }}</b><small>{{ entry.detail }}</small></span><Icon name="raycast:eye" class="hide-toast__eye" :data-arx="`hide:show:${entry.id}`" />
              </span>
            </TransitionGroup>
            <p v-if="!world.picker.entries.length">Nothing is hidden on this site yet.</p>
            <p v-if="world.picker.note">The page reloads when you’re done, to bring back what you showed.</p>
            <small class="hide-toast__keys">↑ ↓ to choose, ⌫ to show again</small>
          </div>
          <div class="hide-toast__bar">
            <Icon name="raycast:bulls-eye" class="hide-toast__scope" />
            <span><b>Click an element to hide it</b><small>{{ world.picker.list ? 'Press Return to close the list' : 'Press Return to see hidden elements' }}</small></span>
            <i data-arx="hide:list"><Icon v-if="world.picker.list" name="raycast:chevron-down" /><Icon v-else name="raycast:chevron-up" /></i>
            <i :class="{ 'is-off': !world.picker.canUndo }" data-arx="hide:undo">Undo <kbd>⌘Z</kbd></i>
            <i data-arx="hide:done">Done <kbd>esc</kbd></i>
          </div>
        </div>
        <div v-if="world.dropZone" class="drop-zone" />
        <template v-if="world.backSwipe">
          <span class="back-arrow" :class="{ 'is-armed': world.backSwipe.progress >= 1 || world.backSwipe.list }" :style="{ transform: `translateX(${world.backSwipe.list ? 70 : world.backSwipe.progress * 70}px)`, opacity: world.backSwipe.list ? 1 : Math.min(1, world.backSwipe.progress * 1.6) }">
            <Icon name="raycast:arrow-left" />
          </span>
          <div v-if="world.backSwipe.list" class="history-list" :style="historyListStyle(world.backSwipe.list)">
            <div class="history-list__column" :style="{ transform: `translateY(${-historyListStart(world.backSwipe.list) * 42}px)` }">
              <span
                v-for="(row, index) in world.backSwipe.list.rows"
                :key="row.title"
                class="history-list__row"
                :class="{ 'is-on': index === world.backSwipe.list.selected }"
              ><Icon name="raycast:globe-01" /><b>{{ row.title }}</b><small>{{ row.host }}</small></span>
            </div>
          </div>
        </template>
      </div>

      <Transition name="peek">
        <div
          v-if="world.peek?.open"
          class="peek"
          :style="{ transformOrigin: `${world.peek.origin[0] - left - 46}px ${world.peek.origin[1] - 40}px` }"
          data-arx="peek"
        >
          <div class="peek__card"><ArxPage :tab="world.tabs[world.peek.tab]!" /></div>
          <div class="peek__controls">
            <span data-arx="peek:close"><Icon name="raycast:xmark" /></span>
            <span data-arx="peek:tab"><Icon name="raycast:arrows-expand" /></span>
            <span data-arx="peek:little"><Icon name="raycast:app-window" /></span>
          </div>
        </div>
      </Transition>
    </div>

    <Transition name="fade"><ArxChatPanel v-if="world.chat" :chat="world.chat" /></Transition>
    <Transition name="fade"><ArxHoverCard v-if="world.card" :world="world" :card="world.card" :top="cardTop" /></Transition>
    <div v-if="world.devtools?.highlight" class="inspect-highlight" :style="box(world.devtools.highlight)"><small>div.card</small></div>
    <template v-if="world.capture">
      <div class="capture-dim" />
      <div class="capture-frame" :class="{ 'is-picking': world.capture.picking, 'is-device': world.capture.device }" :style="{ ...box(world.capture.rect), ...(world.capture.device ? { background: `linear-gradient(135deg, hsl(${world.capture.device.hue * 360} 80% 72%), hsl(${world.capture.device.hue * 360 + 32} 62% 46%))` } : {}) }">
        <span v-if="world.capture.device" class="capture-device" :class="{ 'is-phone': world.capture.device.portrait }"><i /><b>Trailhead</b><em>Plan your next hike</em><u /><u /></span>
      </div>
      <ul v-if="world.capture.menu" class="capture-menu" :style="{ left: `${Math.min(world.capture.rect[0] + world.capture.rect[2] + 10, 1060)}px`, top: `${world.capture.rect[1] + Math.min(90, world.capture.rect[3] / 2) - 60}px` }">
        <li v-for="(item, index) in captureMenu" :key="item.label" :class="{ 'is-on': world.capture.highlighted === index }" :data-arx="`capture:${item.label}`">
          <Icon :name="`raycast:${item.icon}`" />{{ item.label }}<small v-if="item.shortcut">{{ item.shortcut }}</small>
        </li>
      </ul>
    </template>
    <div v-if="world.picker?.outline" class="hide-outline" :style="box(world.picker.outline.rect)"><small>{{ world.picker.outline.label }}</small></div>
    <Transition name="fade">
      <div v-if="world.volume && world.audio[world.volume]" class="volume" :style="{ top: `${volumeTop}px` }" data-arx="volume">
        <b>Volume</b>
        <small>{{ world.tabs[world.volume]!.title }}</small>
        <span class="volume__row" :class="{ 'is-muted': world.audio[world.volume]!.muted }">
          <Icon :name="`raycast:${speaker(world.audio[world.volume]!)}`" data-arx="volume:mute" />
          <span class="volume__slider" data-arx="volume:slider"><i :style="{ width: `${world.audio[world.volume]!.level * 100}%` }" /><b :style="{ left: `${world.audio[world.volume]!.level * 100}%` }" data-arx="volume:handle" /></span>
          <em>{{ Math.round(world.audio[world.volume]!.level * 100) }}%</em>
        </span>
      </div>
    </Transition>
    <ArxSiteMenu v-if="world.siteMenu" :menu="world.siteMenu" />
    <ArxCommandBar v-if="world.commandBar" :bar="world.commandBar" />
    <Transition name="sheet">
      <div v-if="world.saveSheet" class="save-sheet">
        <b>Save</b>
        <span class="save-sheet__line"><small>Save As:</small><em>{{ world.saveSheet.name }}</em></span>
        <span class="save-sheet__line"><small>Where:</small><em class="is-popup"><Icon name="raycast:folder" />Documents</em></span>
        <span class="save-sheet__buttons"><i data-arx="save:cancel">Cancel</i><i class="is-primary">Save</i></span>
      </div>
    </Transition>
    <ArxSettings v-if="world.settings" :settings="world.settings" />
    <section v-if="world.devtools?.dock === 'window'" class="devtools-window" data-arx="devtools-window">
      <header><span class="lights"><i /><i /><i /></span><b>DevTools - localhost:3000/</b></header>
      <ArxDevTools :devtools="world.devtools" />
    </section>
    <ArxOverlays :world="world" :overlays="world.overlays" />
    <ArxMenu v-if="world.menu" :menu="world.menu" />
    <Transition name="fade">
      <div v-if="world.toast" class="toast"><b>{{ world.toast.text }}</b><span v-if="world.toast.action" data-arx="toast-action">{{ world.toast.action }}</span></div>
    </Transition>

    <div v-if="world.drag && !world.tileDrag" class="ghost" :style="{ left: `${world.drag.x - 40}px`, top: `${world.drag.y - 17}px` }">
      <ArxFavicon :icon="world.tabs[world.drag.id]!.icon" /><span>{{ world.tabs[world.drag.id]!.title }}</span>
    </div>
    <div v-if="world.tileDrag && world.drag" class="ghost is-tile" :style="{ left: `${world.drag.x - 30}px`, top: `${world.drag.y - 22}px` }">
      <ArxFavicon :icon="world.tabs[world.drag.id]!.icon" :size="18" />
    </div>
  </div>
</template>

<style scoped>
.window {
  position: relative;
  width: 1280px;
  height: 800px;
  overflow: hidden;
  border-radius: 12px;
  color: var(--arx-text);
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .25), 0 22px 70px rgb(0 0 0 / .3);
  font-family: -apple-system, "SF Pro Text", Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* The window's color: a tint that can thin out to let what's behind the window show,
   blurred, and eases when the tint follows another page. */
.tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--arx-window-top), var(--arx-window-bottom));
  transition: opacity .15s linear;
}

/* A tint of its own fades in over the default one, so nothing behind shows through meanwhile. */
.tint i {
  position: absolute;
  inset: 0;
  transition: background-color .5s;
}

.backdrop {
  position: absolute;
  inset: -40px;
  background:
    radial-gradient(40% 50% at 12% 20%, #ff6b6b, transparent 70%),
    radial-gradient(45% 55% at 85% 15%, #ffd93d, transparent 70%),
    radial-gradient(50% 60% at 20% 90%, #4d96ff, transparent 70%),
    radial-gradient(45% 55% at 80% 85%, #6bcb77, transparent 70%),
    #c77dff;
  filter: blur(28px);
}

.homepage {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 22px;
  overflow: hidden;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-command) 55%, transparent);
  box-shadow: 0 0 0 .5px var(--arx-page-border);
  animation: fade-in .3s;
}

.homepage__mote {
  position: absolute;
  border-radius: 50%;
  background: color-mix(in srgb, var(--arx-text) 16%, transparent);
  animation: mote 9s linear infinite;
}

.homepage__mark {
  width: 96px;
  border-radius: 22px;
  opacity: .5;
}

.homepage__tip {
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 10px;
  width: 340px;
  height: 70px;
  text-align: center;
}

.homepage__tip small {
  color: var(--arx-secondary);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.homepage__tip p {
  margin: 0;
  color: color-mix(in srgb, var(--arx-text) 70%, transparent);
  font-size: 13px;
  line-height: 1.45;
}

.homepage__bar {
  width: 120px;
  height: 2px;
  overflow: hidden;
  border-radius: 1px;
  background: color-mix(in srgb, var(--arx-text) 12%, transparent);
}

.homepage__bar i {
  display: block;
  height: 100%;
  background: color-mix(in srgb, var(--arx-text) 45%, transparent);
  animation: tip-turn 7s linear both;
}

.tip-enter-active,
.tip-leave-active {
  transition: opacity .5s, transform .5s;
}

.tip-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.tip-leave-to {
  opacity: 0;
}

@keyframes tip-turn {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes mote {
  from { transform: translateY(30px); opacity: 0; }
  20%, 80% { opacity: 1; }
  to { transform: translateY(-60px); opacity: 0; }
}

/* Reading mode: the article over the page, with its controls in a capsule. */
.reader {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 8px;
  transition: background .2s, color .2s;
}

.reader article {
  max-width: 680px;
  margin: 0 auto;
  padding: 72px 32px;
  font-family: ui-serif, "New York", Georgia, serif;
  line-height: 1.6;
  transition: font-size .2s;
}

.reader article small {
  font: 600 .72em -apple-system, Inter, system-ui, sans-serif;
  opacity: .6;
}

.reader article h1 {
  margin: .2em 0 .5em;
  color: inherit;
  font: 700 1.9em/1.15 -apple-system, Inter, system-ui, sans-serif;
}

.reader article p {
  margin: 0 0 1em;
}

.reader__controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 12px;
  border-radius: 17px;
  background: rgb(250 250 252 / .9);
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .14), 0 4px 14px rgb(0 0 0 / .12);
  color: #3a3a3c;
}

.reader__controls :deep(svg) {
  width: 14px;
}

.reader__controls :deep(svg.is-small) {
  width: 10px;
}

.reader__controls em {
  width: 1px;
  height: 16px;
  background: rgb(0 0 0 / .14);
}

.reader__swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgb(0 0 0 / .25);
}

.reader__swatch.is-on {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--arx-accent);
}

.reader-enter-active,
.reader-leave-active {
  transition: opacity .25s, transform .25s;
}

.reader-enter-from,
.reader-leave-to {
  opacity: 0;
  transform: scale(.985);
}

/* Where a link goes, at the page's bottom corner. */
.link-status {
  position: absolute;
  bottom: 6px;
  display: flex;
  gap: 4px;
  max-width: 66%;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  background: rgb(246 246 248 / .92);
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .16);
  color: #1d1d1f;
  font-size: 11.5px;
  line-height: 22px;
  white-space: nowrap;
  backdrop-filter: blur(12px);
}

.link-status.is-left { left: 6px; }
.link-status.is-right { right: 6px; }

.link-status i {
  color: #6e6e73;
  font-style: normal;
}

.link-status b {
  font-weight: 600;
}

/* Hide Element: the red outline with the element's name, and the toast. */
.hide-outline {
  position: absolute;
  z-index: 3;
  border: 2px solid rgb(233 66 63);
  border-radius: 6px;
  background: rgb(233 66 63 / .1);
  pointer-events: none;
  transition: left .15s, top .15s, width .15s, height .15s;
}

.hide-outline small {
  position: absolute;
  top: -2px;
  left: -2px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgb(233 66 63);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  translate: 0 -100%;
  white-space: nowrap;
}

.hide-toast {
  position: absolute;
  right: 14px;
  bottom: 14px;
  width: 430px;
  border-radius: 14px;
  background: var(--arx-menu);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 14px 40px rgb(0 0 0 / .24);
  color: var(--arx-text);
  font-size: 13px;
  backdrop-filter: blur(24px);
  animation: fade-in .25s;
}

.hide-toast__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 8px 0 12px;
}

.hide-toast__bar > span:not(.iconify),
.hide-toast__bar > i {
  white-space: nowrap;
}

.hide-toast__bar > span:not(.iconify) {
  display: grid;
  flex: 1;
  line-height: 1.25;
}

.hide-toast small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.hide-toast__scope {
  flex: none;
  width: 18px;
  color: rgb(233 66 63);
}

.hide-toast__bar > i {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: none;
  height: 28px;
  padding: 0 7px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-text) 7%, transparent);
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
}

.hide-toast__bar > i.is-off {
  opacity: .4;
}

.hide-toast__bar > i :deep(svg) {
  width: 12px;
}

.hide-toast kbd {
  color: var(--arx-secondary);
  font: inherit;
  font-size: 11px;
}

.hide-toast__list {
  display: grid;
  gap: 2px;
  padding: 12px 10px 8px 14px;
  border-bottom: 1px solid var(--arx-hairline-strong);
  animation: fade-in .2s;
}

.hide-toast__list > small:first-child {
  font-weight: 600;
}

.hide-toast__list p {
  margin: 4px 0;
  color: var(--arx-secondary);
  font-size: 12px;
}

.hide-toast__row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
}

.hide-toast__row :deep(svg) {
  width: 15px;
  color: var(--arx-secondary);
}

.hide-toast__row > span:not(.iconify) {
  display: grid;
  flex: 1;
  line-height: 1.25;
}

.hide-toast__row b {
  font-weight: 500;
}

.hide-toast__eye {
  box-sizing: content-box;
  padding: 6px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--arx-text) 7%, transparent);
}

/* A tab's volume, beside its row. */
.volume {
  position: absolute;
  left: 290px;
  z-index: 3;
  display: grid;
  gap: 4px;
  width: 232px;
  padding: 12px;
  border-radius: 12px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 12px 34px rgb(0 0 0 / .22);
  color: var(--arx-text);
  font-size: 13px;
}

.volume::before {
  position: absolute;
  top: 40px;
  left: -6px;
  width: 12px;
  height: 12px;
  background: var(--arx-command);
  box-shadow: -1px 1px 0 -.5px var(--arx-hairline-strong);
  content: "";
  rotate: 45deg;
}

.volume small {
  overflow: hidden;
  color: var(--arx-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.volume__row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  transition: opacity .2s;
}

.volume__row.is-muted {
  opacity: .7;
}

.volume__row :deep(svg) {
  flex: none;
  width: 16px;
}

.volume__slider {
  position: relative;
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--arx-text) 14%, transparent);
}

.volume__slider i {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 2px;
  background: var(--arx-accent);
}

.volume__slider b {
  position: absolute;
  top: -6px;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .15), 0 1px 3px rgb(0 0 0 / .3);
}

.volume__row em {
  width: 36px;
  color: var(--arx-secondary);
  font-size: 11px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* Device capture: the shot in its device, on its background. */
.capture-frame.is-device {
  display: grid;
  place-items: center;
  border-radius: 14px;
}

.capture-device {
  display: grid;
  align-content: start;
  gap: 8px;
  width: 78%;
  height: 76%;
  padding: 26px 18px 14px;
  border-radius: 10px;
  background: #f6f8f4;
  box-shadow: 0 14px 34px rgb(0 0 0 / .3);
  color: #1f3d2b;
}

.capture-device.is-phone {
  width: 150px;
  height: 86%;
  padding: 30px 12px 12px;
  border: 5px solid #1c1c1e;
  border-radius: 26px;
}

.capture-device i {
  position: absolute;
  width: 34px;
  height: 7px;
  margin: -17px 0 0;
  border-radius: 4px;
  background: #c7c7cc;
}

.capture-device.is-phone i {
  justify-self: center;
  background: #1c1c1e;
}

.capture-device b {
  color: inherit;
  font-size: 13px;
}

.capture-device em {
  font-size: 11px;
  font-style: normal;
}

.capture-device u {
  height: 18px;
  border-radius: 5px;
  background: #dfe7da;
}

.is-hidden {
  transform: translateX(-290px);
  opacity: 0;
}

.is-floating {
  z-index: 2;
  inset: 8px auto 8px 8px;
  border-radius: 12px;
  background: linear-gradient(180deg, var(--arx-window-top), var(--arx-window-bottom));
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 18px 50px rgb(0 0 0 / .28);
}

.zoomed {
  position: absolute;
  inset: 0 auto auto 0;
  transform-origin: 0 0;
  transition: transform .3s cubic-bezier(.3, .7, .2, 1), width .3s cubic-bezier(.3, .7, .2, 1), height .3s cubic-bezier(.3, .7, .2, 1);
}

.zoom-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 6px 18px rgb(0 0 0 / .14);
  color: var(--arx-text);
  font-size: 13px;
  font-weight: 600;
}

.zoom-badge :deep(svg) {
  width: 13px;
}

.divider {
  flex: none;
  width: 8px;
}

.panes.is-vertical {
  flex-direction: column;
}

.panes.is-vertical .divider {
  width: auto;
  height: 8px;
}

.content {
  position: absolute;
  top: 0;
  bottom: 0;
  transition: left .45s cubic-bezier(.3, .7, .2, 1), right .35s cubic-bezier(.25, .8, .25, 1);
}

.stack {
  position: absolute;
  inset: 8px 0;
  transition: transform .45s cubic-bezier(.2, .8, .2, 1), filter .45s;
}

.stack.is-receded {
  transform: scale(.96);
}

.page-card {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 0 .5px var(--arx-page-border), 0 1px 3px rgb(0 0 0 / .12);
}

.panes {
  position: absolute;
  inset: 0;
  display: flex;
}

.page-card.is-pane {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  transition: flex-grow .35s cubic-bezier(.3, .7, .2, 1);
  display: flex;
  flex-direction: column;
  animation: pane-in .4s cubic-bezier(.2, .8, .2, 1);
}

.page-card.is-focused {
  box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--arx-accent) 75%, transparent), 0 1px 3px rgb(0 0 0 / .12);
}

.pane-header {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 10px;
  background: var(--arx-window-top);
  color: var(--arx-secondary);
  font-size: 13px;
}

.pane-header > span:not(.iconify) {
  flex: 1;
  text-align: center;
}

.pane-header :deep(svg) {
  width: 12px;
}

.pane-page {
  position: relative;
  flex: 1;
}

.back-arrow {
  position: absolute;
  top: 50%;
  left: 4px;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-top: -26px;
  border-radius: 50%;
  background: rgb(255 255 255 / .75);
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .12), 0 8px 24px rgb(0 0 0 / .18);
  color: #1d1d1f;
  backdrop-filter: blur(12px);
  transition: transform .12s linear, background .2s, color .2s;
}

.back-arrow.is-armed {
  background: rgb(10 132 255 / .9);
  color: #fff;
}

.back-arrow :deep(svg) {
  width: 22px;
}

/* The history list (DEV-1276): five rows at most, the selected one level with the arrow. */
.history-list {
  position: absolute;
  left: 134px;
  width: 260px;
  overflow: hidden;
  padding: 4px;
  border-radius: 14px;
  background: rgb(255 255 255 / .82);
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .08), 0 8px 48px rgb(0 0 0 / .25);
  backdrop-filter: blur(20px);
  animation: fade-in .22s;
  transition: margin-top .22s cubic-bezier(.2, .9, .25, 1);
}

.history-list__column {
  display: grid;
  gap: 2px;
  transition: transform .22s cubic-bezier(.2, .9, .25, 1);
}

.history-list__row {
  display: grid;
  grid-template-columns: 26px 1fr;
  grid-template-rows: 16px 13px;
  column-gap: 6px;
  align-content: center;
  height: 40px;
  padding: 0 10.5px 0 6px;
  border-radius: 10px;
  color: rgb(39 34 57 / .85);
  transition: background .22s, box-shadow .22s;
}

.history-list__row :deep(svg) {
  grid-row: span 2;
  width: 14px;
  place-self: center;
  color: rgb(39 34 57 / .52);
}

.history-list__row b {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-list__row small {
  overflow: hidden;
  color: rgb(39 34 57 / .52);
  font-size: 11px;
  line-height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-list__row.is-on {
  background: rgb(0 0 0 / .08);
  box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .06);
}

.drop-zone {
  position: absolute;
  inset: 0 0 0 50%;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-accent) 22%, transparent);
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--arx-accent) 70%, transparent);
  animation: fade-in .2s;
}

.peek {
  position: absolute;
  inset: 40px 46px;
}

.peek__card {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 16px 40px rgb(0 0 0 / .3), 0 0 0 .5px rgb(0 0 0 / .1);
}

.peek__controls {
  position: absolute;
  top: 0;
  right: -42px;
  display: grid;
  gap: 10px;
}

.peek__controls > span {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline), 0 2px 6px rgb(0 0 0 / .12);
  color: var(--arx-text);
}

.peek__controls :deep(svg) {
  width: 14px;
}

.toast {
  position: absolute;
  top: 54px;
  right: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 8px 14px;
  border-radius: 12px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 8px 24px rgb(0 0 0 / .14);
  color: var(--arx-text);
  font-size: 13px;
}

.toast span {
  padding: 3px 8px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--arx-text) 7%, transparent);
  font-size: 12px;
}

.ghost {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 240px;
  height: 34px;
  padding: 0 10px;
  border-radius: 9.5px;
  background: var(--arx-selected);
  box-shadow: 0 8px 22px rgb(0 0 0 / .18);
  color: var(--arx-text);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  pointer-events: none;
  transform: rotate(-1.5deg);
}

/* Another app or the desktop in front: the Arx window steps aside. */
.window.is-away {
  background: transparent;
  box-shadow: none;
}

.window.is-away > :not(.overlays) {
  visibility: hidden;
}

.devtools-window {
  position: absolute;
  top: 120px;
  left: 520px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  width: 560px;
  height: 460px;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .25), 0 24px 70px rgb(0 0 0 / .3);
  animation: fade-in .25s;
}

.devtools-window header {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 32px;
  padding: 0 12px;
  background: #ececee;
  color: #1d1d1f;
  font-size: 12px;
}

.devtools-window .lights {
  display: flex;
  gap: 7px;
}

.devtools-window .lights i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #ff5f57;
}

.devtools-window .lights i:nth-child(2) { background: #febc2e; }
.devtools-window .lights i:nth-child(3) { background: #28c840; }

.devtools-window :deep(.devtools) {
  flex: 1;
  width: auto;
  border: 0;
}

.inspect-highlight {
  position: absolute;
  background: rgb(111 168 220 / .45);
  box-shadow: 0 0 0 1px rgb(26 115 232 / .8);
  pointer-events: none;
}

.inspect-highlight small {
  position: absolute;
  top: -24px;
  left: 0;
  padding: 2px 6px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / .2);
  color: #881280;
  font: 11px ui-monospace, Menlo, monospace;
}

.capture-dim {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / .06);
  animation: fade-in .2s;
}

.capture-frame {
  position: absolute;
  border-radius: 6px;
  box-shadow: 0 0 0 2px var(--arx-accent), 0 0 0 9999px rgb(0 0 0 / .12);
  transition: left .18s, top .18s, width .18s, height .18s;
}

.capture-frame.is-picking {
  background: color-mix(in srgb, var(--arx-accent) 10%, transparent);
  box-shadow: 0 0 0 2px var(--arx-accent);
}

.capture-menu {
  position: absolute;
  width: 186px;
  margin: 0;
  padding: 6px;
  border-radius: 12px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 12px 32px rgb(0 0 0 / .2);
  color: var(--arx-text);
  font-size: 13px;
  list-style: none;
  animation: fade-in .2s;
}

.capture-menu li {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;
  padding: 0 8px;
  border-radius: 7px;
}

.capture-menu li.is-on {
  background: color-mix(in srgb, var(--arx-text) 8%, transparent);
}

.capture-menu :deep(svg) {
  width: 14px;
  color: var(--arx-secondary);
}

.capture-menu small {
  margin-left: auto;
  color: var(--arx-secondary);
}

.save-sheet {
  position: absolute;
  top: 0;
  left: 50%;
  display: grid;
  gap: 12px;
  width: 360px;
  margin-left: -180px;
  padding: 16px 18px;
  border-radius: 0 0 14px 14px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 16px 40px rgb(0 0 0 / .25);
  color: var(--arx-text);
  font-size: 13px;
}

.save-sheet__line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-sheet__line small {
  width: 56px;
  color: var(--arx-secondary);
  text-align: right;
}

.save-sheet__line em {
  flex: 1;
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: 0 0 0 1px var(--arx-hairline-strong);
  font-style: normal;
}

.save-sheet__line .is-popup {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.save-sheet__line :deep(svg) {
  width: 13px;
  color: #3d8bf2;
}

.save-sheet__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.save-sheet__buttons i {
  padding: 4px 14px;
  border-radius: 7px;
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong);
  font-style: normal;
}

.save-sheet__buttons .is-primary {
  background: #0a63e0;
  color: #fff;
}

.ghost.is-tile {
  justify-content: center;
  width: 61px;
  height: 44px;
  padding: 0;
  border-radius: 12.3px;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform .3s cubic-bezier(.2, .9, .3, 1), opacity .25s;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.peek-enter-active {
  transition: transform .42s cubic-bezier(.2, .9, .25, 1.05), opacity .25s;
}

.peek-leave-active {
  transition: transform .3s cubic-bezier(.4, 0, .6, 1), opacity .3s;
}

.peek-enter-from,
.peek-leave-to {
  opacity: 0;
  transform: scale(.4);
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity .18s;
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pane-in {
  from { opacity: 0; transform: translateX(20px); }
}

@keyframes fade-in {
  from { opacity: 0; }
}

.hide-toast__scope { font-size: 18px; }
.hide-toast__eye { flex: none; font-size: 15px; }
.reader__controls :deep(.iconify) { font-size: 14px; }
.reader__controls :deep(.iconify.is-small) { font-size: 10px; }
.volume__row :deep(.iconify) { flex: none; font-size: 16px; }

</style>
