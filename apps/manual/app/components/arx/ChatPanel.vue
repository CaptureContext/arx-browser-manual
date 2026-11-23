<script setup lang="ts">
import type { ArxWorld } from '~/utils/arxModel'

// The chat panel beside the page: a card in the window's tint with glassy square
// buttons, the conversation, and the message box with the provider chip.
// `embedded` draws it as a page, for a chat opened in a tab.
const props = defineProps<{ chat: NonNullable<ArxWorld['chat']>, embedded?: boolean }>()

// Answers use a little Markdown: paragraphs, "- " bullets and **bold**.
function blocks(text: string) {
  const lines = text.split('\n').filter(line => line.trim())
  return lines.map(line => line.startsWith('- ')
    ? { bullet: true, parts: bold(line.slice(2)) }
    : { bullet: false, parts: bold(line) })
}
function bold(text: string) {
  return text.split(/(\*\*[^*]*\*\*?)/).filter(Boolean).map(part => part.startsWith('**')
    ? { strong: true, text: part.replace(/\*/g, '') }
    : { strong: false, text: part })
}
const empty = computed(() => props.chat.messages.length === 0)
</script>

<template>
  <section class="chat" :class="{ 'is-embedded': embedded }" :style="embedded ? undefined : { width: `${chat.width}px` }" :data-arx="embedded ? 'chat-page' : 'chat'">
    <span class="chat__edge" data-arx="chat-edge" />
    <header class="chat__header">
      <span class="glass" data-arx="chat:list"><Icon name="raycast:text" /></span>
      <span class="chat__title"><b><Icon v-if="chat.pinned" class="chat__pin" name="raycast:pin" />{{ chat.title }}</b><small>✳︎ {{ chat.model }}</small></span>
      <span class="glass is-pair"><i :data-arx="embedded ? 'chat-page:more' : 'chat:more'"><Icon name="raycast:ellipsis" /></i><i v-if="!embedded" data-arx="chat:hide"><Icon name="raycast:xmark" /></i></span>
    </header>

    <div class="chat__body">
      <template v-for="(message, index) in chat.messages" :key="index">
        <div v-if="message.role === 'user'" class="chat__ask">
          <span v-if="message.attachments?.length" class="chat__thumbs is-sent"><i v-for="file in message.attachments" :key="file.id" :class="`is-${file.kind}`" /></span>
          {{ message.text }}
        </div>
        <div v-else class="chat__answer">
          <component :is="block.bullet ? 'li' : 'p'" v-for="(block, line) in blocks(message.text)" :key="line">
            <template v-for="(part, at) in block.parts" :key="at"><b v-if="part.strong">{{ part.text }}</b><template v-else>{{ part.text }}</template></template>
          </component>
        </div>
      </template>
      <p v-if="chat.thinking" class="chat__thinking"><i />Thinking…</p>
      <p v-if="!empty && !chat.thinking" class="chat__note">This chat disappears 20 minutes after its last message, or when Arx quits. Pin it to keep it.</p>
      <div v-if="empty && chat.suggestions.length" class="chat__suggestions">
        <strong>Suggestions</strong>
        <span v-for="(suggestion, index) in chat.suggestions" :key="suggestion" :class="{ 'is-first': index === 0 }">
          <Icon :name="index === 2 ? 'raycast:light-bulb' : 'raycast:text'" />{{ suggestion }}<Icon class="chevron" name="raycast:chevron-right" />
        </span>
      </div>
    </div>

    <footer class="chat__composer" :class="{ 'is-dropping': chat.dropping }" data-arx="chat:composer">
      <TransitionGroup v-if="chat.attachments?.length" name="thumb" tag="div" class="chat__thumbs">
        <span v-for="file in chat.attachments" :key="file.id" class="chat__thumb" :data-arx="`attachment:${file.id}`">
          <i :class="`is-${file.kind}`" /><small>{{ file.name }}</small>
          <b :data-arx="`attachment-remove:${file.id}`"><Icon name="raycast:xmark" /></b>
        </span>
      </TransitionGroup>
      <span v-if="chat.draft" class="chat__draft">{{ chat.draft }}<i /></span>
      <span v-else class="chat__placeholder">{{ empty ? 'Message the assistant…' : 'Ask a follow-up…' }}</span>
      <div class="chat__controls">
        <span class="glass is-small" data-arx="chat:plus"><Icon name="raycast:plus" /></span>
        <span class="chat__model">✳︎ {{ chat.model }} <Icon name="raycast:chevron-down" /></span>
        <span class="chat__send" :class="{ 'is-ready': chat.draft }" data-arx="chat:send"><Icon name="raycast:arrow-up" /></span>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.chat {
  position: absolute;
  top: 8px;
  right: 8px;
  bottom: 8px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background: var(--arx-chat);
  box-shadow: 0 0 0 .5px var(--arx-hairline), 0 1px 3px rgb(0 0 0 / .08);
  color: var(--arx-text);
  font-size: 13px;
  animation: chat-in .4s cubic-bezier(.2, .9, .25, 1);
  transition: width .35s cubic-bezier(.25, .8, .25, 1);
}

