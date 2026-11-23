<script setup lang="ts">
// "Planned": for pages, sections and items Arx doesn't do yet.
// In Markdown, inline: :planned-badge
defineProps<{ small?: boolean }>()
</script>

<template>
  <span class="planned" :class="{ 'is-small': small }" title="Not in Arx yet">Planned</span>
</template>

<style scoped>
.planned {
  display: inline-flex;
  align-items: center;
  height: 1.6em;
  padding: 0 .6em;
  border: 1px solid color-mix(in srgb, var(--support-purple) 40%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--support-purple) 12%, transparent);
  color: var(--support-purple);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .01em;
  line-height: 1;
  vertical-align: .15em;
  white-space: nowrap;
}

.planned.is-small {
  height: 1.5em;
  margin-left: auto;
  font-size: 10.5px;
}
</style>
