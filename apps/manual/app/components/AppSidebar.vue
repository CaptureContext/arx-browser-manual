<script setup lang="ts">
const { data: navigation } = await useManualNavigation()
const route = useRoute()
const searchOpen = useSearchOpen()
const sidebarOpen = useSidebarOpen()
const config = useRuntimeConfig()

const isMac = ref(true)
onMounted(() => { isMac.value = /Mac|iPhone|iPad/.test(navigator.platform) })

watch(() => route.path, () => { sidebarOpen.value = false })
</script>

<template>
  <aside class="sidebar" :class="{ 'is-open': sidebarOpen }" aria-label="Manual">
    <div class="sidebar__head">
      <ArxLogo />
      <ThemeToggle />
    </div>

    <button type="button" class="sidebar__search" @click="searchOpen = true">
      <Icon name="raycast:magnifying-glass" />
      <span class="sidebar__search-label">Search Manual</span>
      <span class="sidebar__keys" aria-hidden="true"><kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd><kbd>K</kbd></span>
    </button>

    <nav class="sidebar__nav">
      <ul class="sidebar__top">
        <li>
          <NuxtLink to="/" class="sidebar__link" :class="{ 'is-active': route.path === '/' }">
            <Icon name="raycast:book" />Manual
          </NuxtLink>
        </li>
        <li>
          <a :href="config.public.landingUrl" class="sidebar__link" target="_blank" rel="noopener">
            <Icon name="raycast:globe-01" />Arx website<Icon name="raycast:arrow-ne" class="sidebar__external" />
          </a>
        </li>
      </ul>

      <section v-for="group in navigation" :key="group.path" class="sidebar__group">
        <h2>{{ group.title }}</h2>
        <ul>
          <li v-for="page in group.children" :key="page.path">
            <NuxtLink :to="page.path" class="sidebar__link" :class="{ 'is-active': route.path === page.path }">
              {{ page.title }}<PlannedBadge v-if="page.status === 'planned'" small />
            </NuxtLink>
          </li>
        </ul>
      </section>
    </nav>
  </aside>
  <div v-if="sidebarOpen" class="sidebar__scrim" @click="sidebarOpen = false" />
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  padding: 14px 16px 0;
  background: var(--window-bg);
}

.sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 0 0 2px;
  margin-bottom: 18px;
}

.sidebar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 34px;
  padding: 0 6px 0 10px;
  border: 1px solid var(--border-separator);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  text-align: left;
  cursor: pointer;
  transition: border-color .15s, background-color .15s, color .15s;
}

.sidebar__search:hover {
  border-color: var(--text-tertiary);
  background: var(--fg-100);
  color: var(--text-body);
}

.sidebar__search-label {
  flex: 1;
}

.sidebar__keys {
  display: flex;
  gap: 3px;
}

.sidebar__keys kbd {
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border: 1px solid var(--border-field);
  background: transparent;
  box-shadow: none;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 11px;
}

.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  margin: 16px -16px 0;
  padding: 0 16px 32px;
  scrollbar-width: thin;
}

.sidebar__nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__top {
  margin-bottom: 18px !important;
}

.sidebar__group + .sidebar__group {
  margin-top: 24px;
}

.sidebar__group h2 {
  margin: 0 0 4px;
  padding: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.sidebar__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  transition: color .15s;
}

.sidebar__link:hover:not(.is-active) {
  color: var(--text-primary);
}

.sidebar__link.is-active {
  color: var(--accent-text);
}

.sidebar__external {
  margin-left: auto;
  opacity: .6;
}

.sidebar__scrim {
  display: none;
}

@media (max-width: 1023px) {
  .sidebar {
    width: min(300px, 86vw);
    transform: translateX(-102%);
    transition: transform .32s var(--ease-out);
    box-shadow: var(--shadow-lg);
  }

  .sidebar.is-open {
    transform: none;
  }

  .sidebar__scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 29;
    background: var(--overlay);
    animation: fade-in .2s;
  }
}

@keyframes fade-in {
  from { opacity: 0; }
}
</style>
