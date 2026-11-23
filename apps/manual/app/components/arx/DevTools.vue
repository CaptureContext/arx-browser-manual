<script setup lang="ts">
import type { ArxWorld } from '~/utils/arxModel'

// Chromium DevTools docked on the right of its page: the Elements tree with the
// picked element's styles, or the Console.
defineProps<{ devtools: NonNullable<ArxWorld['devtools']> }>()
</script>

<template>
  <section class="devtools" data-arx="devtools">
    <header class="devtools__bar">
      <Icon name="raycast:bulls-eye" :class="{ 'is-on': !devtools.picked && devtools.panel === 'Elements' }" />
      <span v-for="panel in ['Elements', 'Console', 'Sources', 'Network']" :key="panel" :class="{ 'is-on': devtools.panel === panel }">{{ panel }}</span>
      <i />
      <Icon name="raycast:cog" />
      <Icon name="raycast:ellipsis-vertical" data-arx="devtools:more" />
      <Icon name="raycast:xmark" />
    </header>
    <div v-if="devtools.panel === 'Console'" class="devtools__console">
      <p><span class="is-dim">localhost:3000</span>Trailhead dev build ready</p>
      <p class="is-error"><Icon name="raycast:xmark" />GET http://localhost:3000/favicon.ico 404 (Not Found)</p>
      <p class="devtools__prompt">›<i /></p>
    </div>
    <div v-else class="devtools__elements">
      <code>
        <span>&lt;!DOCTYPE html&gt;</span>
        <span>&lt;html lang="en"&gt;</span>
        <span class="i1">▸ &lt;head&gt;…&lt;/head&gt;</span>
        <span class="i1">▾ &lt;body&gt;</span>
        <span class="i2">&lt;header&gt;Trailhead&lt;/header&gt;</span>
        <span class="i2">▾ &lt;main&gt;</span>
        <span class="i3">&lt;h1&gt;Plan your next hike&lt;/h1&gt;</span>
        <span class="i3">&lt;p&gt;Trails near you, with distance…&lt;/p&gt;</span>
        <span class="i3" :class="{ 'is-picked': devtools.picked }">▸ &lt;div <em>class</em>=<b>"card"</b>&gt;…&lt;/div&gt;<small v-if="devtools.picked"> == $0</small></span>
        <span class="i3">▸ &lt;div <em>class</em>=<b>"card"</b>&gt;…&lt;/div&gt;</span>
        <span class="i3">&lt;button&gt;Save a trail&lt;/button&gt;</span>
        <span class="i2">&lt;/main&gt;</span>
      </code>
      <div class="devtools__styles">
        <nav><b>Styles</b><span>Computed</span><span>Layout</span></nav>
        <code v-if="devtools.picked">
          <span>.card {</span>
          <span class="i1"><em>background</em>: #fff;</span>
          <span class="i1"><em>border-radius</em>: 14px;</span>
          <span class="i1"><em>padding</em>: 18px 22px;</span>
          <span class="i1"><em>margin</em>: 16px 0;</span>
          <span>}</span>
        </code>
        <code v-else><span>element.style {</span><span>}</span></code>
      </div>
    </div>
  </section>
</template>

<style scoped>
.devtools {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 400px;
  border-left: 1px solid #d0d7de;
  background: #fff;
  color: #1f1f1f;
  font: 12px/1.6 -apple-system, system-ui, sans-serif;
  animation: dock .35s cubic-bezier(.2, .8, .2, 1);
}

.devtools__bar {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 30px;
  padding: 0 10px;
  border-bottom: 1px solid #e3e3e3;
  background: #f3f3f3;
  color: #5f6368;
}

.devtools__bar :deep(svg) {
  width: 13px;
}

.devtools__bar .is-on {
  color: #1a73e8;
}

.devtools__bar span.is-on {
  box-shadow: inset 0 -2px #1a73e8;
  line-height: 28px;
}

.devtools__bar i {
  flex: 1;
}

.devtools code {
  display: grid;
  padding: 6px 0;
  font: 11.5px/1.65 ui-monospace, "SF Mono", Menlo, monospace;
  color: #881280;
}

.devtools code span {
  padding: 0 10px;
  white-space: nowrap;
}

.devtools code .i1 { padding-left: 24px; }
.devtools code .i2 { padding-left: 38px; }
.devtools code .i3 { padding-left: 52px; }
.devtools code em { color: #994500; font-style: normal; }
.devtools code b { color: #1a1aa6; font-weight: 400; }
.devtools code small { color: #5f6368; }

.devtools code .is-picked {
  background: #cfe8fc;
}

.devtools__elements {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.devtools__styles {
  margin-top: auto;
  border-top: 1px solid #e3e3e3;
}

.devtools__styles nav {
  display: flex;
  gap: 14px;
  padding: 4px 10px;
  background: #f3f3f3;
  color: #5f6368;
}

.devtools__styles nav b {
  color: #1a73e8;
  font-weight: 500;
}

.devtools__styles code {
  color: #1f1f1f;
  min-height: 130px;
  align-content: start;
}

.devtools__styles code em {
  color: #c80000;
}

.devtools__console p {
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 4px 10px;
  border-bottom: 1px solid #f0f0f0;
  font: 11.5px/1.5 ui-monospace, "SF Mono", Menlo, monospace;
}

.devtools__console .is-dim {
  margin-left: auto;
  order: 2;
  color: #5f6368;
}

.devtools__console .is-error {
  background: #fff0f0;
  color: #c00;
}

.devtools__console .is-error :deep(svg) {
  width: 11px;
}

.devtools__prompt {
  color: #1a73e8;
}

.devtools__prompt i {
  width: 1.5px;
  height: 14px;
  background: #1a73e8;
}

@keyframes dock {
  from { width: 0; opacity: 0; }
}
</style>
