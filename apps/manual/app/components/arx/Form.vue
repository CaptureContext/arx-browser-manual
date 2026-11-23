<script setup lang="ts">
import type { ArxForm } from '~/utils/arxModel'

// A settings-style surface, as Arx builds its sheets, popovers and assistants: a header
// bar or a centered heading, sections of rows on cards, and buttons along the bottom.
// Targets are `row:<label>`, `switch:<label>`, `act:<a row's button or link>`,
// `slider:<label>`, `swatch:<label>:<index>`, `tile:<name>`, `form:<button>`, `form-close`.
defineProps<{ form: ArxForm }>()
</script>

<template>
  <section class="form" :class="[`is-${form.chrome ?? 'sheet'}`]" :data-arx="`form-box:${form.id}`">
    <span v-if="form.chrome === 'window'" class="form__lights"><i /><i /><i /></span>
    <header v-if="form.title" class="form__bar">
      <span v-if="form.close" class="form__close" data-arx="form-close"><Icon name="raycast:xmark" /></span>
      <ArxFavicon v-if="form.icon" :icon="form.icon" :size="30" />
      <span class="form__titles"><b>{{ form.title }}</b><small v-if="form.subtitle">{{ form.subtitle }}</small></span>
      <span v-if="form.trailing" class="form__capsule" :data-arx="`act:${form.trailing}`">{{ form.trailing }}</span>
      <span v-if="form.tools" class="form__tools">
        <template v-for="tool in form.tools" :key="tool.id"><span v-if="tool.spinning" class="form__spinner" /><Icon v-else :name="`raycast:${tool.icon}`" :data-arx="`tool:${tool.id}`" /></template>
      </span>
    </header>
    <div class="form__split" :class="{ 'has-aside': form.aside }">
    <div v-if="form.aside" class="form__aside">
      <div v-for="item in form.aside" :key="item.title" class="form__item" :class="{ 'is-selected': item.selected }" :data-arx="`item:${item.title}`">
        <i :style="{ background: item.color }">{{ item.title[0] }}</i>
        <span><b>{{ item.title }}</b><small>{{ item.detail }}</small><small v-if="item.warning" class="is-orange">{{ item.warning }}</small></span>
        <Icon v-if="item.mark" name="raycast:arrow-up-circle-filled" class="form__arrow" :data-arx="`mark:${item.title}`" />
      </div>
    </div>
    <div class="form__body">
      <div v-if="form.hero" class="form__hero">
        <span class="form__brand"><img src="/brand/arx-icon.png" alt="">Arx</span>
        <h2>{{ form.hero.title }}</h2>
        <p>{{ form.hero.message }}</p>
      </div>
      <div v-if="form.tiles" class="form__tiles">
        <span v-for="tile in form.tiles" :key="tile.name" class="form__tile" :class="{ 'is-on': tile.on, 'is-off': tile.disabled }" :data-arx="`tile:${tile.name}`">
          <i :style="{ background: tile.color }">{{ tile.name[0] }}</i><b>{{ tile.name }}</b><small>{{ tile.status }}</small>
        </span>
      </div>
      <p v-if="form.lead" class="form__lead">{{ form.lead }}</p>
      <template v-for="(section, at) in form.sections" :key="at">
        <h4 v-if="section.header">{{ section.header }}<span v-if="section.action" class="form__capsule" :data-arx="`act:${section.action}`">{{ section.action }}</span></h4>
        <p v-if="section.caption" class="form__caption">{{ section.caption }}</p>
        <div v-if="section.editor" class="form__card is-editor"><ArxThemeEditor :editor="section.editor" :wide="form.chrome !== 'popover'" /></div>
        <div v-if="section.rows.length" class="form__card" :class="{ 'is-narrow': form.hero }">
          <div
            v-for="row in section.rows"
            :key="row.label"
            class="form__row"
            :class="{ 'is-dim': row.dim, 'is-selected': row.selected, 'is-new': row.fresh }"
            :data-arx="`row:${row.label}`"
          >
            <span v-if="row.spinner" class="form__spinner" />
            <span v-if="row.check !== undefined" class="form__check" :class="{ 'is-on': row.check }"><Icon v-if="row.check" name="raycast:check" /></span>
            <ArxFavicon v-if="row.favicon" :icon="row.favicon" :size="20" />
            <Icon v-else-if="row.icon" :name="`raycast:${row.icon}`" class="form__icon" :class="row.tone ? `is-${row.tone}` : ''" />
            <span class="form__text">
              <span :class="{ 'is-mono': row.mono }">{{ row.label }}</span>
              <small v-if="row.detail">{{ row.detail }}</small>
              <span v-if="row.progress !== undefined" class="form__progress"><i :style="{ width: `${row.progress * 100}%` }" /></span>
            </span>
            <span v-if="row.field !== undefined" class="form__field" :class="{ 'is-focused': row.focused, 'is-empty': !row.field }" :data-arx="`field:${row.label}`">{{ row.field || row.placeholder }}<i v-if="row.focused" /></span>
            <span v-if="row.swatches" class="form__swatches">
              <i v-for="(swatch, index) in row.swatches" :key="index" :class="{ 'is-on': swatch.on }" :style="{ background: swatch.color }" :data-arx="`swatch:${row.label}:${index}`" />
            </span>
            <span v-if="row.slider !== undefined" class="form__slider" :data-arx="`slider:${row.label}`"><i :style="{ width: `${row.slider * 100}%` }" /><b :style="{ left: `${row.slider * 100}%` }" /></span>
            <span v-if="row.value" class="form__value" :class="row.tone ? `is-${row.tone}` : ''">{{ row.value }}</span>
            <span v-if="row.mark" class="form__mark" :data-arx="`mark:${row.label}`">!</span>
            <span v-if="row.link" class="form__link" :data-arx="`act:${row.link}`">{{ row.link }}</span>
            <span v-if="row.popup" class="form__popup" :data-arx="`popup:${row.label}`">{{ row.popup }}<Icon name="raycast:chevron-up-down" /></span>
            <span v-if="row.button" class="form__capsule" :data-arx="`act:${row.button}`">{{ row.button }}</span>
            <span v-if="row.toggle !== undefined" class="form__switch" :class="{ 'is-on': row.toggle }" :data-arx="`switch:${row.label}`"><i /></span>
          </div>
        </div>
        <p v-if="section.footer" class="form__footer" :class="{ 'is-narrow': form.hero }">{{ section.footer }}</p>
      </template>
      <p v-if="form.note" class="form__note">{{ form.note }}</p>
    </div>
    </div>
    <footer v-if="form.buttons?.length" class="form__buttons">
      <span
        v-for="button in form.buttons"
        :key="button.label"
        :class="{ 'is-primary': button.primary, 'is-danger': button.danger, 'is-left': button.left, 'is-off': button.disabled, 'is-plain': button.plain }"
        :data-arx="`form:${button.label}`"
      >{{ button.label }}<kbd v-if="button.hint">{{ button.hint }}</kbd></span>
    </footer>
  </section>
