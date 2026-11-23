<script setup lang="ts">
import type { ArxWorld } from '~/utils/arxModel'

// The Library in place of the sidebar: a 112-point rail of sections, and the open
// section's list beside it. Only the Tab Archive is drawn in full.
const props = defineProps<{ world: ArxWorld, library: NonNullable<ArxWorld['library']> }>()

const sections = [
  { id: 'media', label: 'Media', icon: 'play' },
  { id: 'downloads', label: 'Downloads', icon: 'arrow-down-circle' },
  { id: 'history', label: 'History', icon: 'rotate-anti-clockwise' },
  { id: 'spaces', label: 'Spaces', icon: 'app-window-grid-2x2' },
  { id: 'archive', label: 'Tab Archive', icon: 'box' },
]
const items = computed(() => props.library.archive.filter((item) => {
  const query = props.library.query.toLowerCase()
  const tab = props.world.tabs[item.id]!
  return !query || tab.title.toLowerCase().includes(query) || tab.url.includes(query)
}))
// History by day, newest first; every typed word must be in the title or the address.
const days = computed(() => {
  const words = props.library.query.toLowerCase().split(/\s+/).filter(Boolean)
  const shown = (props.library.history ?? []).filter(entry => words.every(word => `${entry.title} ${entry.address}`.toLowerCase().includes(word)))
  return [...new Set(shown.map(entry => entry.day))].map(day => ({ day, entries: shown.filter(entry => entry.day === day) }))
})
</script>

<template>
  <aside class="library">
    <div class="library__top"><span class="lights"><i /><i /><i /></span></div>
    <nav class="library__rail">
      <span
        v-for="section in sections"
        :key="section.id"
        class="library__tile"
        :class="{ 'is-on': library.section === section.id }"
        :data-arx="`library:${section.id}`"
      >
        <Icon :name="`raycast:${section.icon}`" /><small>{{ section.label }}</small>
      </span>
      <span class="library__exit" data-arx="library:exit"><Icon name="raycast:arrow-left" /></span>
    </nav>
    <section v-if="library.section === 'archive'" class="library__list">
      <div class="library__field" data-arx="library:search">
        <Icon name="raycast:magnifying-glass" />
        <span v-if="library.query">{{ library.query }}<i class="library__caret" /></span>
        <span v-else class="library__placeholder">Search Tab Archive…</span>
      </div>
      <p class="library__group">Today</p>
      <TransitionGroup name="row" tag="div" class="library__rows">
        <div
          v-for="item in items"
          :key="item.id"
          class="library__row"
          :class="{ 'is-hovered': world.hovered === `archived:${item.id}`, 'is-leaving': library.restoring === item.id }"
          :data-arx="`archived:${item.id}`"
        >
          <ArxFavicon :icon="world.tabs[item.id]!.icon" :size="20" />
          <span class="library__titles"><b>{{ world.tabs[item.id]!.title }}</b><small>{{ world.tabs[item.id]!.url.split('/')[0] }} · {{ item.when }}</small></span>
          <span v-if="world.hovered === `archived:${item.id}`" class="library__restore" :data-arx="`restore:${item.id}`">Restore</span>
        </div>
      </TransitionGroup>
      <p v-if="!items.length" class="library__empty">No archived tabs match.</p>
    </section>
    <section v-else-if="library.section === 'history'" class="library__list">
      <div class="library__field" data-arx="library:search">
        <Icon name="raycast:magnifying-glass" />
        <span v-if="library.query">{{ library.query }}<i class="library__caret" /></span>
        <span v-else class="library__placeholder">Search History</span>
      </div>
      <div class="library__clip">
      <div class="library__scroll" :style="{ transform: `translateY(${-(library.scroll ?? 0)}px)` }">
        <template v-for="group in days" :key="group.day">
          <p class="library__group">{{ group.day }}</p>
          <TransitionGroup name="row" tag="div" class="library__rows">
            <div v-for="entry in group.entries" :key="entry.id" class="library__row is-compact" :class="{ 'is-hovered': world.hovered === `history:${entry.id}` }" :data-arx="`history:${entry.id}`">
              <ArxFavicon :icon="entry.icon" :size="18" />
              <span class="library__titles"><b>{{ entry.title }}</b><small>{{ entry.time }} · {{ entry.address }}</small></span>
            </div>
          </TransitionGroup>
        </template>
        <p v-if="!days.length" class="library__empty">No matching pages</p>
      </div>
      </div>
    </section>
    <section v-else-if="library.section === 'media'" class="library__list">
      <p class="library__group">Playing</p>
      <div v-for="id in library.media ?? []" :key="id" class="library__row" :class="{ 'is-hovered': world.hovered === `media:${id}` }" :data-arx="`media:${id}`">
        <span class="library__poster"><Icon name="raycast:play-filled" /></span>
        <span class="library__titles"><b>{{ world.tabs[id]!.title }}</b><small>{{ world.tabs[id]!.url.split('/')[0] }} · Picture in Picture</small></span>
      </div>
    </section>
    <section v-else class="library__list is-empty"><p class="library__empty">Choose a section.</p></section>
  </aside>
