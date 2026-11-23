<script setup lang="ts">
/*
  A list of actions and their keys, as YAML in Markdown:
    ::shortcut-table
    ---
    rows:
      - [Command bar, ⌘ K]
      - [Open a link in Peek, ⇧ Click]
    ---
    ::
*/
defineProps<{ rows: [string, string][] }>()
</script>

<template>
  <div class="shortcuts" role="table">
    <div v-for="[action, combo] in rows" :key="action" class="shortcuts__row" role="row">
      <span role="cell">{{ action }}</span>
      <Keys :combo="combo" role="cell" />
    </div>
  </div>
</template>

<style scoped>
.shortcuts {
  margin: 20px 0;
  overflow: hidden;
  border: 1px solid var(--border-separator);
  border-radius: var(--radius-lg);
  background: var(--surface-panel);
  font-size: var(--font-size-sm);
}

.shortcuts__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 14px;
}

.shortcuts__row + .shortcuts__row {
  border-top: 1px solid var(--border-subtle);
}
</style>
