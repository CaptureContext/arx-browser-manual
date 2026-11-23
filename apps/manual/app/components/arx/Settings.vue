<script setup lang="ts">
import type { ArxSettings } from '~/utils/arxModel'

// Arx's Settings window (900 × 712) on a profile's page, scrolled to its data,
// with the Site Settings and Clear Browsing Data sheets.
const props = defineProps<{ settings: ArxSettings }>()
const paneLabel = computed(() => props.settings.pane === 'custom' ? props.settings.custom?.pane : ({ profile: 'Profiles', links: 'Links', passwords: 'Profiles', agents: 'Advanced', developer: 'Developer', applinks: 'Links', custom: '' })[props.settings.pane])
const passwords = computed(() => props.settings.passwords.filter(row => !props.settings.passwordQuery || row.site.includes(props.settings.passwordQuery)))

const panes = [
  { label: 'Arx', color: '#5a8dee', icon: 'globe-01' },
  { label: 'General', color: '#8e8e93', icon: 'cog' },
  { label: 'Profiles', color: '#7b61ff', icon: 'person' },
  { label: 'Assistant', color: '#d65db1', icon: 'stars' },
  { label: 'Links', color: '#34aadc', icon: 'link' },
  { label: 'Shortcuts', color: '#8e8e93', icon: 'command-symbol' },
  { label: 'Appearance & Sound', color: '#ff6b5b', icon: 'sun' },
  { label: 'Developer', color: '#e8833a', icon: 'hammer' },
  { label: 'Advanced', color: '#8e8e93', icon: 'app-window-list' },
]
</script>

