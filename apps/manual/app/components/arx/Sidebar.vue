<script setup lang="ts">
import type { ArxItem, ArxWorld } from '~/utils/arxModel'
import { ACCENTS, selectedIn } from '~/utils/arxModel'

// Arx's sidebar: the toolbar row, the address pill, then one page per space
// (Favorites, the space's pinned items and open tabs), and the space switcher.
const props = defineProps<{ world: ArxWorld }>()

const current = computed(() => props.world.spaces[Math.round(props.world.space)]!)
const selected = computed(() => selectedIn(props.world, current.value))
const address = computed(() => {
  const id = props.world.commandBar ? null : selected.value
  const url = id ? props.world.tabs[id]?.url ?? '' : ''
  return props.world.fullUrl ? `https://${url}` : url.split('/')[0]
})

// A space's accent: its own, else its profile's, else the one chosen for all of Arx.
function accent(space: { id: string, profile: string }) {
  const { global, profiles, spaces } = props.world.look.accent
  const name = spaces[space.id] ?? profiles[space.profile] ?? global
  return name ? { '--arx-folder': ACCENTS[name], '--arx-accent': ACCENTS[name] } : {}
}

interface Row { item: ArxItem, depth: number }
function rows(items: ArxItem[], depth = 0): Row[] {
  return items.flatMap(item => item.type === 'folder' && item.open
    ? [{ item, depth }, ...rows(item.children, depth + 1)]
    : [{ item, depth }])
}
</script>

<template>
  <aside class="sidebar">
    <div class="toolbar">
      <span class="lights"><i /><i /><i /></span>
      <span class="tool"><Icon name="raycast:app-window-sidebar-left" /></span>
      <span class="badge"><Icon name="raycast:person-circle" />{{ current.profile }}</span>
      <span class="tool is-dim"><Icon name="raycast:arrow-left" /></span>
      <span class="tool is-dim"><Icon name="raycast:arrow-right" /></span>
      <span class="tool"><Icon name="raycast:arrow-clockwise" /></span>
    </div>

    <div class="address" data-arx="address">
      <span class="address__text"><span>{{ address || 'Search or Enter URL…' }}</span><small v-if="world.addressNote && address" data-arx="address-note">{{ world.addressNote }}</small></span>
      <span v-if="address" class="address__actions">
        <Icon v-if="world.reader" name="raycast:blank-document" class="is-reading" data-arx="reader-button" />
        <Icon v-else-if="world.readerButton" name="raycast:blank-document" data-arx="reader-button" />
        <Icon name="raycast:link" />
        <Icon name="raycast:switch" data-arx="site-info" />
      </span>
    </div>

    <div class="pager">
      <div class="pages" :style="{ transform: `translateX(${-world.space * 280}px)` }">
        <section v-for="space in world.spaces" :key="space.id" class="page" :style="accent(space)" :data-arx="`page:${space.id}`">
          <div v-if="space.favorites.length" class="favorites" :class="{ 'is-pair': space.favorites.length === 2, 'is-one': space.favorites.length === 1 }">
            <span
              v-for="id in space.favorites"
              :key="id"
              class="tile"
              :class="{ 'is-selected': selectedIn(world, space) === id, 'is-lifted': world.tileDrag && space.favorites[world.tileDrag.index] === id }"
              :data-arx="`fav:${id}`"
            >
              <ArxFavicon :icon="world.tabs[id]!.icon" :size="18" />
            </span>
          </div>
          <div v-else class="favorites-empty" :class="{ 'is-targeted': world.drag && space.id === current.id }" data-arx="favorites-empty">
            <strong>Drag to add Favorites</strong>
            <span>Favorites keep your most used sites and apps close</span>
          </div>

          <div class="space-header" :data-arx="`space-header:${space.id}`">
            <Icon :name="`raycast:${space.icon}`" /><span>{{ space.name }}</span>
            <Icon class="space-header__more" name="raycast:ellipsis" />
          </div>

          <TransitionGroup name="tabs" tag="div" class="rows">
          <template v-for="{ item, depth } in rows(space.pinned)" :key="item.id">
            <div
              v-if="item.type === 'folder'"
              class="row is-folder"
              :class="{ 'is-hovered': world.hovered === `folder:${item.id}` }"
              :style="{ paddingLeft: `${10 + depth * 17}px` }"
              :data-arx="`folder:${item.id}`"
            >
              <svg class="folder-icon" viewBox="0 0 20 16" aria-hidden="true"><path d="M1.5 3.2c0-1 .8-1.7 1.7-1.7h4.1c.5 0 1 .2 1.3.6l1 1.1h7.2c.9 0 1.7.8 1.7 1.7v8.4c0 1-.8 1.7-1.7 1.7H3.2c-1 0-1.7-.8-1.7-1.7z" /></svg>
              <span v-if="world.renaming?.id === item.id" class="row__rename" :data-arx="`rename:${item.id}`">{{ world.renaming.text }}<i /></span>
              <span v-else class="row__title">{{ item.name }}</span>
            </div>
            <div
              v-else
              class="row"
              :class="{ 'is-selected': selectedIn(world, space) === item.id, 'is-hovered': world.hovered === `tab:${item.id}`, 'is-dragged': world.drag?.id === item.id }"
              :style="{ paddingLeft: `${10 + depth * 17}px` }"
              :data-arx="`tab:${item.id}`"
            >
              <ArxFavicon :icon="world.tabs[item.id]!.icon" />
              <span class="row__title">{{ world.tabs[item.id]!.title }}</span>
              <ArxSpeaker :world="world" :id="item.id" />
            </div>
          </template>
          </TransitionGroup>

          <div class="divider" :data-arx="`clear:${space.id}`">
            <i /><span v-if="space.open.length"><Icon name="raycast:arrow-down" />Clear</span>
          </div>
          <div class="row is-new"><Icon name="raycast:plus" /><span class="row__title">New Tab</span></div>

          <TransitionGroup name="tabs" tag="div" class="rows">
          <template v-for="id in space.open" :key="id">
            <div
              v-if="world.split && world.split.panes.includes(id) && world.split.panes[0] === id && space.id === current.id"
              class="row is-split is-selected"
              :data-arx="`tab:${id}`"
            >
              <span v-for="pane in world.split.panes" :key="pane" class="split-half" :data-arx="`split-half:${pane}`">
                <ArxFavicon :icon="world.tabs[pane]!.icon" />
                <span class="row__title">{{ world.tabs[pane]!.title }}</span>
              </span>
            </div>
            <div
              v-else-if="!(world.split && world.split.panes[1] === id && space.id === current.id)"
              class="row"
              :class="{
                'is-selected': selectedIn(world, space) === id,
                'is-hovered': world.hovered === `tab:${id}`,
                'is-local': world.tabs[id]!.local,
                'is-dragged': world.drag?.id === id,
              }"
              :data-arx="`tab:${id}`"
            >
              <span class="row__icon"><ArxFavicon :icon="world.tabs[id]!.icon" /><i v-if="world.tabs[id]!.webkit"><Icon name="raycast:compass" /></i></span>
              <span class="row__text">
                <span class="row__title">{{ world.tabs[id]!.title }}</span>
                <small v-if="world.tabs[id]!.local">{{ world.tabs[id]!.url }}</small>
              </span>
              <ArxSpeaker :world="world" :id="id" />
              <Icon v-if="world.hovered === `tab:${id}`" class="row__close" name="raycast:xmark" :data-arx="`close:${id}`" />
            </div>
          </template>
          </TransitionGroup>
        </section>
      </div>
    </div>

    <div class="switcher">
      <Icon class="switcher__library" name="raycast:book" data-arx="library" />
      <span class="switcher__spaces">
        <span
          v-for="(space, index) in world.spaces"
          :key="space.id"
          class="switcher__space"
          :class="{ 'is-on': Math.round(world.space) === index }"
          :data-arx="`space:${space.id}`"
        ><Icon :name="`raycast:${space.icon}`" /></span>
      </span>
      <Icon class="switcher__new" name="raycast:plus" />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: absolute;
  inset: 0 auto 0 0;
  display: flex;
  flex-direction: column;
  width: 280px;
  color: var(--arx-text);
  transition: transform .45s cubic-bezier(.3, .7, .2, 1), opacity .3s;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 40px;
  padding: 0 8px 0 12px;
}

