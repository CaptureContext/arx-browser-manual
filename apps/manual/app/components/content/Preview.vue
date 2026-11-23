<script setup lang="ts">
/*
  An animated preview of Arx, drawn in HTML from Arx's own sizes and colors rather
  than recorded, so it stays sharp at any size, follows the manual's theme and
  costs a few kilobytes.

  In Markdown:
    ::preview{scene="split-view"}
    ::

  Scenes live in app/scenes (see app/scenes/index.ts). `caption` overrides the
  scene's own caption. The preview is a picture: it ignores the pointer.
*/
import { scenes } from '~/scenes'

const props = defineProps<{ scene: string, caption?: string, wide?: boolean }>()
const definition = computed(() => scenes[props.scene])
const text = computed(() => props.caption ?? definition.value?.caption)
</script>

<template>
  <figure class="preview" :class="{ 'is-wide': wide }">
    <div class="preview__stage">
      <ClientOnly>
        <ArxStage v-if="definition" :scene="definition" />
        <template #fallback><div class="preview__loading" /></template>
      </ClientOnly>
      <p v-if="!definition" class="preview__missing">No scene named “{{ scene }}”.</p>
    </div>
    <figcaption v-if="text">{{ text }}</figcaption>
  </figure>
</template>

<style scoped>
.preview {
  margin: 28px 0;
}

.preview__stage {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-xl);
  background: var(--wallpaper);
  box-shadow: var(--shadow-image);
}

.preview__missing {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: var(--text-secondary);
}

.preview figcaption {
  margin-top: 10px;
  color: var(--text-tertiary);
  font-size: 13px;
  text-align: center;
}
</style>