<template>
  <div class="settings" data-arx="settings">
    <aside class="settings__sidebar">
      <span class="lights"><i /><i /><i /></span>
      <span class="settings__search"><Icon name="raycast:magnifying-glass" />Search…</span>
      <span v-for="pane in panes" :key="pane.label" class="settings__pane" :class="{ 'is-on': pane.label === paneLabel }" :data-arx="`pane:${pane.label}`">
        <i :style="{ background: pane.color }"><Icon :name="`raycast:${pane.icon}`" /></i>{{ pane.label }}
      </span>
    </aside>
    <main class="settings__main">
      <template v-if="settings.pane === 'profile'">
        <header><Icon name="raycast:chevron-left" /><span><b>Personal</b><small>Profiles</small></span></header>
        <section class="settings__scroll" :style="{ transform: `translateY(${-settings.scroll}px)` }">
          <h3>Search</h3>
          <div class="group"><div class="line"><span>Search engine</span><span class="popup">Google<Icon name="raycast:chevron-up-down" /></span></div></div>
          <h3>Tabs</h3>
          <div class="group">
            <div class="line"><span>Automatically archive tabs</span><span class="popup">Never<Icon name="raycast:chevron-up-down" /></span></div>
            <div class="line" data-arx="setting:full-url"><span>Show the full URL in the toolbar<small>Shows the whole address instead of the site’s name.</small></span><span class="switch" :class="{ 'is-on': settings.fullUrl }"><i /></span></div>
          </div>
          <h3>Downloads</h3>
          <div class="group">
            <div class="line"><span>Save files to</span><em><Icon name="raycast:folder" />{{ settings.downloadsFolder }}</em><span class="button" data-arx="setting:change-folder">Change…</span></div>
            <div class="line" data-arx="setting:ask"><span>Ask where to save each file<small>A save panel opens before each download starts.</small></span><span class="switch" :class="{ 'is-on': settings.askWhereToSave }"><i /></span></div>
          </div>
          <h3>Browsing History</h3>
          <div class="group"><div class="line"><span>Clear History</span><span class="button is-danger">Clear History</span></div></div>
          <h3>Your Data and Settings</h3>
          <div class="group">
            <div class="line is-link" data-arx="settings:site"><Icon name="raycast:shield-01" /><span>Site Settings</span><Icon name="raycast:chevron-right" /></div>
            <div class="line is-link" data-arx="settings:passwords"><Icon name="raycast:lock" /><span>Passwords</span><Icon name="raycast:chevron-right" /></div>
            <div class="line is-link" data-arx="settings:extensions"><Icon name="raycast:box" /><span>Extensions</span><Icon name="raycast:chevron-right" /></div>
            <div class="line is-link" data-arx="settings:clear"><Icon name="raycast:trash" /><span>Clear browsing data</span><Icon name="raycast:chevron-right" /></div>
          </div>
        </section>
      </template>

      <template v-else-if="settings.pane === 'custom' && settings.custom">
        <div class="settings__custom" :style="{ transform: `translateY(${-(settings.custom.scroll ?? 0)}px)` }">
          <ArxForm :form="{ id: 'settings', chrome: 'plain', title: settings.custom.title, subtitle: settings.custom.subtitle, close: false, sections: settings.custom.sections }" />
        </div>
      </template>

      <template v-else-if="settings.pane === 'applinks' && settings.appLinks">
        <header><span><b>Links</b><small>Where links open</small></span><span class="settings__add" data-arx="applinks:new"><Icon name="raycast:plus" /></span></header>
        <h3>App Links</h3>
        <div v-if="settings.appLinks.card" class="group handler">
          <div class="line">
            <span class="handler__app" :class="{ 'is-set': settings.appLinks.saved }" data-arx="applinks:app"><Icon v-if="!settings.appLinks.saved" name="raycast:plus-circle" /><template v-else>{{ settings.appLinks.name[0] }}</template></span>
            <span class="handler__field" :class="{ 'is-empty': !settings.appLinks.name }"><small>Name</small>{{ settings.appLinks.name || 'Claude' }}</span>
            <span class="handler__field" :class="{ 'is-empty': !settings.appLinks.scheme }"><small>Scheme</small>{{ settings.appLinks.scheme || 'claude' }}</span>
            <Icon name="raycast:minus-circle-filled" class="handler__remove" />
          </div>
          <div class="line">
            <span class="handler__field is-empty"><small>Host</small>Any host</span>
            <span class="handler__field is-empty"><small>Path prefix</small>Any path</span>
          </div>
          <div v-if="settings.appLinks.scheme" class="line"><code>Catches {{ settings.appLinks.scheme }}://…</code></div>
          <template v-if="settings.appLinks.saved">
            <div class="line"><span class="popup" data-arx="applinks:add-profile">Add profile<Icon name="raycast:chevron-up-down" /></span><i class="handler__gap" /><small>Enabled</small><span class="switch is-on"><i /></span></div>
            <template v-for="route in settings.appLinks.routes" :key="route.title">
              <div class="line is-new"><Icon name="raycast:arrow-right" /><span class="line__text">{{ route.title }}</span><span class="popup" :data-arx="`route:${route.title}`">{{ route.handling }}<Icon name="raycast:chevron-up-down" /></span></div>
              <div v-if="route.script" class="line handler__script">
                <span class="handler__code" :class="{ 'is-empty': !route.script.text, 'is-focused': route.script.focused }" data-arx="applinks:script">{{ route.script.text || 'fxclaude open-url work "$1"' }}</span>
                <small v-if="route.script.focused && !route.script.text">Tab to use the example</small>
                <small v-else>The link is <code>$1</code>. Quote it.</small>
              </div>
            </template>
          </template>
          <div v-if="settings.appLinks.picker" class="handler__picker" data-arx="applinks:picker">
            <span class="handler__search"><Icon name="raycast:magnifying-glass" /><template v-if="settings.appLinks.picker.query">{{ settings.appLinks.picker.query }}<i /></template><em v-else>Search apps</em></span>
            <small>Apps with Links</small>
            <span
              v-for="(app, index) in settings.appLinks.picker.apps.filter(app => app.name.toLowerCase().includes(settings.appLinks!.picker!.query.toLowerCase()))"
              :key="app.name"
              class="handler__option"
              :class="{ 'is-on': index === settings.appLinks.picker.highlighted }"
            ><i :style="{ background: app.color }">{{ app.name[0] }}</i>{{ app.name }}<code>{{ app.scheme }}://</code></span>
            <span class="handler__choose">Choose…</span>
          </div>
        </div>
        <p v-else class="settings__intro">No handlers. Links for other apps ask with Chrome's dialog.</p>
      </template>

      <template v-else-if="settings.pane === 'links'">
        <header><span><b>Links</b><small>Where links open</small></span></header>
        <h3>Air Traffic Control<span class="button" data-arx="setting:new-route">New Route…</span></h3>
        <div class="group">
          <div v-for="route in settings.routes" :key="route.host" class="line is-new"><Icon name="raycast:globe-01" /><span class="line__text">{{ route.host }}<small>Opens in {{ route.space }}, {{ route.open }}</small></span><span class="switch is-on"><i /></span></div>
        </div>
        <h3>Test a link</h3>
        <div class="group">
          <div class="line" data-arx="setting:tester"><span class="field-inline">{{ settings.tester.text || 'Paste a link…' }}</span></div>
          <div v-if="settings.tester.result" class="line is-new"><Icon name="raycast:arrow-right" /><span class="line__text">{{ settings.tester.result }}</span></div>
        </div>
      </template>

      <template v-else-if="settings.pane === 'passwords'">
        <header><Icon name="raycast:chevron-left" /><span><b>Passwords</b><small>Profiles › Personal</small></span>
          <span class="search" :class="{ 'is-open': settings.passwordQuery }" data-arx="passwords:search"><Icon name="raycast:magnifying-glass" />{{ settings.passwordQuery }}</span>
        </header>
        <div class="group">
          <div v-for="row in passwords" :key="row.site" class="line is-new" :data-arx="`password:${row.site}`">
            <Icon name="raycast:key" /><span class="line__text">{{ row.site }}<small>{{ row.user }}</small></span>
            <code>{{ row.shown ? 'river-maple-42!' : '••••••••••' }}</code>
            <Icon name="raycast:ellipsis" :data-arx="`password-more:${row.site}`" />
          </div>
        </div>
        <div class="settings__actions"><span class="button" data-arx="passwords:add">Add Password…</span><span class="button" data-arx="passwords:import">Import…</span></div>
      </template>

      <template v-else-if="settings.pane === 'agents'">
        <header><span><b>Local assistants (MCP)</b><small>Advanced</small></span></header>
        <p class="settings__intro">Apps on this Mac that can use Arx through its MCP server, each with its own grant.</p>
        <div class="group">
          <div v-for="agent in settings.agents" :key="agent.name" class="line is-link is-new" :data-arx="`agent:${agent.name}`"><Icon name="raycast:terminal" /><span class="line__text">{{ agent.name }}<small>{{ agent.detail }}</small></span><Icon name="raycast:chevron-right" /></div>
        </div>
      </template>

      <template v-else>
        <header><span><b>Developer</b><small>For building web pages</small></span></header>
        <div class="group">
          <div class="line" data-arx="setting:developer-mode"><span>Developer mode<small>DevTools, the developer header on local pages, and pages that explain local errors.</small></span><span class="switch" :class="{ 'is-on': settings.developerMode }"><i /></span></div>
          <div class="line"><span>Highlight local tabs</span><span class="switch is-on"><i /></span></div>
          <div class="line"><span>Developer header on local pages</span><span class="switch" :class="{ 'is-on': settings.developerMode }"><i /></span></div>
        </div>
      </template>
    </main>

    <Transition name="sheet">
      <div v-if="settings.sheet" class="dim">
        <div v-if="settings.sheet === 'site'" class="sheet">
          <header class="sheet__header"><span class="sheet__close"><Icon name="raycast:xmark" /></span><span><b>Site Settings</b><small>Profiles › Personal</small></span></header>
          <p class="sheet__intro">Permissions and page zoom for Personal. Other profiles keep their own.</p>
          <h4>By Default</h4>
          <div class="group">
            <div v-for="row in settings.defaults" :key="row.label" class="line"><span>{{ row.label }}</span><span class="popup" :data-arx="`default:${row.label}`">{{ row.value }}<Icon name="raycast:chevron-up-down" /></span></div>
          </div>
          <h4>Sites<span class="button" data-arx="add-site">Add Site…</span></h4>
          <div v-if="settings.sites.length" class="group">
            <div v-for="site in settings.sites" :key="site.host" class="line is-new">
              <span>https://{{ site.host }}<small>{{ site.permission }}</small></span><span class="popup">{{ site.value }}<Icon name="raycast:chevron-up-down" /></span>
            </div>
          </div>
          <p v-else class="sheet__empty">No site has its own permissions yet.</p>
          <h4>Page Zoom<span class="button">Add Site…</span></h4>
          <div class="group"><div class="line"><span>Default zoom</span><span class="popup" data-arx="default-zoom">{{ settings.defaultZoom }}<Icon name="raycast:chevron-up-down" /></span></div></div>

          <Transition name="sheet">
            <div v-if="settings.addSite" class="dim is-inner">
              <div class="sheet is-small">
                <b>Add a Site Permission</b>
                <span class="field" :class="{ 'is-empty': !settings.addSite.text }"><small>Site</small>{{ settings.addSite.text || 'example.com' }}<i v-if="settings.addSite.text" /></span>
                <div class="group">
                  <div class="line"><span>Permission</span><span class="popup">Camera<Icon name="raycast:chevron-up-down" /></span></div>
                  <div class="line"><span>Setting</span><span class="popup">Allow<Icon name="raycast:chevron-up-down" /></span></div>
                </div>
                <div class="sheet__buttons"><span class="button">Cancel</span><span class="button is-primary" data-arx="add-site:add">Add</span></div>
              </div>
            </div>
          </Transition>
        </div>

        <div v-else class="sheet">
          <header class="sheet__header is-plain"><span><b>Clear Browsing Data</b><small>Removes data from the Personal profile on this Mac.</small></span></header>
          <div class="group"><div class="line"><span>Time range</span><span class="popup" data-arx="range">{{ settings.range }}<Icon name="raycast:chevron-up-down" /></span></div></div>
          <div class="checks">
            <div v-for="row in settings.rows" :key="row.label" class="check" :data-arx="`clear:${row.label}`">
              <i :class="{ 'is-on': row.checked }"><Icon v-if="row.checked" name="raycast:check" /></i>
              <span><b>{{ row.label }}</b><small>{{ row.detail }}</small><small class="count">{{ row.count }}</small></span>
            </div>
          </div>
          <p class="sheet__note">Saved passwords aren’t cleared here. Manage them in Passwords.</p>
          <div class="sheet__buttons"><span class="button">Cancel</span><span class="button is-destructive" data-arx="clear-data">Clear Data</span></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.settings {
  position: absolute;
  top: 44px;
  left: 190px;
  display: flex;
  width: 900px;
  height: 712px;
  overflow: hidden;
  border-radius: 12px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px rgb(0 0 0 / .25), 0 24px 70px rgb(0 0 0 / .32);
  color: var(--arx-text);
  font-size: 13px;
}