</template>

<style scoped>
.library {
  position: absolute;
  inset: 0 auto 0 0;
  display: grid;
  grid-template-columns: 112px 1fr;
  grid-template-rows: 40px 1fr;
  width: 410px;
  color: var(--arx-text);
  animation: library-in .35s cubic-bezier(.2, .8, .2, 1);
}

.library__top {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  padding-left: 12px;
}

.lights {
  display: flex;
  gap: 8px;
}

.lights i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f57;
}

.lights i:nth-child(2) { background: #febc2e; }
.lights i:nth-child(3) { background: #28c840; }

.library__rail {
  position: relative;
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 20px;
  padding-top: 70px;
  box-shadow: 1px 0 0 color-mix(in srgb, var(--arx-text) 9%, transparent);
}

.library__tile {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  width: 96px;
  height: 80px;
  border-radius: 14px;
  color: color-mix(in srgb, var(--arx-text) 72%, transparent);
  transition: background .2s;
}

.library__tile.is-on {
  background: color-mix(in srgb, var(--arx-text) 9%, transparent);
  color: var(--arx-text);
}

.library__tile :deep(svg) {
  width: 24px;
  height: 24px;
}

.library__tile small {
  font-size: 12px;
  font-weight: 500;
}

.library__exit {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  color: var(--arx-secondary);
}

.library__exit :deep(svg) {
  width: 16px;
}

.library__list {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  overflow: hidden;
}

.library__field {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 36px;
  padding: 0 13px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--arx-text) 5%, transparent);
  font-size: 14px;
}

.library__field :deep(svg) {
  width: 16px;
  color: var(--arx-secondary);
}

.library__placeholder {
  color: var(--arx-secondary);
  opacity: .8;
}

.library__caret {
  display: inline-block;
  width: 1.5px;
  height: 16px;
  margin-left: 1px;
  vertical-align: -3px;
  background: var(--arx-accent);
}

.library__group {
  margin: 16px 4px 6px;
  color: var(--arx-secondary);
  font-size: 12px;
  font-weight: 600;
}

.library__rows {
  display: grid;
  gap: 2px;
}

.library__row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 10px;
  border-radius: 10px;
  transition: background .2s, opacity .3s, transform .3s;
}

.library__row.is-hovered {
  background: color-mix(in srgb, var(--arx-text) 6%, transparent);
}

.library__row.is-leaving {
  opacity: 0;
  transform: translateX(-20px);
}

.library__titles {
  display: grid;
  flex: 1;
  min-width: 0;
  line-height: 1.3;
}

.library__titles b {
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: .87;
}

.library__titles small {
  overflow: hidden;
  color: var(--arx-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.library__poster {
  display: grid;
  flex: none;
  place-items: center;
  width: 54px;
  height: 34px;
  border-radius: 7px;
  background: radial-gradient(circle at 30% 30%, #f05138, #7a1f12 70%);
  color: #fff;
}

.library__poster :deep(svg) {
  width: 14px;
}

.library__restore {
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--arx-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.library__empty {
  margin: 30px 0;
  color: var(--arx-secondary);
  font-size: 13px;
  text-align: center;
}

.row-leave-active {
  transition: opacity .25s, transform .25s;
}

.row-leave-to,
.row-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

.row-enter-active {
  transition: opacity .25s, transform .25s;
}

@keyframes library-in {
  from { opacity: 0; transform: translateX(-16px); }
}

.library__clip {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.library__scroll {
  transition: transform .6s cubic-bezier(.3, .7, .2, 1);
}

.library__row.is-compact {
  height: 46px;
}

.row-leave-active {
  transition: opacity .25s;
}

.row-leave-to {
  opacity: 0;
}

</style>
