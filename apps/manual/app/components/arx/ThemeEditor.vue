<script setup lang="ts">
import type { ArxThemeEditor } from '~/utils/arxModel'
import { ACCENTS } from '~/utils/arxModel'

// The colors editor a space's Appearance panel, a profile's page and Settings →
// Appearance & Sound share: the color field with its dots, the presets, the wave
// slider for intensity and the texture dial, then Match site and the accent color.
// Targets: `theme:dot:<index>`, `theme:wave`, `theme:match`, `theme:inherit-match`,
// `theme:accent:<name>`, `theme:inherit-accent`.
const props = defineProps<{ editor: ArxThemeEditor, wide?: boolean }>()

const presets = ['#f5f5f7', '#f4a6c0', '#b79cf2', '#f08a80', '#f5b26b', '#f2d76b', '#8fd6a0', '#8cc8f2', '#9aa5b8']
const names = computed(() => ({ space: 'space', profile: 'profile', global: 'Arx' })[props.editor.level])
const parent = computed(() => ({ space: 'Uses the profile’s colors', profile: 'Uses the browser default’s colors', global: 'Uses Arx’s default colors' })[props.editor.level])
// Six cycles of a sine wave, 256 points wide.
const wave = Array.from({ length: 65 }, (_, index) => `${index ? 'L' : 'M'}${index * 4} ${11 + Math.sin(index / 64 * Math.PI * 12) * 5}`).join(' ')
</script>

<template>
  <div class="editor" :class="{ 'is-wide': wide }">
    <div class="editor__field" data-arx="theme:field">
      <span v-if="editor.level !== 'global'" class="editor__modes"><Icon name="raycast:stars" class="is-on" /><Icon name="raycast:sun" /><Icon name="raycast:moon" /></span>
      <span v-if="!editor.dots.length" class="editor__hint"><b>Click to pick a color for {{ editor.level === 'global' ? 'Arx' : `this ${names}` }}</b><small>{{ parent }}</small></span>
      <i
        v-for="(dot, index) in editor.dots"
        :key="index"
        class="editor__dot"
        :class="{ 'is-main': index === 0 }"
        :style="{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%`, background: dot.color }"
        :data-arx="`theme:dot:${index}`"
      />
      <span class="editor__count"><Icon name="raycast:minus" /><Icon name="raycast:plus" /></span>
    </div>
    <div class="editor__side">
      <div class="editor__presets"><Icon name="raycast:chevron-left" /><i v-for="color in presets" :key="color" :style="{ background: color }" /><Icon name="raycast:chevron-right" /></div>
      <div class="editor__sliders">
        <span class="editor__wave" data-arx="theme:wave">
          <svg viewBox="0 0 256 22" preserveAspectRatio="none"><path :d="wave" /></svg>
          <svg class="is-lit" viewBox="0 0 256 22" preserveAspectRatio="none" :style="{ clipPath: `inset(0 ${100 - editor.intensity * 100}% 0 0)` }"><path :d="wave" /></svg>
          <b :style="{ left: `${4 + editor.intensity * 92}%` }" data-arx="theme:wave-handle" />
        </span>
        <span class="editor__dial"><i /><small>Noise</small></span>
      </div>
      <div v-if="editor.matchSite" class="editor__row">
        <span class="editor__line">
          <b>Match site</b>
          <small v-if="editor.matchSite.inherited === true">Inherited</small>
          <a v-else-if="editor.matchSite.inherited === false" data-arx="theme:inherit-match">Inherit</a>
          <span class="editor__switch" :class="{ 'is-on': editor.matchSite.on }" data-arx="theme:match"><i /></span>
        </span>
        <small>The chrome takes the color of the page it shows. Pages without one use the color below.</small>
      </div>
      <div v-if="editor.accent" class="editor__row">
        <span class="editor__line">
          <b>Accent color</b>
          <small v-if="editor.accent.inherited === true">Inherited</small>
          <a v-else-if="editor.accent.inherited === false" data-arx="theme:inherit-accent">Inherit</a>
          <span class="editor__well" :style="{ background: editor.accent.selected ? ACCENTS[editor.accent.selected] : ACCENTS.Indigo }" />
        </span>
        <span class="editor__accents">
          <i v-if="editor.level === 'global'" class="is-auto" :class="{ 'is-on': !editor.accent.selected }">A</i>
          <i v-for="(color, name) in ACCENTS" :key="name" :class="{ 'is-on': editor.accent.selected === name }" :style="{ background: color }" :data-arx="`theme:accent:${name}`" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor {
  display: grid;
  gap: 14px;
  width: 300px;
}