.lights {
  display: flex;
  gap: 8px;
  margin: 2px 0 14px 4px;
}

.lights i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f57;
}

.lights i:nth-child(2) { background: #febc2e; }
.lights i:nth-child(3) { background: #28c840; }

.settings__sidebar {
  display: grid;
  align-content: start;
  gap: 2px;
  width: 220px;
  padding: 14px 12px;
  background: color-mix(in srgb, var(--arx-window-top) 80%, transparent);
  box-shadow: 1px 0 0 var(--arx-hairline);
}

.settings__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  margin-bottom: 10px;
  padding: 0 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-text) 6%, transparent);
  color: var(--arx-secondary);
}

.settings__search :deep(svg) {
  width: 13px;
}

.settings__pane {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 30px;
  padding: 0 8px;
  border-radius: 8px;
}

.settings__pane.is-on {
  background: color-mix(in srgb, var(--arx-text) 9%, transparent);
}

.settings__pane i {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  color: #fff;
}

.settings__pane :deep(svg) {
  width: 12px;
}

.settings__main {
  flex: 1;
  padding: 0 40px;
  overflow: hidden;
}

.settings__main header {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 64px;
}

.settings__main header :deep(svg) {
  width: 16px;
}

header > span:not(.search) {
  display: grid;
  line-height: 1.2;
}

