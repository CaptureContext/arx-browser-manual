<script setup lang="ts">
import type { ArxItem, ArxWorld } from '~/utils/arxModel'

// The preview beside a sidebar row: a tab's card with a picture of its page, or a
// folder's list with a search field.
const props = defineProps<{ world: ArxWorld, card: NonNullable<ArxWorld['card']>, top: number }>()

function findFolder(items: ArxItem[]): Extract<ArxItem, { type: 'folder' }> | undefined {
  for (const item of items) {
    if (item.type !== 'folder') continue
    if (item.id === props.card.id) return item
    const found = findFolder(item.children)
    if (found) return found
  }
}
const folder = computed(() => props.card.kind === 'folder'
  ? props.world.spaces.map(space => findFolder(space.pinned)).find(Boolean)
  : undefined)
const shown = computed(() => (folder.value?.children ?? []).filter((child) => {
  const query = props.card.query?.toLowerCase()
  if (!query) return true
  return child.type === 'tab' ? props.world.tabs[child.id]!.title.toLowerCase().includes(query) : child.name.toLowerCase().includes(query)
}))
const tab = computed(() => props.card.kind === 'tab' ? props.world.tabs[props.card.id] : undefined)
</script>

<template>
  <div class="card" :style="{ top: `${top}px` }">
    <template v-if="tab?.preview">
      <b class="card__folder"><ArxFavicon :icon="tab.icon" :size="14" /> {{ tab.title }}<small>{{ tab.preview.kind === 'mail' ? `${tab.preview.items.length} unread` : 'Recent' }}</small></b>
      <span v-for="item in tab.preview.items" :key="item.title" class="card__mail">
        <span><b>{{ tab.preview.kind === 'mail' ? item.detail : item.title }}</b><small>{{ tab.preview.kind === 'mail' ? item.title : item.detail }}</small></span>
        <em v-if="item.time">{{ item.time }}</em>
      </span>
    </template>
    <template v-else-if="tab?.unloaded">
      <div v-if="tab.unloaded.picture === 'saved'" class="card__shot"><div class="card__page"><ArxPage :tab="tab" /></div></div>
      <div v-else-if="tab.unloaded.picture === 'site'" class="card__shot is-site"><ArxFavicon :icon="tab.icon" :size="34" /><b>{{ tab.title }}</b></div>
      <div class="card__info is-unloaded">
        <b>{{ tab.title }}</b>
        <span><ArxFavicon :icon="tab.icon" :size="12" />{{ tab.url.split('/')[0] }} · {{ tab.unloaded.when }}</span>
        <small>{{ tab.unloaded.description }}</small>
      </div>
    </template>
    <template v-else-if="tab">
      <div class="card__shot"><div class="card__page"><ArxPage :tab="tab" /></div></div>
      <div class="card__info">
        <b>{{ tab.title }}</b>
        <span><ArxFavicon :icon="tab.icon" :size="12" />{{ tab.url.split('/')[0] }}<em>2 minutes ago</em></span>
      </div>
    </template>
    <template v-else-if="folder">
      <b class="card__folder">{{ folder.name }}</b>
      <span class="card__search" data-arx="card-search"><Icon name="raycast:magnifying-glass" /><span v-if="card.query">{{ card.query }}<i class="card__caret" /></span><template v-else>Search this folder</template></span>
      <span v-for="child in shown" :key="child.type === 'tab' ? child.id : child.id" class="card__item">
        <template v-if="child.type === 'tab'"><ArxFavicon :icon="world.tabs[child.id]!.icon" :size="14" />{{ world.tabs[child.id]!.title }}</template>
        <template v-else>{{ child.name }}</template>
      </span>
    </template>
  </div>
</template>

<style scoped>
.card {
  position: absolute;
  left: 292px;
  width: 260px;
  padding: 8px;
  border-radius: 14px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 14px 36px rgb(0 0 0 / .2);
  color: var(--arx-text);
  font-size: 12px;
  animation: card-in .22s cubic-bezier(.2, .9, .3, 1.15);
  transform-origin: left center;
}

.card__shot {
  position: relative;
  height: 150px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: inset 0 0 0 .5px var(--arx-hairline);
}

.card__page {
  position: absolute;
  inset: 0 auto auto 0;
  width: 1000px;
  height: 610px;
  transform: scale(.244);
  transform-origin: 0 0;
}

.card__info {
  display: grid;
  gap: 2px;
  padding: 8px 4px 2px;
}

.card__info b {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__info span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--arx-secondary);
}

.card__info em {
  margin-left: auto;
  font-style: normal;
}

.card__folder {
  display: block;
  padding: 4px 6px 8px;
  font-size: 13px;
}

.card__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  margin-bottom: 6px;
  padding: 0 10px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--arx-text) 6%, transparent);
  color: var(--arx-secondary);
  font-size: 13px;
}

.card__search :deep(svg) {
  width: 14px;
}

.card__search > span {
  color: var(--arx-text);
}

.card__caret {
  display: inline-block;
  width: 1.5px;
  height: 14px;
  margin-left: 1px;
  vertical-align: -2px;
  background: var(--arx-accent);
}

.card__folder small {
  float: right;
  color: var(--arx-secondary);
  font-weight: 400;
}

.card__mail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-top: 1px solid var(--arx-hairline);
}

.card__mail > span {
  display: grid;
  flex: 1;
  min-width: 0;
  line-height: 1.3;
}

.card__mail b {
  overflow: hidden;
  font-size: 12.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__mail small {
  overflow: hidden;
  color: var(--arx-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__mail em {
  color: var(--arx-secondary);
  font-size: 11px;
  font-style: normal;
}

.card__item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 8px;
  font-size: 13px;
}

@keyframes card-in {
  from { opacity: 0; transform: scale(.94); }
}

/* The site's own preview image, as it publishes for links to it. */
.card__shot.is-site {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #0d1117, #1f2937);
  color: #fff;
  font-size: 13px;
}

.card__shot.is-site b {
  color: #fff;
}

.card__info.is-unloaded small {
  display: block;
  margin-top: 4px;
  color: var(--arx-secondary);
  font-size: 11px;
  line-height: 1.35;
}

</style>
