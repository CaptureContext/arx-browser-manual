<script setup lang="ts">
import type { ArxWorld } from '~/utils/arxModel'
import { speakerIcon } from '~/utils/arxModel'

// The speaker at the end of a tab's row while it has sound: more waves the louder it
// is, crossed out when muted. Clicking it opens the tab's volume.
const props = defineProps<{ world: ArxWorld, id: string }>()
const audio = computed(() => props.world.audio[props.id])
const icon = computed(() => audio.value ? speakerIcon(audio.value) : '')
</script>

<template>
  <Icon v-if="audio" class="speaker" :class="{ 'is-muted': audio.muted }" :name="`raycast:${icon}`" :data-arx="`speaker:${id}`" />
</template>

<style scoped>
.speaker {
  flex: none;
  width: 13px;
  height: 13px;
  color: var(--arx-secondary);
}

.speaker.is-muted {
  opacity: .5;
}
</style>
