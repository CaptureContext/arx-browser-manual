<script setup lang="ts">
const searchOpen = useSearchOpen()
const sidebarOpen = useSidebarOpen()

// ⌘K or Ctrl+K anywhere, and "/" when not typing, open search.
function onKeydown(event: KeyboardEvent) {
  const typing = event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable]')
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = !searchOpen.value
  }
  else if (event.key === '/' && !typing && !searchOpen.value) {
    event.preventDefault()
    searchOpen.value = true
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="shell">
    <a href="#main-content" class="skip-link">Skip to content</a>

    <header class="topbar">
      <ArxLogo />
      <div class="topbar__actions">
        <button type="button" aria-label="Search" @click="searchOpen = true"><Icon name="raycast:magnifying-glass" /></button>
        <button type="button" aria-label="Open navigation" :aria-expanded="sidebarOpen" @click="sidebarOpen = !sidebarOpen"><Icon name="raycast:app-window-sidebar-left" /></button>
      </div>
    </header>

    <AppSidebar />

    <main id="main-content" class="shell__main">
      <slot />
    </main>

    <SearchDialog />
  </div>
</template>

<style scoped>
.shell__main {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
}

.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 100;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  color: var(--text-primary);
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: none;
}

.topbar {
  display: none;
}

@media (max-width: 1023px) {
  .shell__main {
    padding-left: 0;
    padding-top: var(--nav-height);
  }

  .topbar {
    position: fixed;
    inset: 0 0 auto;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--nav-height);
    padding: 0 12px 0 16px;
    background: color-mix(in srgb, var(--window-bg) 82%, transparent);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-subtle);
  }

  .topbar__actions {
    display: flex;
    gap: 4px;
  }

  .topbar__actions button {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--text-secondary);
    font-size: 18px;
    cursor: pointer;
  }
}
</style>
