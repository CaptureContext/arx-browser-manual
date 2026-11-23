<script setup lang="ts">
import type { ArxOverlay, ArxWorld } from '~/utils/arxModel'

// Everything that floats over the Arx window: Arx's own dialogs and prompts, other
// apps' windows (Terminal, Messages, Calendar, Finder), macOS panels and Touch ID,
// Little Arx, picture in picture, onboarding and the download indicator. Targets are
// `dialog:<button>`, `row:<label>`, `field:<label>`, `list:<title>`, `message-link`,
// `meet-link`, `file:<name>`, `panel:<item>`, `panel:<action>`, `onboarding:<choice>`.
defineProps<{ world: ArxWorld, overlays: ArxOverlay[] }>()

const box = (x: number, y: number, w: number, h: number) => ({ left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` })
const browsers = [
  { id: 'Arc', icon: 'A', color: '#fb4f4f' },
  { id: 'Chrome', icon: 'C', color: '#4285f4' },
  { id: 'Safari', icon: 'S', color: '#1e90ff' },
  { id: 'Firefox', icon: 'F', color: '#ff7139' },
]
</script>

<template>
  <div class="overlays">
    <template v-for="(item, index) in overlays" :key="index">
      <!-- Arx's dialogs, prompts and sheets -->
      <div v-if="item.kind === 'dialog'" class="dialog-layer" :class="{ 'is-dim': item.dim }">
        <section
          class="dialog"
          :class="{ 'is-placed': item.at }"
          :style="{ width: `${item.width ?? 420}px`, ...(item.at ? { left: `${item.at[0]}px`, top: `${item.at[1]}px` } : {}) }"
          :data-arx="`dialog-box:${item.id}`"
        >
          <header class="dialog__head">
            <ArxFavicon v-if="item.icon" :icon="item.icon" :size="28" />
            <span><b>{{ item.title }}</b><small v-if="item.subtitle">{{ item.subtitle }}</small></span>
          </header>
          <p v-if="item.body" class="dialog__body">{{ item.body }}</p>
          <label v-for="field in item.fields ?? []" :key="field.label" class="dialog__field" :class="{ 'is-focused': field.focused }" :data-arx="`field:${field.label}`">
            <small>{{ field.label }}</small>
            <span>{{ field.secure ? '•'.repeat(field.value.length) : field.value }}<i v-if="field.focused" /></span>
          </label>
          <div v-if="item.rows?.length" class="dialog__rows">
            <div v-for="row in item.rows" :key="row.label" class="dialog__row" :data-arx="`row:${row.label}`">
              <span v-if="row.check !== undefined" class="check" :class="{ 'is-on': row.check }"><Icon v-if="row.check" name="raycast:check" /></span>
              <Icon v-if="row.icon" :name="`raycast:${row.icon}`" class="dialog__row-icon" />
              <span class="dialog__row-text"><span>{{ row.label }}</span><small v-if="row.detail">{{ row.detail }}</small></span>
              <span v-if="row.value" class="dialog__value">{{ row.value }}</span>
              <span v-if="row.popup" class="popup">{{ row.popup }}<Icon name="raycast:chevron-up-down" /></span>
              <span v-if="row.toggle !== undefined" class="toggle" :class="{ 'is-on': row.toggle }"><i /></span>
            </div>
          </div>
          <div v-if="item.list?.length" class="dialog__list">
            <div v-for="entry in item.list" :key="entry.title" class="dialog__entry" :data-arx="`list:${entry.title}`">
              <ArxFavicon v-if="entry.icon" :icon="entry.icon" :size="22" />
              <span><b>{{ entry.title }}</b><small v-if="entry.detail">{{ entry.detail }}</small></span>
              <em v-if="entry.badge">{{ entry.badge }}</em>
            </div>
          </div>
          <p v-if="item.note" class="dialog__note">{{ item.note }}</p>
          <footer v-if="item.buttons?.length" class="dialog__buttons">
            <span v-for="button in item.buttons" :key="button.label" :class="{ 'is-primary': button.primary, 'is-danger': button.danger }" :data-arx="`dialog:${button.label}`">{{ button.label }}</span>
          </footer>
        </section>
      </div>

      <!-- Terminal -->
      <section v-else-if="item.kind === 'terminal'" class="app is-terminal" :style="box(item.x, item.y, item.w, item.h)">
        <header class="app__bar"><span class="lights"><i /><i /><i /></span><b>Terminal — zsh</b></header>
        <pre class="terminal"><template v-for="(line, at) in item.lines" :key="at">{{ line }}
</template><span class="terminal__prompt">~ % </span>{{ item.typing }}<i class="terminal__caret" /></pre>
      </section>

      <!-- Messages -->
      <section v-else-if="item.kind === 'messages'" class="app is-messages" :style="box(item.x, item.y, item.w, item.h)">
        <header class="app__bar"><span class="lights"><i /><i /><i /></span><b>Anna Petrova</b></header>
        <div class="messages">
          <p class="bubble is-them">Have you seen the new release notes?</p>
          <p class="bubble is-them is-link" data-arx="message-link"><b>Arx 0.9 release notes</b><small>capturecontext.dev</small></p>
          <p class="bubble is-me">Not yet, reading now</p>
        </div>
      </section>

      <!-- Calendar -->
      <section v-else-if="item.kind === 'calendar'" class="app is-calendar" :style="box(item.x, item.y, item.w, item.h)">
        <header class="app__bar"><span class="lights"><i /><i /><i /></span><b>Calendar</b></header>
        <div class="calendar">
          <div v-for="hour in ['9 AM', '10 AM', '11 AM', 'Noon', '1 PM']" :key="hour" class="calendar__hour"><small>{{ hour }}</small><i /></div>
          <div class="calendar__event" data-arx="calendar-event"><b>Design review</b><small>10:00 – 10:45 · Google Meet</small></div>
          <div v-if="item.popover" class="calendar__popover">
            <b>Design review</b><small>Today, 10:00 – 10:45</small>
            <span class="calendar__join" data-arx="meet-link"><Icon name="raycast:video" />Join Google Meet</span>
            <small>meet.google.com/abc-defg-hij</small>
          </div>
        </div>
      </section>

      <!-- Finder -->
      <section v-else-if="item.kind === 'finder'" class="app is-finder" :style="box(item.x, item.y, item.w, item.h)">
        <header class="app__bar"><span class="lights"><i /><i /><i /></span><b>Desktop</b></header>
        <div class="finder">
          <span v-for="file in item.files" :key="file.name" class="finder__file" :class="{ 'is-lifted': item.lifted === file.name }" :data-arx="`file:${file.name}`">
            <i :class="`is-${file.kind}`">{{ file.kind === 'image' ? '' : file.kind.toUpperCase() }}</i><small>{{ file.name }}</small>
          </span>
        </div>
      </section>

      <!-- An open or import panel, as a sheet from the top of the window -->
      <section v-else-if="item.kind === 'panel'" class="panel">
        <b>{{ item.title }}</b>
        <div class="panel__list">
          <span v-for="(entry, at) in item.items" :key="entry" :class="{ 'is-on': at === item.selected }" :data-arx="`panel:${entry}`"><Icon :name="entry.includes('.') ? 'raycast:blank-document' : 'raycast:folder'" />{{ entry }}</span>
        </div>
        <footer><span>Cancel</span><span class="is-primary" :data-arx="`panel:${item.action}`">{{ item.action }}</span></footer>
      </section>

      <!-- Touch ID -->
      <div v-else-if="item.kind === 'touchid'" class="dialog-layer is-dim">
        <section class="touchid">
          <span class="touchid__print"><Icon name="raycast:fingerprint" /></span>
          <b>Arx</b>
          <p>{{ item.reason }}</p>
          <small>Touch ID or enter your password to allow this.</small>
          <footer><span>Use Password…</span><span>Cancel</span></footer>
        </section>
      </div>

      <!-- Little Arx -->
      <section v-else-if="item.kind === 'little'" class="app is-little" :style="box(item.x, item.y, item.w, item.h)" data-arx="little-arx">
        <header class="little__bar">
          <span class="lights"><i /><i /><i /></span>
          <span class="little__host"><em v-if="item.profile"><Icon name="raycast:person-circle" />{{ item.profile }}</em>{{ world.tabs[item.tab]!.url.split('/')[0] }}</span>
          <span class="little__open" data-arx="little:open">Open in {{ item.space ?? 'Arx' }} <kbd>⌘O</kbd></span>
        </header>
        <div class="little__page"><ArxPage :tab="world.tabs[item.tab]!" /></div>
      </section>

      <!-- Picture in picture -->
      <section v-else-if="item.kind === 'pip'" class="pip" :style="box(item.x, item.y, item.w, item.h)" data-arx="pip">
        <div class="pip__video"><Icon name="raycast:brand-swift" /></div>
        <span class="pip__close"><Icon name="raycast:xmark" /></span>
        <span class="pip__controls"><Icon name="raycast:arrow-counter-clockwise" /><Icon name="raycast:pause" /><Icon name="raycast:arrow-clockwise" /></span>
        <span class="pip__progress" />
      </section>

      <!-- The assistants' privacy lock across the top of the page -->
      <div v-else-if="item.kind === 'banner'" class="banner">
        <Icon name="raycast:lock" /><span>{{ item.text }}</span><b data-arx="banner:action">{{ item.action }}</b>
      </div>

      <!-- Onboarding and the migration assistant -->
      <div v-else-if="item.kind === 'onboarding'" class="dialog-layer is-dim is-solid">
        <section class="onboarding">
          <template v-if="item.step === 'welcome'">
            <img src="/brand/arx-icon.png" alt="">
            <h2>Welcome to Arx</h2>
            <p>Spaces for each part of your day, one bar for everything, and a sidebar that remembers.</p>
            <span class="onboarding__button is-primary" data-arx="onboarding:import">Import from Another Browser…</span>
            <span class="onboarding__button">Start Fresh</span>
          </template>
          <template v-else-if="item.step === 'browsers'">
            <h2>{{ item.title ?? 'Bring in your browser' }}</h2>
            <p>Pick a browser. Nothing changes in it, and you review everything before it comes over.</p>
            <div class="onboarding__browsers">
              <span v-for="browser in browsers" :key="browser.id" :class="{ 'is-on': item.selected === browser.id }" :data-arx="`onboarding:${browser.id}`">
                <i :style="{ background: browser.color }">{{ browser.icon }}</i>{{ browser.id }}
              </span>
            </div>
            <span class="onboarding__button is-primary" data-arx="onboarding:continue">Continue</span>
          </template>
          <template v-else-if="item.step === 'review'">
            <h2>Review what comes over from Arc</h2>
            <div class="onboarding__review">
              <div><b>Profiles</b><span>Personal, Work → new profiles</span></div>
              <div><b>Spaces</b><span>Home, Shops, Work · 3</span></div>
              <div><b>Pinned tabs</b><span>48 in 9 folders</span></div>
              <div><b>Favorites</b><span>14</span></div>
              <div><b>History and passwords</b><span>From Chrome's data, if you allow it</span></div>
            </div>
            <span class="onboarding__button is-primary" data-arx="onboarding:import-now">Import into New Profiles</span>
          </template>
          <template v-else>
            <span class="onboarding__done"><Icon name="raycast:check" /></span>
            <h2>Arc came over</h2>
            <p>3 spaces, 48 pinned tabs and 14 Favorites, in two new profiles.</p>
          </template>
        </section>
      </div>

      <!-- A sheet, popover or assistant window built from sections -->
      <div v-else-if="item.kind === 'form'" class="dialog-layer" :class="{ 'is-dim': item.dim }">
        <ArxForm
          :form="item.form"
          :class="{ 'is-placed': item.at }"
          :style="{ width: `${item.width}px`, ...(item.height ? { height: `${item.height}px` } : {}), ...(item.at ? { position: 'absolute', left: `${item.at[0]}px`, top: `${item.at[1]}px` } : {}) }"
        />
      </div>

      <!-- Saved accounts or cards under a form field -->
      <div v-else-if="item.kind === 'autofill'" class="autofill" :style="{ left: `${item.x}px`, top: `${item.y}px`, width: `${item.w}px` }">
        <span v-for="(row, at) in item.rows" :key="row.title" class="autofill__row" :class="{ 'is-on': item.selected === at }" :data-arx="`autofill:${at}`">
          <Icon :name="`raycast:${item.icon}`" /><span><b>{{ row.title }}</b><small v-if="row.subtitle">{{ row.subtitle }}</small></span>
        </span>
        <i />
        <span class="autofill__row" data-arx="autofill:manage"><Icon name="raycast:cog" /><span><b>{{ item.manage }}</b></span></span>
      </div>

      <!-- A prompt card on the window: a permission request, or a link for another app -->
      <div v-else-if="item.kind === 'prompt'" class="dialog-layer is-dim">
        <section class="prompt" :class="{ 'is-placed': item.at }" :style="item.at ? { left: `${item.at[0]}px`, top: `${item.at[1]}px` } : {}" :data-arx="`prompt:${item.id}`">
          <span class="prompt__icon"><ArxFavicon :icon="item.icon" :size="34" /><i v-if="item.badge"><Icon :name="`raycast:${item.badge.icon}`" /></i></span>
          <b>{{ item.title }}</b>
          <p v-if="item.body">{{ item.body }}</p>
          <code v-if="item.link">{{ item.link }}</code>
          <small v-if="item.note">{{ item.note }}</small>
          <span v-if="item.check" class="prompt__check" data-arx="prompt:check"><span class="check" :class="{ 'is-on': item.check.on }"><Icon v-if="item.check.on" name="raycast:check" /></span>{{ item.check.label }}</span>
          <span v-if="item.busy" class="prompt__busy"><i />{{ item.busy }}</span>
          <template v-else>
            <span v-for="button in item.buttons" :key="button.label" class="prompt__button" :class="{ 'is-primary': button.primary }" :data-arx="`prompt:${button.label}`">{{ button.label }}<kbd v-if="button.hint">{{ button.hint }}</kbd></span>
          </template>
        </section>
      </div>

      <!-- The Runway: which profile opens a link from another app -->
      <section v-else-if="item.kind === 'runway'" class="runway" :style="{ left: `${item.x}px`, top: `${item.y}px` }" data-arx="runway">
        <header><span><b>Open in Profile</b><small>{{ item.link }}</small></span><i><Icon name="raycast:xmark" /></i></header>
        <span class="runway__search"><Icon name="raycast:magnifying-glass" />Search Profiles…</span>
        <div class="runway__rows">
          <span v-for="(row, at) in item.rows" :key="row.profile" class="runway__row" :class="{ 'is-on': item.selected === at }" :data-arx="`runway:${row.profile}`">
            <i><Icon :name="`raycast:${row.icon}`" /></i><span><b>{{ row.profile }}</b><small>{{ row.space }}</small></span><kbd>⌘{{ at + 1 }}</kbd>
          </span>
        </div>
        <footer><kbd>return</kbd>Open<kbd>esc</kbd>Drop link</footer>
      </section>

      <!-- Another app's window -->
      <section v-else-if="item.kind === 'app'" class="app is-plain" :style="box(item.x, item.y, item.w, item.h)" :data-arx="`app:${item.id}`">
        <header class="app__bar"><span class="lights"><i /><i /><i /></span><b>{{ item.title }}</b></header>
        <div class="plain">
          <h3 v-if="item.heading">{{ item.heading }}</h3>
          <div v-for="line in item.lines" :key="line.text" class="plain__line" :class="{ 'is-link': line.link, 'is-row': line.toggle !== undefined || line.value || line.button || line.icon }" :data-arx="`line:${line.text}`">
            <Icon v-if="line.icon" :name="`raycast:${line.icon}`" />
            <span class="plain__text"><span>{{ line.text }}</span><small v-if="line.detail">{{ line.detail }}</small></span>
            <em v-if="line.value" :class="{ 'is-green': line.tone === 'green' }">{{ line.value }}</em>
            <span v-if="line.button" class="plain__button" :data-arx="`line-button:${line.text}`">{{ line.button }}</span>
            <span v-if="line.toggle !== undefined" class="toggle" :class="{ 'is-on': line.toggle }" :data-arx="`line-toggle:${line.text}`"><i /></span>
          </div>
        </div>
      </section>

      <!-- Device capture's popover -->
      <section v-else-if="item.kind === 'devicecapture'" class="devcap" :style="{ left: `${item.x}px`, top: `${item.y}px` }">
        <div class="devcap__preview" :style="{ background: `linear-gradient(135deg, hsl(${item.hue * 360} 80% 72%), hsl(${item.hue * 360 + 32} 62% 46%))` }">
          <span class="devcap__device" :class="{ 'is-phone': item.portrait }"><i /><b /><b /><b /></span>
        </div>
        <span class="devcap__line" data-arx="devcap:portrait">Capture in Portrait Mode<span class="toggle" :class="{ 'is-on': item.portrait }"><i /></span></span>
        <small>Background</small>
        <span class="devcap__slider" data-arx="devcap:slider"><b :style="{ left: `${item.hue * 100}%` }" data-arx="devcap:handle" /></span>
        <span class="devcap__rainbow" />
        <span class="devcap__capture" data-arx="devcap:capture">Capture</span>
        <span class="devcap__more"><i>Plain Screenshot</i><i>Capture Area</i></span>
      </section>

      <!-- A finished download, under the address bar -->
      <div v-else-if="item.kind === 'download'" class="download">
        <Icon name="raycast:arrow-down-circle" /><span><b>{{ item.file }}</b><small>Saved to {{ item.folder }}</small></span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.overlays {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  color: var(--arx-text);
  font-size: 13px;
}

.lights {
  display: flex;
  gap: 7px;
}

.lights i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #ff5f57;
}

.lights i:nth-child(2) { background: #febc2e; }
.lights i:nth-child(3) { background: #28c840; }

.dialog-layer {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.dialog-layer.is-dim {
  background: rgb(0 0 0 / .14);
  animation: fade .2s;
}

.dialog-layer.is-solid {
  background: linear-gradient(180deg, var(--arx-window-top), var(--arx-window-bottom));
}

.dialog {
  display: grid;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 16px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 22px 60px rgb(0 0 0 / .28);
  animation: pop .26s cubic-bezier(.2, .9, .3, 1.15);
}

.dialog.is-placed {
  position: absolute;
}

.dialog__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog__head span {
  display: grid;
  line-height: 1.3;
}

.dialog__head b {
  font-size: 15px;
}

.dialog__head small,
.dialog__body,
.dialog__note {
  color: var(--arx-secondary);
}

.dialog__body,
.dialog__note {
  margin: 0;
  line-height: 1.45;
}

.dialog__note {
  font-size: 12px;
}

.dialog__field {
  display: grid;
  gap: 2px;
  padding: 7px 12px;
  border-radius: 10px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
}

.dialog__field.is-focused {
  box-shadow: 0 0 0 2px rgb(10 99 224 / .75);
}

.dialog__field small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.dialog__field span {
  min-height: 18px;
  font-size: 14px;
}

.dialog__field i {
  display: inline-block;
  width: 1.5px;
  height: 15px;
  margin-left: 1px;
  vertical-align: -2px;
  background: #0a63e0;
}

.dialog__rows,
.dialog__list {
  border-radius: 12px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
}

.dialog__row,
.dialog__entry {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 6px 12px;
  border-top: 1px solid var(--arx-hairline);
}

.dialog__row:first-child,
.dialog__entry:first-child {
  border-top: 0;
}

.dialog__row-icon {
  width: 15px;
  color: var(--arx-secondary);
}

.dialog__row-text,
.dialog__entry > span {
  display: grid;
  flex: 1;
  line-height: 1.3;
}

.dialog__row small,
.dialog__entry small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.dialog__value {
  color: var(--arx-secondary);
  font-family: ui-monospace, Menlo, monospace;
  font-size: 12px;
}

.dialog__entry em {
  padding: 2px 8px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--arx-text) 8%, transparent);
  font-size: 11px;
  font-style: normal;
}

.check {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
  color: #fff;
}

.check.is-on {
  background: #0a63e0;
  box-shadow: none;
}

.check :deep(svg) {
  width: 11px;
}

.toggle {
  position: relative;
  width: 32px;
  height: 19px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--arx-text) 18%, transparent);
  transition: background .2s;
}

.toggle i {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / .3);
  transition: left .2s cubic-bezier(.3, .7, .2, 1.2);
}

.toggle.is-on {
  background: #34c759;
}

.toggle.is-on i {
  left: 15px;
}

.popup {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 7px 3px 10px;
  border-radius: 7px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong);
}

.popup :deep(svg) {
  width: 10px;
}

.dialog__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog__buttons span {
  padding: 5px 14px;
  border-radius: 8px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 1px 1px rgb(0 0 0 / .06);
  font-weight: 500;
}

.dialog__buttons .is-primary {
  background: #0a63e0;
  color: #fff;
}

.dialog__buttons .is-danger {
  color: #e5484d;
}

/* The list under a form field */
.autofill {
  position: absolute;
  display: grid;
  padding: 5px;
  border-radius: 10px;
  background: var(--arx-menu);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 10px 30px rgb(0 0 0 / .2);
  backdrop-filter: blur(20px);
  animation: fade .15s;
}

.autofill > i {
  height: 1px;
  margin: 4px 6px;
  background: var(--arx-hairline-strong);
}

.autofill__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 0 7px;
  border-radius: 6px;
}

.autofill__row.is-on {
  background: color-mix(in srgb, var(--arx-accent) 22%, transparent);
}

.autofill__row :deep(svg) {
  width: 14px;
  color: var(--arx-secondary);
}

.autofill__row > span:not(.iconify) {
  display: grid;
  line-height: 1.25;
}

.autofill__row b {
  font-weight: 400;
}

.autofill__row small {
  color: var(--arx-secondary);
  font-size: 11px;
}

/* A prompt card on the window */
.prompt {
  display: grid;
  justify-items: center;
  gap: 8px;
  width: 320px;
  padding: 26px 20px 18px;
  border-radius: 18px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 24px 60px rgb(0 0 0 / .3);
  text-align: center;
  animation: pop .26s cubic-bezier(.2, .9, .3, 1.15);
}

.prompt.is-placed {
  position: absolute;
  margin: -210px 0 0 -160px;
}

.prompt__icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 6px;
  border-radius: 12px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong);
}

.prompt__icon i {
  position: absolute;
  right: -8px;
  bottom: -8px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--arx-accent);
  box-shadow: 0 0 0 2px var(--arx-command);
  color: #fff;
}

.prompt__icon i :deep(svg) {
  width: 14px;
}

.prompt > b {
  font-size: 17px;
  line-height: 1.25;
}

.prompt p {
  margin: 0;
  color: var(--arx-secondary);
}

.prompt code {
  color: var(--arx-secondary);
  font: 11px ui-monospace, Menlo, monospace;
}

.prompt > small {
  justify-self: start;
  margin-top: 6px;
  color: var(--arx-secondary);
  font-size: 11px;
  text-align: left;
}

.prompt__check {
  display: flex;
  align-items: center;
  justify-self: start;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  text-align: left;
}

.prompt__button {
  position: relative;
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 1px 1px rgb(0 0 0 / .06);
  font-weight: 500;
}

.prompt__button.is-primary {
  background: #0a63e0;
  color: #fff;
}

.prompt__button kbd {
  position: absolute;
  top: 8px;
  right: 12px;
  font: inherit;
  font-size: 11px;
  opacity: .6;
}

.prompt__busy {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  color: var(--arx-secondary);
}

.prompt__busy i,
.devcap i.spin {
  width: 14px;
  height: 14px;
  border: 2px solid color-mix(in srgb, var(--arx-text) 18%, transparent);
  border-top-color: var(--arx-secondary);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* The Runway */
.runway {
  position: absolute;
  display: grid;
  gap: 8px;
  width: 300px;
  padding: 8px;
  border-radius: 16px;
  background: var(--arx-menu);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 20px 50px rgb(0 0 0 / .3);
  backdrop-filter: blur(24px);
  animation: pop .24s cubic-bezier(.2, .9, .3, 1.1);
}

.runway header {
  display: flex;
  align-items: center;
  padding: 4px 4px 0 8px;
}

.runway header > span {
  display: grid;
  flex: 1;
  min-width: 0;
  line-height: 1.3;
}

.runway header b {
  font-weight: 500;
}

.runway small {
  overflow: hidden;
  color: var(--arx-secondary);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runway header i,
.runway__row i {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-text) 8%, transparent);
}

.runway :deep(svg) {
  width: 13px;
}

.runway__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: 11px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
  color: var(--arx-secondary);
}

.runway__rows {
  display: grid;
  padding: 4px;
  border-radius: 12px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
}

.runway__row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 8px;
  border-radius: 9px;
  transition: background .15s;
}

.runway__row.is-on {
  background: color-mix(in srgb, var(--arx-text) 10%, transparent);
}

.runway__row > span {
  display: grid;
  flex: 1;
  line-height: 1.25;
}

.runway__row b {
  font-weight: 500;
}

.runway kbd {
  padding: 1px 6px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--arx-text) 8%, transparent);
  color: var(--arx-secondary);
  font: inherit;
  font-size: 11px;
}

.runway footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px 2px;
  color: var(--arx-secondary);
  font-size: 11px;
}

.runway footer kbd:nth-of-type(2) {
  margin-left: 10px;
}

/* A plain app window: a heading and a few lines */
.plain {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 18px 22px;
  font-size: 13px;
}

.plain h3 {
  margin: 0 0 4px;
  color: inherit;
  font-size: 17px;
}

.plain__line {
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.45;
}

.plain__line.is-row {
  min-height: 42px;
  padding: 6px 12px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .12);
}

.plain__line :deep(svg) {
  width: 16px;
  color: #6e6e73;
}

.plain__text {
  display: grid;
  flex: 1;
}

.plain__line small,
.plain__line em {
  color: #6e6e73;
  font-size: 12px;
  font-style: normal;
}

.plain__line em.is-green {
  color: #248a3d;
  font-weight: 600;
}

.plain__line.is-link .plain__text > span {
  color: #0a63e0;
  text-decoration: underline;
}

.plain__button {
  padding: 4px 12px;
  border-radius: 7px;
  background: #0a63e0;
  color: #fff;
  font-weight: 500;
}

/* Device capture */
.devcap {
  position: absolute;
  display: grid;
  gap: 12px;
  width: 264px;
  padding: 14px;
  border-radius: 14px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 14px 40px rgb(0 0 0 / .24);
  animation: pop .22s cubic-bezier(.2, .9, .3, 1.1);
}

.devcap__preview {
  display: grid;
  place-items: center;
  height: 132px;
  border-radius: 10px;
}

.devcap__device {
  display: grid;
  align-content: start;
  gap: 6px;
  width: 150px;
  height: 96px;
  padding: 16px 10px 8px;
  border-radius: 8px;
  background: #f1f1f3;
  box-shadow: 0 6px 16px rgb(0 0 0 / .25);
  transition: width .3s cubic-bezier(.3, .7, .2, 1), height .3s cubic-bezier(.3, .7, .2, 1), border-radius .3s;
}

.devcap__device.is-phone {
  width: 56px;
  height: 112px;
  border-radius: 12px;
}

.devcap__device i {
  position: absolute;
  width: 22px;
  height: 5px;
  margin: -10px 0 0 -2px;
  border-radius: 3px;
  background: #c7c7cc;
}

.devcap__device b {
  height: 8px;
  border-radius: 3px;
  background: #d6d6db;
}

.devcap__device b:first-of-type {
  height: 22px;
  background: #b9c6f5;
}

.devcap__line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.devcap small {
  margin-bottom: -6px;
  color: var(--arx-secondary);
}

.devcap__slider {
  position: relative;
  height: 4px;
  margin: 6px 8px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--arx-text) 16%, transparent);
}

.devcap__slider b {
  position: absolute;
  top: -6px;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .15), 0 1px 3px rgb(0 0 0 / .3);
}

.devcap__rainbow {
  height: 4px;
  margin: -6px 8px 0;
  border-radius: 2px;
  background: linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red);
}

.devcap__capture {
  padding: 6px;
  border-radius: 8px;
  background: #0a63e0;
  color: #fff;
  font-weight: 500;
  text-align: center;
}

.devcap__more {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.devcap__more i {
  padding: 4px;
  border-radius: 7px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong);
  font-size: 12px;
  font-style: normal;
  text-align: center;
}

.little__host em {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-right: 10px;
  color: var(--arx-secondary);
  font-size: 11px;
  font-style: normal;
}

.little__host em :deep(svg) {
  width: 11px;
}

/* Other apps */
.app {
  position: absolute;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  background: #fbfbfd;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .25), 0 24px 70px rgb(0 0 0 / .3);
  color: #1d1d1f;
  animation: pop .3s cubic-bezier(.2, .9, .3, 1.1);
}

.app__bar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 14px;
  height: 36px;
  padding: 0 12px;
  background: #ececee;
  border-bottom: 1px solid #dcdcdf;
  font-size: 13px;
}

.app__bar b {
  flex: 1;
  margin-right: 50px;
  font-weight: 600;
  text-align: center;
}

.is-terminal {
  background: #1e1e1e;
  color: #e6e6e6;
}

.is-terminal .app__bar {
  background: #2c2c2e;
  border-color: #111;
  color: #c7c7cc;
}

.terminal {
  flex: 1;
  margin: 0;
  padding: 12px 14px;
  overflow: hidden;
  font: 13px/1.55 ui-monospace, "SF Mono", Menlo, monospace;
  white-space: pre-wrap;
}

.terminal__prompt {
  color: #63d471;
}

.terminal__caret {
  display: inline-block;
  width: 8px;
  height: 15px;
  vertical-align: -3px;
  background: #e6e6e6;
  animation: blink 1s steps(1) infinite;
}

.messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  padding: 18px 16px;
}

.bubble {
  max-width: 70%;
  margin: 0;
  padding: 8px 12px;
  border-radius: 18px;
  font-size: 14px;
}

.bubble.is-them {
  align-self: flex-start;
  background: #e9e9eb;
}

.bubble.is-me {
  align-self: flex-end;
  background: #0a84ff;
  color: #fff;
}

.bubble.is-link {
  display: grid;
  padding: 10px 14px;
  border: 1px solid #d8d8dc;
  background: #fff;
}

.bubble.is-link b {
  color: #0a63e0;
}

.bubble.is-link small {
  color: #8e8e93;
}

.calendar {
  position: relative;
  flex: 1;
  padding: 10px 14px;
}

.calendar__hour {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 58px;
  color: #8e8e93;
  font-size: 11px;
}

.calendar__hour i {
  flex: 1;
  height: 1px;
  background: #e5e5ea;
}

.calendar__event {
  position: absolute;
  top: 70px;
  right: 18px;
  left: 70px;
  display: grid;
  padding: 8px 10px;
  border-left: 3px solid #0a84ff;
  border-radius: 6px;
  background: #e4efff;
  font-size: 13px;
}

.calendar__event small {
  color: #4a6fa5;
}

.calendar__popover {
  position: absolute;
  top: 128px;
  left: 120px;
  display: grid;
  gap: 6px;
  width: 260px;
  padding: 14px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .15), 0 12px 32px rgb(0 0 0 / .2);
  animation: pop .22s ease-out;
}

.calendar__popover small {
  color: #8e8e93;
}

.calendar__join {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #0a84ff;
  color: #fff;
  font-weight: 600;
}

.calendar__join :deep(svg) {
  width: 14px;
}

.finder {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 18px;
  padding: 20px;
}

.finder__file {
  display: grid;
  justify-items: center;
  gap: 6px;
  width: 84px;
  font-size: 12px;
  text-align: center;
  transition: opacity .2s;
}

.finder__file.is-lifted {
  opacity: .35;
}

.finder__file i {
  display: grid;
  place-items: center;
  width: 54px;
  height: 64px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 0 0 1px #d6d6db, 0 2px 4px rgb(0 0 0 / .1);
  color: #8e8e93;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
}

.finder__file i.is-image {
  background: linear-gradient(160deg, #8ec5fc, #e0c3fc);
}

/* macOS panels */
.panel {
  position: absolute;
  top: 0;
  left: 50%;
  display: grid;
  gap: 12px;
  width: 420px;
  margin-left: -210px;
  padding: 16px 18px;
  border-radius: 0 0 14px 14px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 16px 40px rgb(0 0 0 / .25);
  animation: sheet .3s cubic-bezier(.2, .9, .3, 1);
}

.panel__list {
  display: grid;
  padding: 4px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
}

.panel__list > span {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  padding: 0 8px;
  border-radius: 5px;
}

.panel__list > span.is-on {
  background: #0a63e0;
  color: #fff;
}

.panel__list :deep(svg) {
  width: 14px;
  color: #3d8bf2;
}

.panel__list span.is-on :deep(svg) {
  color: #fff;
}

.panel footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.panel footer span {
  padding: 4px 14px;
  border-radius: 7px;
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong);
}

.panel footer .is-primary {
  background: #0a63e0;
  color: #fff;
}

.touchid {
  display: grid;
  justify-items: center;
  gap: 8px;
  width: 300px;
  padding: 22px 20px 16px;
  border-radius: 16px;
  background: rgb(246 246 248 / .97);
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .2), 0 24px 60px rgb(0 0 0 / .3);
  color: #1d1d1f;
  text-align: center;
  animation: pop .25s cubic-bezier(.2, .9, .3, 1.15);
}

.touchid__print {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff0f2;
  color: #ff3b5c;
}

.touchid__print :deep(svg) {
  width: 32px;
  height: 32px;
}

.touchid p {
  margin: 0;
  font-size: 13px;
}

.touchid small {
  color: #6e6e73;
}

.touchid footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  margin-top: 6px;
}

.touchid footer span {
  padding: 5px;
  border-radius: 7px;
  background: #e5e5ea;
}

.is-little {
  border-radius: 14px;
  background: var(--arx-window-top);
}

.little__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 10px;
  color: var(--arx-secondary);
}

.little__host {
  flex: 1;
  color: var(--arx-text);
  font-size: 12px;
  text-align: center;
}

.little__open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.little__open kbd {
  padding: 1px 4px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
  font: inherit;
}

.little__page {
  position: relative;
  flex: 1;
  margin: 0 6px 6px;
  overflow: hidden;
  border-radius: 8px;
}

.pip {
  position: absolute;
  overflow: hidden;
  border-radius: 12px;
  background: #111;
  box-shadow: 0 18px 50px rgb(0 0 0 / .4);
  color: #fff;
  transition: left .5s cubic-bezier(.3, .7, .2, 1), top .5s cubic-bezier(.3, .7, .2, 1), width .3s, height .3s;
  animation: pop .35s cubic-bezier(.2, .9, .3, 1.1);
}

.pip__video {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 30% 30%, #f05138, #7a1f12 70%);
}

.pip__video :deep(svg) {
  width: 30%;
  height: 30%;
  opacity: .9;
}

/* The controls over a light dim that darkens towards the top and bottom edges */
.pip::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgb(0 0 0 / .5), rgb(0 0 0 / .12) 30%, rgb(0 0 0 / .12) 60%, rgb(0 0 0 / .6));
  content: '';
}

.pip__close,
.pip__controls,
.pip__progress {
  position: absolute;
  z-index: 1;
}

.pip__close {
  top: 8px;
  left: 9px;
}

.pip__close :deep(svg) {
  width: 11px;
}

.pip__controls {
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 18px;
  translate: -50% -50%;
}

.pip__controls :deep(svg) {
  width: 14px;
}

.pip__controls :deep(svg:nth-child(2)) {
  width: 22px;
}

.pip__progress {
  right: 10px;
  bottom: 9px;
  left: 10px;
  height: 2px;
  border-radius: 1px;
  background: linear-gradient(90deg, #fff 30%, rgb(255 255 255 / .3) 30%);
}

.banner {
  position: absolute;
  top: 14px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  translate: -50% 0;
  border-radius: 12px;
  background: #1d1d1f;
  box-shadow: 0 10px 30px rgb(0 0 0 / .25);
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
  animation: pop .3s ease-out;
}

.banner :deep(svg) {
  width: 14px;
  color: #ffd60a;
}

.banner b {
  padding: 3px 10px;
  border-radius: 7px;
  background: rgb(255 255 255 / .15);
  font-weight: 600;
}

.onboarding {
  display: grid;
  justify-items: center;
  gap: 14px;
  width: 560px;
  text-align: center;
  animation: pop .35s ease-out;
}

.onboarding img {
  width: 84px;
  border-radius: 20px;
}

.onboarding h2 {
  margin: 0;
  font-size: 28px;
  letter-spacing: -.02em;
}

.onboarding p {
  margin: 0 0 8px;
  color: var(--arx-secondary);
  font-size: 15px;
}

.onboarding__button {
  min-width: 280px;
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong);
  font-size: 14px;
  font-weight: 500;
}

.onboarding__button.is-primary {
  background: var(--arx-accent);
  color: #fff;
}

.onboarding__browsers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
}

.onboarding__browsers span {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 16px 0;
  border-radius: 14px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
  font-weight: 500;
  transition: box-shadow .2s;
}

.onboarding__browsers span.is-on {
  box-shadow: 0 0 0 2.5px var(--arx-accent);
}

.onboarding__browsers i {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #fff;
  font-size: 18px;
  font-style: normal;
  font-weight: 800;
}

.onboarding__review {
  display: grid;
  width: 100%;
  border-radius: 14px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
  text-align: left;
}

.onboarding__review div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 16px;
  border-top: 1px solid var(--arx-hairline);
}

.onboarding__review div:first-child {
  border-top: 0;
}

.onboarding__review span {
  color: var(--arx-secondary);
}

.onboarding__done {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #34c759;
  color: #fff;
}

.onboarding__done :deep(svg) {
  width: 32px;
}

.download {
  position: absolute;
  top: 82px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 250px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 10px 28px rgb(0 0 0 / .18);
  animation: pop .25s ease-out;
}

.download :deep(svg) {
  width: 20px;
  color: #0a63e0;
}

.download span {
  display: grid;
  line-height: 1.3;
}

.download small {
  color: var(--arx-secondary);
  font-size: 11px;
}

@keyframes pop {
  from { opacity: 0; transform: scale(.95); }
}

@keyframes sheet {
  from { transform: translateY(-100%); }
}

@keyframes fade {
  from { opacity: 0; }
}

@keyframes blink {
  50% { opacity: 0; }
}

.prompt__icon i :deep(.iconify) { font-size: 14px; }
.plain__line :deep(.iconify) { flex: none; font-size: 16px; }


.touchid__print :deep(.iconify) { font-size: 32px; }
.panel__list :deep(.iconify) { flex: none; }
</style>