</template>

<style scoped>
.form {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 24px 70px rgb(0 0 0 / .3);
  color: var(--arx-text);
  font-size: 13px;
  animation: form-in .26s cubic-bezier(.2, .9, .3, 1.1);
}

.form.is-popover {
  border-radius: 12px;
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 12px 36px rgb(0 0 0 / .22);
}

.form.is-window {
  padding-top: 28px;
  border-radius: 12px;
}

.form__lights {
  position: absolute;
  top: 9px;
  left: 12px;
  display: flex;
  gap: 8px;
}

.form__lights i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f57;
}

.form__lights i:nth-child(2) { background: #febc2e; }
.form__lights i:nth-child(3) { background: #28c840; }

.form__bar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 0 18px;
}

.form__close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--arx-text) 7%, transparent);
}

.form__close :deep(svg) {
  width: 12px;
}

.form__titles {
  display: grid;
  flex: 1;
  line-height: 1.25;
}

.form__titles b {
  font-size: 15px;
}

.form__titles small,
.form__row small,
.form__footer,
.form__lead,
.form__note {
  color: var(--arx-secondary);
}

.form__titles small,
.form__row small,
.form__footer {
  font-size: 11px;
}

.form__split {
  display: flex;
  flex: 1;
  min-height: 0;
}

.form__aside {
  flex: none;
  width: 210px;
  margin: 4px 0 16px 18px;
  padding: 4px;
  border-right: 1px solid var(--arx-hairline);
}