.lights {
  display: flex;
  gap: 8px;
  width: 64px;
}

.lights i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f57;
  box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .12);
}

.lights i:nth-child(2) { background: #febc2e; }
.lights i:nth-child(3) { background: #28c840; }

.tool {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  font-size: 16px;
  color: var(--arx-secondary);
}

.tool.is-dim {
  opacity: .45;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 auto 0 2px;
  max-width: 72px;
  overflow: hidden;
  color: var(--arx-secondary);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.badge :deep(svg) {
  flex: none;
  width: 13px;
}

.address {
  display: flex;
  align-items: center;
  height: 34px;
  margin: 0 8px;
  padding: 0 10px;
  border-radius: 9.5px;
  background: var(--arx-control);
  box-shadow: inset 0 0 0 .5px var(--arx-hairline);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}

.address__text {
  display: grid;
  min-width: 0;
  line-height: 1.15;
}

.address__text small {
  color: color-mix(in srgb, var(--arx-text) 55%, transparent);
  font-size: 10px;
  font-weight: 500;
}

.address__actions .is-reading {
  color: var(--arx-accent);
}

.row__icon {
  position: relative;
  display: inline-grid;
  flex: none;
}

/* Shown in WebKit: a small compass on the tab's icon. */
.row__icon i {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: grid;
  place-items: center;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: #1e90ff;
  color: #fff;
}

.row__icon i :deep(svg) {
  width: 8px;
  height: 8px;
}

.folder-icon {
  transition: fill .3s;
}

.address__actions {
  display: inline-flex;
  gap: 10px;
  margin-left: auto;
  padding-left: 8px;
  color: var(--arx-secondary);
}

.address__actions :deep(svg) {
  width: 13px;
}

.row__rename {
  display: inline-flex;
  align-items: center;
  flex: 1;
  height: 24px;
  margin-left: -4px;
  padding: 0 6px;
  border-radius: 6px;
  background: var(--arx-selected);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--arx-accent) 55%, transparent);
  font-weight: 500;
}

.row__rename i {
  width: 1.5px;
  height: 15px;
  margin-left: 1px;
  background: var(--arx-accent);
  animation: blink 1s steps(1) infinite;
}

.row__close {
  flex: none;
  width: 12px;
  color: var(--arx-secondary);
}

.tile.is-lifted {
  opacity: .25;
}

@keyframes blink {
  50% { opacity: 0; }
}

.pager {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.pages {
  display: flex;
  height: 100%;
  transition: transform .5s cubic-bezier(.25, .8, .25, 1);
}

.page {
  flex: none;
  width: 280px;
  padding: 8px 8px 0;
}

.favorites {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.favorites.is-pair { grid-template-columns: repeat(2, 1fr); }
.favorites.is-one { grid-template-columns: 1fr; }

.tile {
  display: grid;
  place-items: center;
  height: 44px;
  border-radius: 12.3px;
  background: var(--arx-control);
  box-shadow: inset 0 0 0 .5px var(--arx-hairline);
  transition: background .2s;
}

.tile.is-selected {
  background: var(--arx-selected);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--arx-text) 18%, transparent), 0 1px 2px rgb(0 0 0 / .1);
}

.favorites-empty {
  display: grid;
  place-items: center;
  gap: 2px;
  height: 92px;
  margin-bottom: 8px;
  padding: 10px;
  border: 1px dashed color-mix(in srgb, var(--arx-secondary) 45%, transparent);
  border-radius: 12px;
  color: var(--arx-secondary);
  font-size: 12px;
  text-align: center;
}

/* A drag over the card only adds the accent highlight; its size stays. */
.favorites-empty.is-targeted {
  border: 1px solid var(--arx-accent);
  box-shadow: inset 0 0 0 .5px var(--arx-accent);
  background: color-mix(in srgb, var(--arx-accent) 8%, transparent);
}

.favorites-empty strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--arx-text);
}

