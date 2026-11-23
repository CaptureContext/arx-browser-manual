<script setup lang="ts">
// ::tip, ::note and ::warning in Markdown render through this.
const props = withDefaults(defineProps<{ type?: 'tip' | 'note' | 'warning' }>(), { type: 'note' })
const icon = computed(() => ({ tip: 'raycast:light-bulb', note: 'raycast:info-01', warning: 'raycast:warning' })[props.type])
</script>

<template>
  <div class="callout" :class="`is-${type}`">
    <Icon :name="icon" class="callout__icon" />
    <div class="callout__body"><slot /></div>
  </div>
</template>

<style scoped>
/* Matches manual.raycast.com: tinted panel, 1px border, text in the tone colour. */
.callout {
  --tone: var(--fg);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  padding: 16px 20px;
  border: 1px solid color-mix(in srgb, var(--tone) 10%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--tone) 5%, transparent);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.callout.is-tip,
.callout.is-warning {
  border-color: color-mix(in srgb, var(--tone) 20%, transparent);
  background: color-mix(in srgb, var(--tone) 10%, transparent);
  color: var(--tone);
}

.callout.is-tip { --tone: var(--support-green); }
.callout.is-warning { --tone: var(--support-yellow); }

.callout__icon {
  flex: none;
  width: 20px;
  height: 20px;
  color: inherit;
}

.callout__body :deep(> :last-child) {
  margin-bottom: 0;
}

.callout__body :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.callout__body :deep(code) {
  background: color-mix(in srgb, currentColor 12%, transparent);
  color: inherit;
}
</style>