.form__item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  border-radius: 9px;
}

.form__item.is-selected {
  background: color-mix(in srgb, var(--arx-text) 9%, transparent);
}

.form__item i {
  display: grid;
  flex: none;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  color: #fff;
  font-style: normal;
  font-weight: 700;
}

.form__item > span:not(.iconify) {
  display: grid;
  flex: 1;
  line-height: 1.3;
}

.form__item small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.form__item small.is-orange {
  color: #e8833a;
}

.form__arrow {
  flex: none;
  width: 16px;
  height: 16px;
  color: #f08c2e;
}

.form__tools {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--arx-secondary);
}

.form__tools :deep(svg) {
  width: 16px;
  height: 16px;
}

.form__caption {
  margin: -3px 0 8px;
  color: var(--arx-secondary);
  font-size: 11px;
}

.form__card.is-editor {
  margin-bottom: 0;
}

.is-popover .form__card.is-editor {
  background: none;
  box-shadow: none;
}

.form__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 4px 24px 16px;
  overflow: hidden;
}

.is-popover .form__body {
  padding: 4px 14px 12px;
}

.form__hero {
  display: grid;
  justify-items: center;
  gap: 4px;
  padding-top: 6px;
  text-align: center;
}

.form__brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.form__brand img {
  width: 22px;
  border-radius: 6px;
}

.form__hero h2 {
  margin: 4px 0 0;
  color: inherit;
  font-size: 22px;
  font-weight: 600;
}

.form__hero p {
  max-width: 440px;
  margin: 0;
  color: var(--arx-secondary);
}

.form__tiles {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 14px 0 12px;
}

.form__tile {
  display: grid;
  justify-items: center;
  gap: 2px;
  width: 100px;
  font-size: 12px;
}

.form__tile i {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-bottom: 3px;
  border-radius: 12px;
  color: #fff;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  outline: 5px solid transparent;
}

.form__tile.is-on i {
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--arx-text) 8%, transparent), 0 0 0 7px var(--arx-accent);
}

.form__tile b {
  font-weight: 500;
}

.form__tile.is-on b {
  font-weight: 650;
}

.form__tile small {
  color: var(--arx-secondary);
  font-size: 10.5px;
}

.form__tile.is-off {
  opacity: .45;
}

.form__lead {
  margin: 4px 0 0;
  line-height: 1.45;
}

h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 7px;
  color: inherit;
  font-size: 13px;
  font-weight: 650;
}

.form__card {
  border-radius: 10px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
}

h4 + .form__card {
  margin-top: 0;
}

.form__card + .form__card,
.form__lead + .form__card,
.form__footer + .form__card {
  margin-top: 12px;
}

.form__card.is-narrow,
.form__footer.is-narrow {
  width: 420px;
  margin-right: auto;
  margin-left: auto;
}

.form__row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 6px 14px;
  border-top: 1px solid var(--arx-hairline);
  transition: background .2s;
}

.is-popover .form__row {
  min-height: 36px;
  padding: 4px 12px;
}

.form__row:first-child {
  border-top: 0;
}

.form__row.is-dim {
  opacity: .5;
}

.form__row.is-selected {
  background: color-mix(in srgb, var(--arx-accent) 14%, transparent);
}

.form__row.is-new {
  animation: form-row .35s ease-out;
}

.form__text {
  display: grid;
  flex: 1;
  min-width: 0;
  line-height: 1.3;
}

.is-mono {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px;
}

.form__icon {
  flex: none;
  width: 16px;
  color: var(--arx-secondary);
}