.space-header {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 4px 0 6px;
  color: var(--arx-secondary);
  font-size: 12px;
  font-weight: 500;
}

.space-header :deep(svg) {
  width: 14px;
}

.space-header__more {
  margin-left: auto;
  opacity: .7;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  margin-bottom: 2px;
  padding: 0 10px;
  border-radius: 9.5px;
  font-size: 13px;
  transition: background .18s, box-shadow .18s, opacity .2s;
}

/* Tabs move into place (a third of a second): a new row grows in while the rows below
   make room, and a closed one folds away. */
.tabs-enter-active,
.tabs-leave-active {
  overflow: hidden;
  transition: height .33s cubic-bezier(.3, .7, .2, 1), margin-bottom .33s cubic-bezier(.3, .7, .2, 1), opacity .25s;
}

.tabs-enter-from,
.tabs-leave-to {
  height: 0;
  margin-bottom: 0;
  opacity: 0;
}

.row.is-hovered {
  background: var(--arx-hover);
}

.row.is-selected {
  background: var(--arx-selected);
  box-shadow: 0 1px 2px rgb(0 0 0 / .1);
}

.row.is-dragged {
  opacity: .35;
}

.row.is-folder {
  font-weight: 500;
}

.row.is-new {
  color: var(--arx-secondary);
  opacity: .75;
}

.row.is-local {
  height: 38px;
  outline: 2.5px dashed #f2c500;
  outline-offset: -2px;
  background-image: repeating-linear-gradient(-45deg, transparent 0 6px, transparent 6px 12px);
  box-shadow: inset 0 0 0 2.5px #1c1c1c;
}

.row.is-split {
  gap: 4px;
  padding: 0 3px;
}

.split-half {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 6px;
  min-width: 0;
  height: 28px;
  padding: 0 7px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--arx-text) 5%, transparent);
}

.row__text {
  display: grid;
  flex: 1;
  min-width: 0;
}

.row > .row__title {
  flex: 1;
}

.row__text small {
  color: var(--arx-secondary);
  font-size: 10.5px;
  line-height: 1.1;
}

.row__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-icon {
  flex: none;
  width: 18px;
  height: 15px;
  fill: var(--arx-folder);
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 16px;
  margin: 8px 0;
  padding: 0 6px;
  color: var(--arx-secondary);
  font-size: 11px;
}

.divider i {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--arx-text) 12%, transparent);
}

.divider span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.switcher {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 8px 4px 14px;
  color: var(--arx-secondary);
}

.switcher :deep(svg) {
  width: 16px;
  height: 16px;
}

.switcher__spaces {
  display: flex;
  flex: 1;
  justify-content: center;
  gap: 4px;
}

.switcher__space {
  display: grid;
  place-items: center;
  width: 38px;
  height: 26px;
  opacity: .45;
  transition: opacity .25s;
}

.switcher__space.is-on {
  opacity: 1;
}

.row__icon i :deep(.iconify) { font-size: 8px; }

</style>
