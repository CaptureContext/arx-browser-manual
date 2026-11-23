<script setup lang="ts">
import type { ArxWorld } from '~/utils/arxModel'

// The command bar (⌘T, ⌘L, ⌘K): 573 points wide, 22% down the window, with a
// 60-point field and 48-point rows; the highlighted row takes the accent.
const props = defineProps<{ bar: NonNullable<ArxWorld['commandBar']> }>()
const actions = computed(() => {
  const query = props.bar.actions?.query.toLowerCase() ?? ''
  return (props.bar.actions?.items ?? []).filter(item => item.title.toLowerCase().includes(query))
})
</script>

<template>
  <div class="bar" data-arx="command-bar">
    <div class="bar__field">
      <Icon name="raycast:magnifying-glass" />
      <span v-if="bar.chip" class="bar__chip"><ArxFavicon :icon="bar.chip.icon" :size="14" />{{ bar.chip.label }}</span>
      <span class="bar__text">
        <template v-if="!bar.query"><i class="bar__caret" /><span class="bar__placeholder">{{ bar.chip ? `Search ${bar.chip.label}…` : 'Search or Enter URL…' }}</span></template>
        <template v-else><span>{{ bar.query }}</span><mark v-if="bar.completion">{{ bar.completion }}</mark><i v-if="!bar.completion" class="bar__caret" /></template>
      </span>
      <span v-if="bar.agent" class="bar__agent">Ask an agent <kbd>⇥</kbd></span>
    </div>
    <div v-if="bar.rows.length" class="bar__rows">
      <div v-for="(row, index) in bar.rows" :key="index" class="bar__row" :class="{ 'is-on': index === bar.highlighted }">
        <ArxFavicon :icon="row.icon" :size="18" />
        <span class="bar__titles"><b>{{ row.title }}</b><small v-if="row.subtitle">{{ row.subtitle }}</small></span>
        <span v-if="row.action" class="bar__action">{{ row.action }} <Icon name="raycast:arrow-right" /></span>
      </div>
    </div>
    <template v-if="bar.actions && bar.rows.length">
      <Transition name="actions" mode="out-in">
        <div v-if="bar.actions.open" class="bar__panel" data-arx="actions-panel">
          <div class="bar__list">
            <span v-for="(item, index) in actions" :key="item.title" class="bar__item" :class="{ 'is-on': index === bar.actions.highlighted, 'is-danger': item.danger }" :data-arx="`action:${item.title}`">
              <Icon :name="`raycast:${item.icon}`" /><b>{{ item.title }}</b><kbd>{{ item.shortcut }}</kbd>
            </span>
            <span v-if="!actions.length" class="bar__item is-empty">No matching actions</span>
          </div>
          <span class="bar__search"><Icon name="raycast:magnifying-glass" /><template v-if="bar.actions.query">{{ bar.actions.query }}<i class="bar__caret" /></template><em v-else>Search actions…</em></span>
        </div>
        <span v-else class="bar__pill" data-arx="actions">Actions <kbd>⌘</kbd><kbd>K</kbd></span>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.bar {
  position: absolute;
  top: 176px;
  left: 50%;
  width: 573px;
  overflow: hidden;
  translate: -50% 0;
  border-radius: 16px;
  background: var(--arx-command);
  box-shadow: 0 0 0 1px var(--arx-hairline), 0 24px 60px rgb(0 0 0 / .22), 0 4px 12px rgb(0 0 0 / .08);
  color: var(--arx-text);
  animation: bar-in .22s cubic-bezier(.2, .9, .3, 1.2);
}

.bar__field {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 60px;
  padding: 0 18px;
  font-size: 20px;
}

.bar__field > :deep(svg) {
  flex: none;
  width: 20px;
  color: var(--arx-secondary);
}

.bar__text {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  white-space: pre;
}

.bar__chip {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-accent) 14%, transparent);
  color: var(--arx-accent);
  font-size: 15px;
  font-weight: 600;
  animation: bar-in .2s ease-out;
}

.bar__placeholder {
  color: var(--arx-secondary);
  opacity: .7;
}

.bar__text mark {
  background: color-mix(in srgb, var(--arx-accent) 28%, transparent);
  color: inherit;
}

.bar__caret {
  width: 2px;
  height: 24px;
  margin-left: 1px;
  background: var(--arx-accent);
  animation: blink 1s steps(1) infinite;
}

.bar__agent {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--arx-secondary);
  font-size: 14px;
}

.bar__agent kbd {
  padding: 1px 5px;
  border: 1px solid var(--arx-hairline-strong);
  border-radius: 5px;
  font: inherit;
  font-size: 11px;
}

.bar__rows {
  display: grid;
  gap: 2px;
  padding: 8px;
  border-top: 1px solid var(--arx-hairline);
}

.bar__row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 14px;
}

.bar__row.is-on {
  background: var(--arx-accent);
  color: #fff;
}

.bar__titles {
  display: grid;
  flex: 1;
  min-width: 0;
  line-height: 1.25;
}

.bar__titles b {
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar__titles small {
  overflow: hidden;
  color: var(--arx-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-on .bar__titles small,
.is-on .bar__action {
  color: rgb(255 255 255 / .8);
}

.bar__action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--arx-secondary);
  font-size: 13px;
}

.bar__action :deep(svg) {
  width: 22px;
  padding: 4px;
  border-radius: 6px;
  background: color-mix(in srgb, currentColor 18%, transparent);
}

@keyframes bar-in {
  from { opacity: 0; transform: scale(.96); }
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Actions ⌘K floats over the results in the bottom-right corner, and turns into the
   actions' search field with the list above it. */
.bar__pill {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 10px 0 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--arx-glass) 88%, transparent);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 6px 18px rgb(0 0 0 / .16);
  color: color-mix(in srgb, var(--arx-text) 62%, transparent);
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(16px);
}

.bar__pill kbd,
.bar__item kbd {
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--arx-text) 9%, transparent);
  color: var(--arx-secondary);
  font: 11px -apple-system, Inter, system-ui, sans-serif;
}

.bar__panel {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: grid;
  gap: 8px;
  width: 240px;
  transform-origin: 100% 100%;
}

.bar__list {
  display: grid;
  padding: 4px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--arx-glass) 94%, transparent);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 12px 30px rgb(0 0 0 / .2);
  backdrop-filter: blur(20px);
}

.bar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 10px;
  border-radius: 10px;
  color: var(--arx-text);
  font-size: 13px;
}

.bar__item.is-on {
  background: color-mix(in srgb, var(--arx-text) 9%, transparent);
}

.bar__item.is-danger {
  color: #e5484d;
}

.bar__item.is-empty {
  color: var(--arx-secondary);
}

.bar__item :deep(svg) {
  flex: none;
  width: 13px;
}

.bar__item b {
  flex: 1;
  color: inherit;
  font-weight: 500;
}

.bar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--arx-glass) 94%, transparent);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 6px 18px rgb(0 0 0 / .16);
  color: var(--arx-text);
  font-size: 13px;
}

.bar__search :deep(svg) {
  width: 13px;
  color: var(--arx-secondary);
}

.bar__search em {
  color: var(--arx-secondary);
  font-style: normal;
}

.actions-enter-active {
  transition: opacity .2s, transform .22s cubic-bezier(.2, .9, .3, 1.1);
}

.actions-leave-active {
  transition: opacity .1s;
}

.actions-enter-from {
  opacity: 0;
  transform: scale(.9);
}

.actions-leave-to {
  opacity: 0;
}

</style>
