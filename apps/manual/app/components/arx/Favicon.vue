<script setup lang="ts">
import type { ArxIcon } from '~/utils/arxModel'

// A site icon as Arx draws it: 16 points in rows, larger on Favorite tiles.
withDefaults(defineProps<{ icon: ArxIcon, size?: number }>(), { size: 16 })
</script>

<template>
  <span class="favicon" :style="{ width: `${size}px`, height: `${size}px` }">
    <img v-if="icon.kind === 'arx'" src="/brand/arx-icon.png" alt="">
    <Icon v-else-if="icon.kind === 'brand'" :name="`raycast:${icon.name}`" :style="{ color: icon.color ?? 'var(--arx-text)' }" />
    <Icon v-else-if="icon.kind === 'symbol'" :name="`raycast:${icon.name}`" />
    <span
      v-else
      class="favicon__letter"
      :class="{ 'is-serif': icon.serif }"
      :style="{ background: icon.bg, color: icon.fg, fontSize: `${size * .68}px` }"
    >{{ icon.letter }}</span>
  </span>
</template>

<style scoped>
.favicon {
  display: inline-grid;
  flex: none;
  place-items: center;
}

.favicon img,
.favicon :deep(svg) {
  width: 100%;
  height: 100%;
}

.favicon img {
  border-radius: 22%;
}

.favicon__letter {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 22%;
  font-weight: 700;
  line-height: 1;
  box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .12);
}

.favicon__letter.is-serif {
  font-family: "Linux Libertine", Georgia, "Times New Roman", serif;
  font-weight: 400;
}
</style>