header b {
  font-size: 15px;
}

header small {
  color: var(--arx-secondary);
  font-size: 11px;
}

h3,
h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 8px;
  font-size: 13px;
  font-weight: 650;
}

.group {
  border-radius: 10px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
}

.line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 14px;
  border-top: 1px solid var(--arx-hairline);
}

.line:first-child {
  border-top: 0;
}

.line > span:first-child,
.line.is-link > span {
  display: grid;
  flex: 1;
}

.line small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.line.is-link :deep(svg) {
  width: 15px;
  color: var(--arx-secondary);
}

.line.is-new {
  animation: row-in .35s ease-out;
}

.line em {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--arx-secondary);
  font-style: normal;
}

.line em :deep(svg) {
  width: 14px;
}

.button {
  padding: 4px 12px;
  border-radius: 7px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 1px 1px rgb(0 0 0 / .06);
  font-size: 13px;
  font-weight: 500;
}

.button.is-danger {
  color: #e5484d;
}

.button.is-primary {
  background: #0a63e0;
  color: #fff;
}

.button.is-destructive {
  background: #e5484d;
  color: #fff;
}

.settings__scroll {
  transition: transform .5s cubic-bezier(.3, .7, .2, 1);
}

.line__text {
  display: grid;
  flex: 1;
  line-height: 1.3;
}