.is-orange { color: #e8833a; }
.is-green { color: #2da44e; }
.is-red { color: #e5484d; }

.form__value {
  flex: none;
  color: var(--arx-secondary);
}

.form__value.is-orange { color: #e8833a; }
.form__value.is-green { color: #2da44e; }

.form__link {
  flex: none;
  color: var(--arx-accent);
}

.form__capsule {
  flex: none;
  padding: 4px 12px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--arx-text) 7%, transparent);
  font-size: 12px;
  font-weight: 500;
}

.form__popup {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 3px 7px 3px 10px;
  border-radius: 7px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong);
}

.form__popup :deep(svg) {
  width: 10px;
}

.form__field {
  flex: none;
  min-width: 150px;
  padding: 4px 9px;
  border-radius: 7px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
}

.form__field.is-empty {
  color: color-mix(in srgb, var(--arx-text) 40%, transparent);
}

.form__field.is-focused {
  box-shadow: 0 0 0 2px rgb(10 99 224 / .7);
}

.form__field i {
  display: inline-block;
  width: 1.5px;
  height: 14px;
  margin-left: 1px;
  vertical-align: -2px;
  background: #0a63e0;
}

.form__switch {
  position: relative;
  flex: none;
  width: 32px;
  height: 19px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--arx-text) 18%, transparent);
  transition: background .2s;
}

.form__switch i {
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

.form__switch.is-on {
  background: #34c759;
}

.form__switch.is-on i {
  left: 15px;
}

.form__check {
  display: grid;
  flex: none;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
  color: #fff;
}

.form__check.is-on {
  background: #0a63e0;
  box-shadow: none;
}

.form__check :deep(svg) {
  width: 11px;
}

.form__mark {
  display: grid;
  flex: none;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f08c2e;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.form__spinner {
  flex: none;
  width: 14px;
  height: 14px;
  border: 2px solid color-mix(in srgb, var(--arx-text) 18%, transparent);
  border-top-color: var(--arx-secondary);
  border-radius: 50%;
  animation: form-spin .8s linear infinite;
}

.form__progress {
  height: 5px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: color-mix(in srgb, var(--arx-text) 12%, transparent);
}

.form__progress i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--arx-accent);
  transition: width .5s linear;
}

.form__slider {
  position: relative;
  flex: none;
  width: 150px;
  height: 4px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--arx-text) 14%, transparent);
}

.form__slider i {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 2px;
  background: var(--arx-accent);
}

.form__slider b {
  position: absolute;
  top: -7px;
  width: 18px;
  height: 18px;
  margin-left: -9px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .15), 0 1px 3px rgb(0 0 0 / .3);
}

.form__swatches {
  display: flex;
  flex: none;
  gap: 7px;
}

.form__swatches i {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .2);
}

.form__swatches i.is-on {
  box-shadow: 0 0 0 2px var(--arx-command), 0 0 0 4px var(--arx-text);
}

.form__footer {
  margin: 7px 2px 0;
  line-height: 1.4;
}

.form__note {
  width: 420px;
  margin: 12px auto 0;
  text-align: center;
  line-height: 1.4;
}

.form__buttons {
  display: flex;
  flex: none;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
}

.form__buttons span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 9px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 1px 1px rgb(0 0 0 / .06);
  font-weight: 500;
}

.form__buttons .is-primary {
  background: #0a63e0;
  color: #fff;
}

.form__buttons .is-danger {
  background: #e5484d;
  color: #fff;
}

.form__buttons .is-plain {
  background: none;
  box-shadow: none;
  color: var(--arx-secondary);
}

.form__buttons .is-left {
  margin-right: auto;
}

.form__buttons .is-off {
  opacity: .45;
}

.form__buttons kbd {
  font: inherit;
  font-size: 11px;
  opacity: .7;
}

@keyframes form-in {
  from { opacity: 0; transform: scale(.96); }
}

@keyframes form-row {
  from { opacity: 0; transform: translateY(-6px); }
}

@keyframes form-spin {
  to { transform: rotate(360deg); }
}

/* Inside the Settings window: the pane itself, with no surface of its own. */
.form.is-plain {
  height: 100%;
  border-radius: 0;
  background: none;
  box-shadow: none;
  animation: none;
}

.form.is-plain .form__bar {
  min-height: 64px;
  padding: 0;
}

.form.is-plain .form__body {
  padding: 0;
}


/* The welcome window fits six rows under its heading and browser tiles. */
.form__card.is-narrow .form__row {
  min-height: 34px;
  padding: 3px 12px;
}

.form__card.is-narrow .form__row small {
  line-height: 1.25;
}

/* Icons are drawn at their font size. */
.form__tools :deep(.iconify) { font-size: 16px; }
.form__icon { font-size: 16px; }
.form__close :deep(.iconify) { font-size: 12px; }
.form__arrow { font-size: 16px; }

</style>
