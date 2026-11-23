<script setup lang="ts">
import type { ArxSiteMenu } from '~/utils/arxModel'

// The site menu under the address bar: two rows of buttons (one-shot actions,
// then the page's modes), the profile's extensions, this site's permissions,
// and the connection with its own menu.
const props = defineProps<{ menu: ArxSiteMenu }>()
const extensions = computed(() => props.menu.extensions ?? [{ name: 'Color Picker', color: '#3c7bf6' }, { name: 'Emoji', color: '#e3743c' }, { name: 'Units', color: '#2e9d6a' }])
</script>

<template>
  <div class="site-menu" data-arx="site-menu">
    <div class="site-menu__actions">
      <span title="Share"><Icon name="raycast:upload" /></span>
      <span title="Capture Area"><Icon name="raycast:camera" /></span>
      <span title="Capture Page"><Icon name="raycast:text-selection" /></span>
      <span title="Hide Element…"><Icon name="raycast:eye-disabled" /></span>
      <span title="Picture in Picture"><Icon name="raycast:app-window-active" /></span>
      <span title="Reading Mode"><Icon name="raycast:blank-document" /></span>
      <span :class="{ 'is-on': menu.webKit }" title="Open in WebKit" data-arx="site-menu:webkit"><Icon name="raycast:compass" /></span>
      <span :class="{ 'is-on': menu.darkPage }" title="Dark page" data-arx="site-menu:dark-page"><Icon name="raycast:moon" /></span>
    </div>
    <p class="site-menu__heading">Extensions<Icon name="raycast:plus" /></p>
    <div class="site-menu__extensions">
      <i v-for="extension in extensions" :key="extension.name" :style="{ '--c': extension.color }" :data-arx="`extension:${extension.name}`">{{ extension.name[0] }}<u v-if="extension.dot" /></i>
    </div>
    <div v-if="menu.popup" class="site-menu__popup" data-arx="extension-popup">
      <span><i :style="{ background: menu.popup.color }">{{ menu.popup.name[0] }}</i><b>{{ menu.popup.name }}</b><Icon name="raycast:arrow-ne" data-arx="extension-popup:window" /></span>
      <small>Locked</small>
    </div>
    <p class="site-menu__heading">Site Settings</p>
    <div class="site-menu__rows">
      <div v-if="menu.blocking !== undefined" class="site-menu__row" data-arx="blocking">
        <Icon name="raycast:shield-01" /><span>Block ads and trackers</span>
        <small v-if="!menu.blocking">Off for this site</small>
        <span class="site-menu__switch" :class="{ 'is-on': menu.blocking }" data-arx="blocking:switch"><i /></span>
      </div>
      <div v-for="row in menu.permissions" :key="row.label" class="site-menu__row">
        <Icon :name="`raycast:${row.icon}`" /><span>{{ row.label }}</span>
        <span class="popup" :class="{ 'is-set': row.set }" :data-arx="`permission:${row.label}`">{{ row.value }}<Icon name="raycast:chevron-up-down" /></span>
      </div>
    </div>
    <div v-if="menu.confirmClear" class="site-menu__confirm">
      <b>Clear cookies for {{ menu.host }}?</b>
      <p>Signs you out of {{ menu.host }} and its subdomains in Personal, and removes the data they store.</p>
      <div><span>Cancel</span><span class="is-danger" data-arx="confirm-clear">Clear</span></div>
    </div>
    <footer class="site-menu__footer">
      <Icon name="raycast:lock" /><span><b>Secure</b> {{ menu.host }}</span>
      <Icon class="site-menu__more" name="raycast:ellipsis" data-arx="site-menu:more" />
    </footer>
  </div>
</template>

<style scoped>
.site-menu {
  position: absolute;
  top: 80px;
  left: 14px;
  width: 330px;
  padding: 12px;
  border-radius: 16px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 18px 46px rgb(0 0 0 / .22);
  color: var(--arx-text);
  font-size: 13px;
  animation: pop .22s cubic-bezier(.2, .9, .3, 1.15);
  transform-origin: 240px 0;
}

