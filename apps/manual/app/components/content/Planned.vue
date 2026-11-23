<template>
  <!-- ::planned … :: for a section or paragraph about something Arx doesn't do yet. -->
  <div class="planned-callout">
    <PlannedBadge />
    <div class="planned-callout__body"><slot mdc-unwrap="p" /></div>
  </div>
</template>

<style scoped>
.planned-callout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 24px 0;
  padding: 14px 16px;
  border: 1px dashed color-mix(in srgb, var(--support-purple) 45%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--support-purple) 6%, transparent);
  font-size: var(--font-size-sm);
}

.planned-callout__body {
  flex: 1;
}
</style>
