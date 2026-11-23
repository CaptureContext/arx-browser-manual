<script setup lang="ts">
type Section = { id: string, path: string, page: string, title: string, trail: string[], level: number, content: string }
type Result = Section & { score: number, group: string, snippet: { text: string, hit: boolean }[] }

const open = useSearchOpen()
const { data: navigation } = await useManualNavigation()
const query = ref('')
const filter = ref<string>('all')
const selected = ref(0)
const input = ref<HTMLInputElement>()
const list = ref<HTMLElement>()
const sections = ref<Section[]>()

// The index is a prerendered JSON file, loaded the first time search opens.
async function load() {
  if (sections.value) return
  sections.value = await $fetch<Section[]>('/search.json').catch(() => [])
}

// Group title for a path, e.g. /tabs/peek → "Tabs and windows".
const groupOf = (path: string) => navigation.value.find(group => path.startsWith(`${group.path}/`))?.title ?? 'Manual'

const terms = computed(() => query.value.toLowerCase().split(/\s+/).filter(Boolean))

function snippetFor(content: string, words: string[]) {
  const lower = content.toLowerCase()
  const first = Math.min(...words.map(word => lower.indexOf(word)).filter(index => index >= 0))
  const start = Number.isFinite(first) ? Math.max(0, first - 40) : 0
  const text = (start > 0 ? '…' : '') + content.slice(start, start + 160) + (content.length > start + 160 ? '…' : '')
  if (!words.length) return [{ text, hit: false }]
  const pattern = new RegExp(`(${words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  // With a capturing group, split puts the matched words at odd indexes.
  return text.split(pattern).map((part, index) => ({ text: part, hit: index % 2 === 1 })).filter(part => part.text)
}

const matches = computed<Result[]>(() => {
  const words = terms.value
  if (!sections.value || !words.length) return []
  const results: Result[] = []
  for (const section of sections.value) {
    const title = section.title.toLowerCase()
    const trail = section.trail.join(' ').toLowerCase()
    const content = section.content.toLowerCase()
    let score = 0
    for (const word of words) {
      if (title.startsWith(word)) score += 12
      else if (title.includes(word)) score += 8
      else if (trail.includes(word)) score += 4
      else if (content.includes(word)) score += 2
      else { score = 0; break }
    }
    if (!score) continue
    if (section.level === 1) score += 3
    results.push({ ...section, score, group: groupOf(section.path), snippet: snippetFor(section.content, words) })
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 40)
})

const groups = computed(() => {
  const counts = new Map<string, number>()
  for (const result of matches.value) counts.set(result.group, (counts.get(result.group) ?? 0) + 1)
  return [...counts.entries()]
})

const results = computed(() => filter.value === 'all' ? matches.value : matches.value.filter(result => result.group === filter.value))

watch(query, () => { selected.value = 0; filter.value = 'all' })
watch(filter, () => { selected.value = 0 })

watch(open, async (value) => {
  if (!value) return
  query.value = ''
  await load()
  await nextTick()
  input.value?.focus()
})

function close() {
  open.value = false
}

async function go(result?: Result) {
  if (!result) return
  close()
  await navigateTo(result.path)
}

function move(step: number) {
  if (!results.value.length) return
  selected.value = (selected.value + step + results.value.length) % results.value.length
  nextTick(() => list.value?.querySelector('.is-selected')?.scrollIntoView({ block: 'nearest' }))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
  else if (event.key === 'Enter') { event.preventDefault(); go(results.value[selected.value]) }
  else if (event.key === 'Escape') { event.preventDefault(); close() }
}

// Suggestions while the field is empty: the first page of each group.
const suggestions = computed(() => navigation.value.map(group => group.children?.[0]).filter(Boolean))
</script>

<template>
  <Teleport to="body">
    <Transition name="search">
      <div v-if="open" class="search" @keydown="onKeydown">
        <div class="search__overlay" @click="close" />
        <div class="search__panel" role="dialog" aria-modal="true" aria-label="Search the manual">
          <label class="search__field">
            <Icon name="raycast:magnifying-glass" />
            <input
              ref="input"
              v-model="query"
              type="search"
              placeholder="Search the manual"
              autocomplete="off"
              spellcheck="false"
              role="combobox"
              aria-controls="search-results"
              :aria-expanded="results.length > 0"
            >
            <kbd>esc</kbd>
          </label>

          <div v-if="groups.length > 1" class="search__filters" role="tablist" aria-label="Filter by section">
            <button type="button" role="tab" :aria-selected="filter === 'all'" @click="filter = 'all'">All ({{ matches.length }})</button>
            <button v-for="[name, count] in groups" :key="name" type="button" role="tab" :aria-selected="filter === name" @click="filter = name">{{ name }} ({{ count }})</button>
          </div>

          <div id="search-results" ref="list" class="search__results" role="listbox">
            <template v-if="terms.length">
              <button
                v-for="(result, index) in results"
                :key="result.id"
                type="button"
                role="option"
                class="search__result"
                :class="{ 'is-selected': index === selected }"
                :aria-selected="index === selected"
                @mousemove="selected = index"
                @click="go(result)"
              >
                <span class="search__eyebrow">{{ [result.group, ...result.trail].join(' › ') }}</span>
                <span class="search__title">{{ result.title }}</span>
                <span v-if="result.content" class="search__snippet"><template v-for="(part, partIndex) in result.snippet" :key="partIndex"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
              </button>
              <p v-if="sections && !results.length" class="search__empty">Nothing in the manual matches “{{ query }}”.</p>
            </template>
            <template v-else>
              <p class="search__label">Start with</p>
              <NuxtLink v-for="page in suggestions" :key="page!.path" :to="page!.path" class="search__suggestion" @click="close">
                <Icon :name="String(page!.icon || 'raycast:blank-document')" />{{ page!.title }}
              </NuxtLink>
            </template>
          </div>

          <footer class="search__footer" aria-hidden="true">
            <span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
            <span><kbd>↵</kbd> to open</span>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12vh 16px 16px;
}

.search__overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(6px);
}

.search__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(640px, 100%);
  max-height: min(620px, 76vh);
  overflow: hidden;
  border: 1px solid var(--border-separator);
  border-radius: var(--radius-xl);
  background: var(--surface-elevated);
  box-shadow: var(--shadow-lg);
}

.search__field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 18px;
}

.search__field input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 16px;
}

.search__field input::-webkit-search-cancel-button {
  display: none;
}

.search__field kbd {
  font-size: 11px;
}

.search__filters {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 10px 16px 0;
  scrollbar-width: none;
}

.search__filters button {
  flex: none;
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: border-color .15s, color .15s, background-color .15s;
}

.search__filters button:hover {
  color: var(--text-primary);
}

.search__filters button[aria-selected="true"] {
  border-color: var(--accent-400);
  background: var(--accent-100);
  color: var(--text-primary);
}

.search__results {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  scroll-padding: 10px;
}

.search__result {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--surface-hover);
  text-align: left;
  cursor: pointer;
  transition: border-color .12s, background-color .12s;
}

.search__result.is-selected {
  border-color: var(--accent-400);
  background: var(--accent-100);
}

.search__eyebrow {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.search__title {
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.search__snippet {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.search__snippet mark {
  padding: 0 2px;
  border-radius: 3px;
  background: var(--accent-300);
  color: var(--text-primary);
}

.search__label {
  margin: 4px 8px 6px;
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.search__suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: var(--radius-md);
  color: var(--text-body);
  font-size: var(--font-size-sm);
}

.search__suggestion:hover,
.search__suggestion:focus-visible {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.search__empty {
  margin: 24px 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
}

.search__footer {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.search-enter-active,
.search-leave-active {
  transition: opacity .18s var(--ease-out);
}

.search-enter-active .search__panel,
.search-leave-active .search__panel {
  transition: transform .26s var(--ease-spring), opacity .18s var(--ease-out);
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
}

.search-enter-from .search__panel,
.search-leave-to .search__panel {
  opacity: 0;
  transform: translateY(-6px) scale(.98);
}
</style>
