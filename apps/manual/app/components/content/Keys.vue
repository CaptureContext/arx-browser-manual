<script setup lang="ts">
// :keys{combo="⇧ ⌘ T"} → one keycap per space-separated key.
const props = defineProps<{ combo: string }>()
const keys = computed(() => props.combo.split(/\s+/).filter(Boolean))
</script>

<template>
  <span class="keys"><kbd v-for="(key, index) in keys" :key="index" :class="{ 'is-word': key.length > 1 }">{{ key }}</kbd></span>
</template>

<style scoped>
.keys {
  display: inline-flex;
  gap: 2px;
  white-space: nowrap;
}

.keys kbd + kbd {
  margin-left: 0;
}

.keys kbd.is-word {
  padding: 0 .45em;
  font-size: .75em;
}
</style>