.editor.is-wide {
  grid-template-columns: 232px 1fr;
  gap: 20px;
  width: auto;
  padding: 14px;
}

.editor__side {
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
}

.editor__field {
  position: relative;
  aspect-ratio: 1;
  border-radius: 16px;
  background:
    radial-gradient(circle, color-mix(in srgb, var(--arx-text) 16%, transparent) 1px, transparent 1.4px) 0 0 / 8px 8px,
    linear-gradient(160deg, var(--arx-window-top), var(--arx-window-bottom));
  box-shadow: inset 0 0 0 .5px var(--arx-hairline-strong);
}

.editor__modes,
.editor__count {
  position: absolute;
  left: 50%;
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--arx-command) 80%, transparent);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
  translate: -50% 0;
}

.editor__modes { top: 10px; }
.editor__count { bottom: 10px; }

.editor__modes :deep(svg),
.editor__count :deep(svg) {
  width: 30px;
  height: 24px;
  padding: 5px 8px;
  border-radius: 99px;
}

.editor__modes .is-on {
  background: color-mix(in srgb, var(--arx-text) 14%, transparent);
}

.editor__hint {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 2px;
  padding: 0 30px;
  text-align: center;
}

.editor__hint small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.editor__dot {
  position: absolute;
  width: 22px;
  height: 22px;
  margin: -11px;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgb(0 0 0 / .3);
}

.editor__dot.is-main {
  width: 38px;
  height: 38px;
  margin: -19px;
  border-width: 4px;
}

.editor__presets {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--arx-secondary);
}

.editor__presets :deep(svg) {
  width: 12px;
}

.editor__presets i {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .18);
}

.editor__sliders {
  display: flex;
  align-items: center;
  gap: 16px;
}

.editor__wave {
  position: relative;
  flex: 1;
  height: 44px;
}

.editor__wave svg {
  position: absolute;
  top: 11px;
  left: 0;
  width: 100%;
  height: 22px;
  border-radius: 11px;
  background: color-mix(in srgb, var(--arx-text) 7%, transparent);
  fill: none;
  stroke: color-mix(in srgb, var(--arx-text) 22%, transparent);
  stroke-width: 4;
  stroke-linecap: round;
}

.editor__wave svg.is-lit {
  background: none;
  stroke: var(--arx-accent);
}

.editor__wave b {
  position: absolute;
  top: 2px;
  width: 18px;
  height: 40px;
  margin-left: -9px;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .15), 0 2px 6px rgb(0 0 0 / .25);
}

.editor__dial {
  display: grid;
  justify-items: center;
  gap: 2px;
  color: var(--arx-secondary);
  font-size: 10px;
}

.editor__dial i {
  width: 44px;
  height: 44px;
  border: 5px dotted color-mix(in srgb, var(--arx-text) 30%, transparent);
  border-bottom-color: transparent;
  border-radius: 50%;
}

.editor__row {
  display: grid;
  gap: 6px;
}

.editor__row > small {
  color: var(--arx-secondary);
  font-size: 11px;
  line-height: 1.35;
}

.editor__line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor__line b {
  font-weight: 500;
}

.editor__line small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.editor__line a {
  color: var(--arx-accent);
  font-size: 11px;
}

.editor__switch {
  position: relative;
  width: 28px;
  height: 17px;
  margin-left: auto;
  border-radius: 9px;
  background: color-mix(in srgb, var(--arx-text) 18%, transparent);
  transition: background .2s;
}

.editor__switch i {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / .3);
  transition: left .2s cubic-bezier(.3, .7, .2, 1.2);
}

.editor__switch.is-on { background: #34c759; }
.editor__switch.is-on i { left: 13px; }

.editor__well {
  width: 38px;
  height: 20px;
  margin-left: auto;
  border-radius: 5px;
  box-shadow: inset 0 0 0 3px var(--arx-command), 0 0 0 .5px var(--arx-hairline-strong);
  transition: background .25s;
}

.editor__accents {
  display: flex;
  gap: 8px;
}

.editor__accents i {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
}

.editor__accents .is-auto {
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
}

.editor__accents i.is-on {
  box-shadow: 0 0 0 2px var(--arx-command), 0 0 0 4px var(--arx-accent);
}

.editor__modes :deep(.iconify),
.editor__count :deep(.iconify) {
  box-sizing: content-box;
  padding: 5px 9px;
  border-radius: 99px;
  font-size: 13px;
}

</style>