.chat.is-embedded {
  inset: 0;
  border-radius: 0;
  box-shadow: none;
  animation: none;
}

.chat__pin {
  width: 11px;
  margin-right: 4px;
  vertical-align: -1px;
  color: var(--arx-accent);
}

.chat__edge {
  position: absolute;
  inset: 0 auto 0 -4px;
  width: 8px;
}

.chat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
}

.glass {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9.5px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline), 0 1px 2px rgb(0 0 0 / .06);
}

.glass :deep(svg) {
  width: 15px;
}

.glass.is-pair {
  display: inline-flex;
  width: auto;
  padding: 0 4px;
}

.glass.is-pair i {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
}

.glass.is-small {
  width: 28px;
  height: 28px;
}

.chat__title {
  display: grid;
  justify-items: center;
  padding: 4px 14px;
  border-radius: 9.5px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline);
  line-height: 1.25;
}

.chat__title b { font-weight: 600; }
.chat__title small { color: var(--arx-secondary); font-size: 11px; }

.chat__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 14px 12px;
  overflow: hidden;
}

.chat__ask {
  display: grid;
  justify-items: end;
  align-self: flex-end;
  max-width: 80%;
  margin: 0 0 4px;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline), 0 1px 3px rgb(0 0 0 / .08);
  animation: rise .3s ease-out;
}

.chat__answer p,
.chat__answer li {
  margin: 0 0 6px;
  line-height: 1.45;
}

.chat__answer li {
  margin-left: 14px;
}

.chat__answer b { font-weight: 650; }

.chat__thinking {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--arx-secondary);
}

.chat__thinking i {
  width: 12px;
  height: 12px;
  border: 2px solid color-mix(in srgb, var(--arx-secondary) 40%, transparent);
  border-top-color: var(--arx-secondary);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.chat__note {
  margin: 4px 0 0;
  color: var(--arx-secondary);
  font-size: 11px;
  text-align: center;
}

.chat__suggestions {
  display: grid;
  gap: 4px;
}

.chat__suggestions strong {
  margin-bottom: 4px;
  font-size: 13px;
}

.chat__suggestions span {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;
  white-space: nowrap;
  overflow: hidden;
}

.chat__suggestions span.is-first { color: var(--arx-accent); }
.chat__suggestions :deep(svg) { flex: none; width: 15px; }
.chat__suggestions .chevron { margin-left: auto; opacity: .6; }

.chat__composer {
  margin: 0 10px 10px;
  padding: 12px 12px 10px;
  border-radius: 14px;
  background: var(--arx-glass);
  box-shadow: 0 0 0 .5px var(--arx-hairline), 0 2px 8px rgb(0 0 0 / .06);
}

.chat__composer.is-dropping {
  box-shadow: 0 0 0 2px #0a84ff, 0 2px 8px rgb(0 0 0 / .06);
}

.chat__thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.chat__thumbs.is-sent {
  margin-bottom: 6px;
}

.chat__thumbs.is-sent i {
  width: 44px;
  height: 34px;
  border-radius: 6px;
}

.chat__thumb {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 3px;
  width: 64px;
}

.chat__thumb small {
  max-width: 64px;
  overflow: hidden;
  color: var(--arx-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat__thumbs i {
  display: block;
  width: 64px;
  height: 46px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .15);
}

.chat__thumbs .is-image {
  background: linear-gradient(160deg, #8ec5fc, #e0c3fc);
}

.chat__thumbs .is-screenshot {
  background: linear-gradient(180deg, #e9e9ee 0 22%, #fff 22%), #fff;
}

.chat__thumbs .is-capture {
  background: repeating-linear-gradient(180deg, #fff 0 6px, #dfe3ea 6px 8px);
}

.chat__thumb b {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1d1d1f;
  color: #fff;
}

.chat__thumb b :deep(svg) {
  width: 9px;
}

.chat__draft i {
  display: inline-block;
  width: 1.5px;
  height: 14px;
  margin-left: 1px;
  vertical-align: -2px;
  background: var(--arx-accent);
}

.chat__send.is-ready {
  background: var(--arx-accent);
  color: #fff;
}

.thumb-enter-active,
.thumb-leave-active {
  transition: opacity .2s, transform .25s cubic-bezier(.3, .7, .2, 1.2);
}

.thumb-enter-from,
.thumb-leave-to {
  opacity: 0;
  transform: scale(.7);
}

.chat__placeholder {
  color: var(--arx-secondary);
  opacity: .8;
}

.chat__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}

.chat__model {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--arx-text) 5%, transparent);
  font-size: 12px;
}

.chat__model :deep(svg) { width: 10px; }

.chat__send {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-left: auto;
  border-radius: 50%;
  background: color-mix(in srgb, var(--arx-text) 25%, transparent);
  color: var(--arx-window-top);
}

.chat__send :deep(svg) { width: 13px; }

@keyframes chat-in {
  from { opacity: 0; transform: translateX(24px); }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
