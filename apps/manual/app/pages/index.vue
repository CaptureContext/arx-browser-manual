<script setup lang="ts">
const { data: navigation } = await useManualNavigation()
const config = useRuntimeConfig()

const description = 'How to use Arx, the native macOS browser from CaptureContext: spaces, the command bar, Peek, Little Arx, profiles, assistants and developer mode.'

useSeoMeta({
  title: 'Arx Manual',
  titleTemplate: '%s',
  description,
  ogTitle: 'Arx Manual',
  ogDescription: description
})

// Home page rows, in the order a new user needs them. "Start here" and
// "Get help" show their pages; "Explore Arx" shows one card per sidebar group.
const group = (path: string) => navigation.value.find(item => item.path === path)

const cards = computed(() => [
  { title: 'Start here', items: group('/start')?.children ?? [] },
  { title: 'Explore Arx', items: ['/tabs', '/command-bar', '/pages', '/profiles', '/assistants', '/developers'].map(group).filter(item => item !== undefined) },
  { title: 'Get help', items: group('/help')?.children ?? [] }
].map(row => ({
  ...row,
  items: row.items.map(item => ({
    path: item.children?.[0]?.path ?? item.path,
    title: item.title,
    description: String(item.description ?? ''),
    icon: String(item.icon || 'raycast:book')
  }))
})))

const firstPage = computed(() => navigation.value[0]?.children?.[0]?.path ?? '/')
</script>

<template>
  <div class="home">
    <header class="home__hero">
      <h1>Arx Manual</h1>
      <p>Arx is a browser for the Mac with spaces for each part of your day, one bar for everything, and a sidebar that remembers. This manual covers it from the first launch to connecting an assistant and running Arx headless in CI.</p>
      <div class="home__actions">
        <NuxtLink :to="firstPage" class="button is-primary">Getting started</NuxtLink>
        <a :href="`${config.public.landingUrl}/download`" class="button"><Icon name="raycast:download" />Download Arx</a>
        <a :href="config.public.landingUrl" class="button" target="_blank" rel="noopener"><Icon name="raycast:globe-01" />What is Arx?</a>
      </div>
    </header>

    <Preview class="home__recording" scene="home" wide />

    <section v-for="(row, rowIndex) in cards" :key="row.title" class="home__row" :style="{ '--row': rowIndex }">
      <h2>{{ row.title }}</h2>
      <div class="home__grid">
        <NuxtLink
          v-for="(item, index) in row.items"
          :key="item.path"
          :to="item.path"
          class="home__card"
          :style="{ '--i': index }"
        >
          <Icon :name="item.icon" class="home__card-icon" />
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
        </NuxtLink>
        <a v-if="row.title === 'Get help'" :href="config.public.landingUrl" class="home__card" target="_blank" rel="noopener" :style="{ '--i': row.items.length }">
          <Icon name="raycast:arrow-ne" class="home__card-icon" />
          <strong>Arx website</strong>
          <span>The tour, the comparison with other browsers, the changelog and the newsletter.</span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
  padding: 72px 32px 120px;
}

.home__hero h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(2.5rem, 6vw, 3.75rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -.03em;
}

.home__hero p {
  max-width: 700px;
  margin: 18px 0 0;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  line-height: 1.55;
}

.home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  border-radius: var(--radius-md);
  background: var(--surface-control);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: background-color .15s, transform .15s var(--ease-spring);
}

.button:hover {
  background: var(--fg-300);
}

.button:active {
  transform: scale(.97);
}

.button.is-primary {
  background: var(--fg);
  color: var(--window-bg);
}

.button.is-primary:hover {
  background: var(--fg-600);
}

.home__recording {
  margin-top: 48px;
}

.home__row {
  margin-top: 64px;
}

.home__row h2 {
  margin: 0 0 16px;
  color: var(--text-primary);
  font-size: var(--font-size-h2);
  font-weight: 600;
  letter-spacing: -.015em;
}

.home__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.home__card {
  display: grid;
  align-content: start;
  gap: 4px;
  padding: 18px;
  border: 1px solid var(--border-separator);
  border-radius: var(--radius-lg);
  background: var(--surface-panel);
  animation: rise .5s var(--ease-out) both;
  animation-delay: calc(var(--row, 0) * 80ms + var(--i, 0) * 50ms + 100ms);
  transition: border-color .2s, background-color .2s, transform .2s var(--ease-out);
}

.home__card:hover {
  border-color: var(--accent-400);
  background: color-mix(in srgb, var(--accent) 5%, var(--surface-panel));
  transform: translateY(-2px);
}

.home__card-icon {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 18px;
}

.home__card:hover .home__card-icon {
  color: var(--accent-text);
}

.home__card strong {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.home__card span {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.home__hero,
.home__recording {
  animation: rise .6s var(--ease-out) both;
}

.home__recording {
  animation-delay: 80ms;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

@media (max-width: 640px) {
  .home {
    padding: 40px 16px 80px;
  }
}
</style>
