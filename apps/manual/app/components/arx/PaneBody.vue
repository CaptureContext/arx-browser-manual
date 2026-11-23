<script setup lang="ts">
import type { ArxWorld } from '~/utils/arxModel'

// What a page card holds: the developer header on a local page with developer mode
// on (or a split pane's own header), the page, and DevTools docked beside it.
const props = defineProps<{ world: ArxWorld, id: string, pane?: boolean }>()
const tab = computed(() => props.world.tabs[props.id]!)
const developer = computed(() => props.world.developerMode && tab.value.local)
const devtools = computed(() => props.world.devtools?.tab === props.id ? props.world.devtools : null)
</script>

<template>
  <div class="body">
    <header v-if="developer" class="dev-header" data-arx="dev-header">
      <Icon name="raycast:switch" />
      <code>http://{{ tab.url }}/</code>
      <span class="dev-header__tools">
        <Icon name="raycast:link" data-arx="dev:copy" />
        <Icon name="raycast:crop" data-arx="dev:capture" />
        <Icon name="raycast:hammer" data-arx="dev:devtools" />
        <Icon name="raycast:terminal" data-arx="dev:console" />
        <Icon name="raycast:network" data-arx="dev:network" />
        <Icon name="raycast:bulls-eye" data-arx="dev:inspect" />
        <Icon name="raycast:app-window-sidebar-right" data-arx="dev:split" />
      </span>
    </header>
    <header v-else-if="pane" class="pane-header">
      <Icon name="raycast:arrow-left" /><span>{{ tab.url.split('/')[0] }}</span><Icon :data-arx="`pane-close:${id}`" name="raycast:xmark" />
    </header>
    <div class="body__row" :class="{ 'is-bottom': devtools?.dock === 'bottom' }">
      <div class="body__page"><ArxPage :tab="tab" /></div>
      <template v-if="devtools && devtools.dock !== 'window'">
        <span class="body__divider" data-arx="devtools-divider" />
        <ArxDevTools :devtools="devtools" :style="devtools.dock === 'bottom' ? { width: 'auto', height: '45%' } : { width: `${devtools.width ?? 400}px` }" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

.dev-header,
.pane-header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  background: var(--arx-window-top);
  color: var(--arx-secondary);
  font-size: 13px;
}

.dev-header {
  height: 36px;
}

.pane-header {
  height: 30px;
}

.pane-header > span:not(.iconify) {
  flex: 1;
  text-align: center;
}

.dev-header code {
  flex: 1;
  color: var(--arx-text);
  font: 12.5px ui-monospace, "SF Mono", Menlo, monospace;
}

.dev-header :deep(svg),
.pane-header :deep(svg) {
  width: 13px;
}

.dev-header__tools {
  display: flex;
  gap: 16px;
  padding-right: 4px;
}

.body__row {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}

.body__row.is-bottom {
  flex-direction: column;
}

.body__divider {
  flex: none;
  width: 1px;
  background: #d0d7de;
}

.is-bottom .body__divider {
  width: auto;
  height: 1px;
}

.body__page {
  position: relative;
  flex: 1;
  min-width: 0;
}
</style>