.switch {
  position: relative;
  flex: none;
  width: 32px;
  height: 19px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--arx-text) 18%, transparent);
  transition: background .2s;
}

.switch i {
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

.switch.is-on {
  background: #34c759;
}

.switch.is-on i {
  left: 15px;
}

.field-inline {
  color: var(--arx-secondary);
  font-family: ui-monospace, Menlo, monospace;
  font-size: 12px;
}

.search {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 28px;
  height: 28px;
  margin-left: auto;
  padding: 0 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-text) 6%, transparent);
  transition: min-width .25s;
}

.search.is-open {
  min-width: 180px;
}

.search :deep(svg) {
  width: 13px;
}

.line code {
  color: var(--arx-secondary);
  font-size: 12px;
}

.settings__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.settings__intro {
  margin: 0 0 12px;
  color: var(--arx-secondary);
}

h3 .button {
  font-size: 12px;
}

.toggle {
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--arx-text) 18%, transparent);
}

.popup {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 7px 3px 10px;
  border-radius: 7px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 1px 1px rgb(0 0 0 / .06);
}

.popup :deep(svg) {
  width: 10px;
}

.dim {
  position: absolute;
  inset: 0;
  display: grid;
  justify-items: center;
  align-items: start;
  padding-top: 40px;
  background: rgb(0 0 0 / .12);
}

.sheet {
  position: relative;
  width: 560px;
  max-height: 620px;
  padding: 20px 22px;
  overflow: hidden;
  border-radius: 14px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 20px 50px rgb(0 0 0 / .25);
}

.sheet.is-small {
  display: grid;
  gap: 14px;
  width: 400px;
}

.dim.is-inner {
  border-radius: 14px;
  padding-top: 120px;
}

.sheet__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.sheet__close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
}

.sheet__close :deep(svg) {
  width: 13px;
}

.sheet__intro,
.sheet__empty,
.sheet__note {
  margin: 6px 0;
  color: var(--arx-secondary);
  font-size: 12px;
}

.sheet__empty {
  padding: 10px 0;
  text-align: center;
}