/* Raised keys, two grid columns each (DEV-1333): a denser glass, a lip along the
   bottom and a contact shadow; a switch that's on is tinted with the accent. */
.site-menu__actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.site-menu__actions > span {
  display: grid;
  place-items: center;
  height: 40px;
  border-radius: 13.6px;
  background: linear-gradient(var(--arx-glass), color-mix(in srgb, var(--arx-glass) 88%, var(--arx-text) 4%));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .35), inset 0 -1px 0 rgb(0 0 0 / .1), 0 0 0 .5px var(--arx-hairline), 0 1px 1px rgb(0 0 0 / .12), 0 2px 8px rgb(0 0 0 / .1);
}

.site-menu__actions > span.is-on {
  color: var(--arx-accent);
  background: color-mix(in srgb, var(--arx-accent) 20%, var(--arx-glass));
}

.site-menu__actions :deep(svg) {
  width: 17px;
}

.site-menu__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 2px 8px;
  color: var(--arx-secondary);
  font-size: 12px;
  font-weight: 600;
}

.site-menu__heading :deep(svg) {
  width: 13px;
}

.site-menu__extensions {
  display: flex;
  gap: 8px;
}

.site-menu__extensions i {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--c);
  color: #fff;
  font-style: normal;
  font-weight: 700;
}

.site-menu__rows {
  display: grid;
  gap: 2px;
}

.site-menu__row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 32px;
  padding: 0 4px;
}

.site-menu__row > :deep(svg) {
  width: 15px;
  color: var(--arx-secondary);
}

.popup {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 3px 6px 3px 9px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--arx-text) 6%, transparent);
  color: var(--arx-secondary);
  font-size: 12px;
}

.popup.is-set {
  color: var(--arx-text);
  font-weight: 600;
}

.popup :deep(svg) {
  width: 10px;
}

.site-menu__confirm {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
  animation: pop .2s ease-out;
}

.site-menu__confirm p {
  margin: 4px 0 10px;
  color: var(--arx-secondary);
  font-size: 12px;
}

.site-menu__confirm div {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.site-menu__confirm span {
  padding: 4px 12px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--arx-text) 7%, transparent);
}

.site-menu__confirm .is-danger {
  background: #e5484d;
  color: #fff;
}

.site-menu__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 4px 0;
  border-top: 1px solid var(--arx-hairline);
  color: var(--arx-secondary);
}

.site-menu__footer b {
  color: var(--arx-text);
  font-weight: 600;
}

.site-menu__footer :deep(svg) {
  width: 13px;
}

.site-menu__more {
  margin-left: auto;
}

@keyframes pop {
  from { opacity: 0; transform: scale(.95); }
}

.site-menu__extensions i {
  position: relative;
}

.site-menu__extensions u {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f08c2e;
  box-shadow: 0 0 0 1.5px var(--arx-command);
}

.site-menu__row small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.site-menu__switch {
  position: relative;
  flex: none;
  width: 26px;
  height: 15px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-text) 18%, transparent);
  transition: background .2s;
}

.site-menu__switch i {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / .3);
  transition: left .2s;
}

.site-menu__switch.is-on { background: #34c759; }
.site-menu__switch.is-on i { left: 13px; }

/* An extension's own popup, under its tile. */
.site-menu__popup {
  position: absolute;
  top: 150px;
  left: 14px;
  z-index: 2;
  display: grid;
  gap: 8px;
  width: 250px;
  padding: 12px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .2), 0 12px 30px rgb(0 0 0 / .25);
  color: #1d1d1f;
  font-size: 12px;
}

.site-menu__popup > span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.site-menu__popup i {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: #fff;
  font-style: normal;
  font-weight: 700;
}

.site-menu__popup b {
  flex: 1;
  color: inherit;
}

.site-menu__popup :deep(svg) {
  width: 14px;
}

.site-menu__popup small {
  color: #6e6e73;
}

</style>
