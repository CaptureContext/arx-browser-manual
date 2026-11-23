<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

/*
  "On this page", as on manual.raycast.com: a 1px rail, a 2px accent bar that
  slides to the heading you're reading (top/height .2s), and the list scrolls
  itself to keep that heading in view. Clicking scrolls smoothly to the section.
*/
const props = defineProps<{ links: TocLink[] }>()

const flat = computed(() => props.links.flatMap(link => [
  { id: link.id, text: link.text, depth: 2 },
  ...(link.children ?? []).map(child => ({ id: child.id, text: child.text, depth: 3 }))
]))

const root = ref<HTMLElement>()
const list = ref<HTMLElement>()
const active = ref<string>()
const indicator = reactive({ top: 0, height: 0, visible: false })
let frame = 0
// While a click scrolls the page, keep the clicked item active instead of
// letting every heading it passes flash by.
let lockedUntil = 0

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// The active heading is the last one whose top has passed a line a little
// below the top of the window. At the very bottom of the page, the last one.
function spy() {
  if (performance.now() < lockedUntil) return
  const line = 120
  let current = flat.value[0]?.id
  for (const item of flat.value) {
    const heading = document.getElementById(item.id)
    if (heading && heading.getBoundingClientRect().top <= line) current = item.id
  }
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  if (atBottom) current = flat.value.at(-1)?.id ?? current
  active.value = current
}

function onScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(spy)
}

function place() {
  const link = list.value?.querySelector<HTMLElement>(`a[data-id="${CSS.escape(active.value ?? '')}"]`)
  if (!link) {
    indicator.visible = false
    return
  }
  indicator.top = link.offsetTop
  indicator.height = link.offsetHeight
  indicator.visible = true

  // Keep the active item inside the table of contents' own scroll area.
  const box = root.value
  if (!box || box.scrollHeight <= box.clientHeight) return
  const top = link.offsetTop - box.scrollTop
  const margin = 48
  if (top < margin || top + link.offsetHeight > box.clientHeight - margin) {
    box.scrollTo({ top: link.offsetTop - box.clientHeight / 2, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
}

watch(active, () => nextTick(place))

function go(event: MouseEvent, id: string) {
  const heading = document.getElementById(id)
  if (!heading || event.metaKey || event.ctrlKey || event.shiftKey) return
  event.preventDefault()
  active.value = id
  lockedUntil = performance.now() + 900
  heading.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#${id}`)
}

onMounted(() => {
  spy()
  nextTick(place)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', place)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', place)
})
watch(flat, () => nextTick(() => {
  spy()
  place()
}))

const copied = ref(false)
async function copyLink() {
  await navigator.clipboard.writeText(location.href.split('#')[0]!)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}
</script>

<template>
  <div ref="root" class="toc">
    <nav v-if="flat.length" class="toc__nav" aria-label="On this page">
      <span
        class="toc__indicator"
        :style="{ top: `${indicator.top}px`, height: `${indicator.height}px`, opacity: indicator.visible ? 1 : 0 }"
        aria-hidden="true"
      />
      <ul ref="list" class="toc__list">
        <li v-for="item in flat" :key="item.id" :class="`is-depth-${item.depth}`">
          <a
            :href="`#${item.id}`"
            :data-id="item.id"
            :class="{ 'is-active': active === item.id }"
            :aria-current="active === item.id ? 'location' : undefined"
            @click="go($event, item.id)"
          >{{ item.text }}</a>
        </li>
      </ul>
    </nav>
    <div class="toc__actions">
      <button type="button" @click="copyLink"><Icon :name="copied ? 'raycast:checkmark' : 'raycast:link'" />{{ copied ? 'Copied' : 'Copy link' }}</button>
      <a href="#main-content"><Icon name="raycast:arrow-up" />Back to top</a>
    </div>
  </div>
</template>

<style scoped>
.toc {
  position: sticky;
  top: 40px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.toc:hover {
  scrollbar-color: var(--border-separator) transparent;
}

.toc__nav {
  position: relative;
}

.toc__indicator {
  position: absolute;
  left: 0;
  width: 2px;
  border-radius: 1px;
  background: var(--accent);
  pointer-events: none;
  transition: top .2s, height .2s, opacity .15s;
}

.toc__list {
  margin: 0;
  padding: 0;
  border-left: 1px solid var(--border-subtle);
  list-style: none;
}

.toc__list li.is-depth-3 {
  padding-left: 10px;
}

.toc__list a {
  display: block;
  padding: 6px 0 6px 12px;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  transition: color .15s;
}

.toc__list a:hover:not(.is-active) {
  color: var(--text-primary);
}

.toc__list a.is-active {
  color: var(--accent-text);
}

.toc__actions {
  display: grid;
  gap: 2px;
  margin-top: 20px;
  padding-left: 12px;
}

.toc__actions button,
.toc__actions a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  border: 0;
  background: none;
  color: var(--text-tertiary);
  font-size: 13px;
  cursor: pointer;
  transition: color .15s;
}

.toc__actions button:hover,
.toc__actions a:hover {
  color: var(--text-primary);
}
</style>