.sheet__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.field {
  display: grid;
  padding: 6px 12px;
  border-radius: 10px;
  box-shadow: 0 0 0 2px color-mix(in srgb, #0a63e0 70%, transparent);
  font-size: 14px;
}

.field small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.field.is-empty {
  color: var(--arx-secondary);
}

.field i {
  display: none;
}

.checks {
  display: grid;
  gap: 4px;
  margin: 14px 0 6px;
}

.check {
  display: flex;
  gap: 10px;
  padding: 6px 4px;
}

.check i {
  display: grid;
  flex: none;
  place-items: center;
  width: 16px;
  height: 16px;
  margin-top: 1px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
  background: var(--arx-glass);
  color: #fff;
}

.check i.is-on {
  background: #0a63e0;
  box-shadow: none;
}

.check i :deep(svg) {
  width: 11px;
}

.check span {
  display: grid;
  line-height: 1.35;
}

.check b {
  font-weight: 500;
}

.check small {
  color: var(--arx-secondary);
  font-size: 11px;
}

.check .count {
  color: var(--arx-text);
  font-weight: 500;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity .25s;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform .3s cubic-bezier(.2, .9, .3, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(-24px);
}

@keyframes row-in {
  from { opacity: 0; background: color-mix(in srgb, #0a63e0 12%, transparent); }
}

.settings__custom {
  height: 100%;
  transition: transform .5s cubic-bezier(.3, .7, .2, 1);
}

.settings__add {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-left: auto;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-text) 6%, transparent);
}

/* An App Links handler card */
.handler {
  position: relative;
}

.handler .line {
  gap: 12px;
}

.handler .line > span:first-child {
  display: inline-flex;
  flex: none;
}

.handler__app {
  place-items: center;
  justify-content: center;
  align-items: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--arx-text) 6%, transparent);
  color: var(--arx-secondary);
  font-size: 22px;
  font-weight: 700;
}

.handler__app.is-set {
  background: #d97757;
  color: #fff;
}

.handler__app :deep(svg) {
  width: 22px;
  height: 22px;
}

.handler .handler__field,
.handler .line > .handler__field:first-child {
  display: grid;
  flex: 1;
  gap: 1px;
  padding: 5px 10px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
}

.handler__field.is-empty {
  color: color-mix(in srgb, var(--arx-text) 38%, transparent);
}

.handler__remove {
  flex: none;
  width: 16px;
  color: var(--arx-secondary);
}

.handler code {
  color: var(--arx-secondary);
  font: 12px ui-monospace, "SF Mono", Menlo, monospace;
}

.handler__gap {
  flex: 1;
}

.handler .line.handler__script {
  display: grid;
  gap: 6px;
  padding-left: 40px;
  border-top: 0;
}

.handler .line > .handler__code:first-child {
  display: block;
  padding: 6px 10px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px var(--arx-hairline-strong);
  font: 12px ui-monospace, "SF Mono", Menlo, monospace;
}

.handler__code.is-empty {
  color: color-mix(in srgb, var(--arx-text) 38%, transparent);
}

.handler .line > .handler__code.is-focused {
  box-shadow: 0 0 0 2px rgb(10 99 224 / .7);
}

.handler__picker {
  position: absolute;
  top: 62px;
  left: 14px;
  z-index: 2;
  display: grid;
  gap: 2px;
  width: 320px;
  padding: 8px;
  border-radius: 12px;
  background: var(--arx-command);
  box-shadow: 0 0 0 .5px var(--arx-hairline-strong), 0 14px 36px rgb(0 0 0 / .24);
  animation: row-in .2s ease-out;
}

.handler__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  margin-bottom: 4px;
  padding: 0 8px;
  border-bottom: 1px solid var(--arx-hairline);
}

.handler__search :deep(svg) {
  width: 13px;
  color: var(--arx-secondary);
}

.handler__search em {
  color: var(--arx-secondary);
  font-style: normal;
}

.handler__search i {
  width: 1.5px;
  height: 14px;
  margin-left: -7px;
  background: #0a63e0;
}

.handler__picker > small {
  padding: 2px 8px;
  color: var(--arx-secondary);
  font-size: 11px;
  font-weight: 600;
}

.handler__option {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 30px;
  padding: 0 8px;
  border-radius: 7px;
}

.handler__option.is-on {
  background: #0a63e0;
  color: #fff;
}

.handler__option.is-on code {
  color: rgb(255 255 255 / .75);
}

.handler__option i {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  color: #fff;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
}

.handler__option code {
  margin-left: auto;
}

.handler__choose {
  margin-top: 4px;
  padding: 6px 8px 2px;
  border-top: 1px solid var(--arx-hairline);
  color: var(--arx-secondary);
}


.handler__app :deep(.iconify) { font-size: 22px; }
.handler__remove { font-size: 16px; }

</style>
