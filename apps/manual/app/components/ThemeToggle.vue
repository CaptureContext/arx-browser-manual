<script setup lang="ts">
// Cycles System → Light → Dark → System. The head script in nuxt.config.ts
// owns the preference, so the theme is right before Vue loads.
type Preference = 'system' | 'light' | 'dark'

declare global {
  interface Window {
    __arxTheme?: { get: () => Preference, set: (value: Preference) => void }
  }
}

const order: Preference[] = ['system', 'light', 'dark']
const icons: Record<Preference, string> = { system: 'raycast:desktop', light: 'raycast:sun', dark: 'raycast:moon' }
const names: Record<Preference, string> = { system: 'System', light: 'Light', dark: 'Dark' }

const preference = ref<Preference>('system')
onMounted(() => { preference.value = window.__arxTheme?.get() ?? 'system' })

const next = computed(() => order[(order.indexOf(preference.value) + 1) % order.length]!)
const label = computed(() => `Theme: ${names[preference.value]}. Switch to ${names[next.value]}.`)

function cycle() {
  preference.value = next.value
  window.__arxTheme?.set(preference.value)
}
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="label" :title="label" @click="cycle">
    <Icon :key="preference" :name="icons[preference]" class="theme-toggle__icon" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color .15s, color .15s;
}

.theme-toggle:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.theme-toggle__icon {
  animation: theme-icon-in .2s var(--ease-out);
}

@keyframes theme-icon-in {
  from {
    opacity: 0;
    transform: rotate(-30deg) scale(.8);
  }
}
</style>
