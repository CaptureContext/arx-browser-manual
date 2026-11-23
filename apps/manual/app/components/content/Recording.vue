<script setup lang="ts">
/*
  A screen recording of Arx, or a placeholder until it exists. When app/scenes has
  a scene named like `src`, the drawn, animated scene plays instead of the video.

  In Markdown:
    ::recording{shot="What the clip shows, step by step." caption="Shown under the clip."}
    ::

  Once the clip is recorded, add `src` (the file name without extension under
  public/recordings) and, optionally, chapters as "Label@seconds" pairs:
    ::recording{src="peek" chapters="Open@0,Keep it@4.5" caption="…"}
    ::

  The player expects <src>.webm (VP9) and <src>.jpg (the poster frame, shown
  before the clip plays and wherever WebM can't play). Set `mp4` to add an
  H.264 <src>.mp4 fallback after the WebM. With `dark`, the dark theme
  plays <src>-dark.* instead (recorded with Arx in dark mode), following the
  manual's resolved theme on <html data-theme>. See README → Recordings.
*/
import { scenes } from '~/scenes'

const props = defineProps<{
  src?: string
  shot?: string
  caption?: string
  chapters?: string
  mp4?: boolean
  dark?: boolean
  wide?: boolean
}>()

// Server render and first paint use the light clip; the dark one swaps in on mount and follows theme changes.
const theme = ref<'light' | 'dark'>('light')
let themeObserver: MutationObserver | undefined
// A drawn scene (app/scenes) by the same name replaces the video.
const scene = computed(() => props.src ? scenes[props.src] : undefined)
const base = computed(() => {
  if (!props.src || scene.value) return undefined
  return `/recordings/${props.src}${props.dark && theme.value === 'dark' ? '-dark' : ''}`
})
const chapterList = computed(() => (props.chapters ?? '')
  .split(',')
  .map(entry => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const [label, at] = entry.split('@')
    return { label: label!.trim(), at: Number(at) || 0 }
  }))

const video = ref<HTMLVideoElement>()
const figure = ref<HTMLElement>()
const current = ref(0)
const reduceMotion = ref(false)
let observer: IntersectionObserver | undefined

// Plays only while on screen. With reduced motion it waits for a click.
onMounted(() => {
  const root = document.documentElement
  const readTheme = () => { theme.value = root.dataset.theme === 'dark' ? 'dark' : 'light' }
  readTheme()
  themeObserver = new MutationObserver(readTheme)
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!video.value || !figure.value) return
  observer = new IntersectionObserver(([entry]) => {
    if (!video.value) return
    if (entry?.isIntersecting && !reduceMotion.value) video.value.play().catch(() => {})
    else video.value.pause()
  }, { threshold: .35 })
  observer.observe(figure.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  themeObserver?.disconnect()
})

// A theme change swaps the sources: reload and pick up where the clip was, playing only if it was.
watch(base, async () => {
  const element = video.value
  if (!element) return
  const at = element.currentTime
  const playing = !element.paused
  await nextTick()
  element.load()
  element.addEventListener('loadedmetadata', () => {
    element.currentTime = Math.min(at, element.duration || at)
    if (playing) element.play().catch(() => {})
  }, { once: true })
})

function onTime() {
  const time = video.value?.currentTime ?? 0
  const index = chapterList.value.findLastIndex(chapter => chapter.at <= time)
  current.value = Math.max(0, index)
}

function seek(index: number) {
  if (!video.value) return
  video.value.currentTime = chapterList.value[index]!.at
  video.value.play().catch(() => {})
}
</script>

<template>
  <figure ref="figure" class="recording" :class="{ 'is-wide': wide }">
    <div class="recording__stage">
      <ClientOnly v-if="scene">
        <ArxStage :scene="scene" />
      </ClientOnly>
      <video
        v-else-if="base"
        ref="video"
        :poster="`${base}.jpg`"
        muted
        loop
        playsinline
        preload="metadata"
        :controls="reduceMotion"
        @timeupdate="onTime"
      >
        <source :src="`${base}.webm`" type="video/webm">
        <source v-if="mp4" :src="`${base}.mp4`" type="video/mp4">
      </video>

      <div v-else-if="!scene" class="recording__placeholder">
        <div class="recording__window" aria-hidden="true">
          <div class="recording__sidebar"><i /><i /><i class="is-on" /><i /><i /></div>
          <div class="recording__page"><i /><i /><i /></div>
        </div>
        <span class="recording__badge"><Icon name="raycast:film-strip" />Recording planned</span>
        <p v-if="shot" class="recording__shot">{{ shot }}</p>
      </div>
    </div>

    <figcaption v-if="caption || chapterList.length">
      <span v-if="caption">{{ caption }}</span>
      <span v-if="chapterList.length && base" class="recording__chapters">
        <button v-for="(chapter, index) in chapterList" :key="chapter.label" type="button" :aria-pressed="current === index" @click="seek(index)">{{ chapter.label }}</button>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.recording {
  margin: 28px 0;
}

.recording__stage {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-xl);
  background: var(--wallpaper);
  box-shadow: var(--shadow-image);
}

.recording video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recording__placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 14px;
  padding: 24px;
  text-align: center;
}

.recording__window {
  display: flex;
  gap: 8px;
  width: min(58%, 420px);
  aspect-ratio: 16 / 10;
  padding: 8px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--window-bg) 55%, transparent);
  box-shadow: 0 20px 50px rgb(0 0 0 / .25), inset 0 0 0 1px rgb(255 255 255 / .12);
  backdrop-filter: blur(12px);
  animation: float 6s ease-in-out infinite;
}

.recording__sidebar {
  display: grid;
  align-content: start;
  gap: 6px;
  width: 26%;
  padding-top: 18px;
}

.recording__sidebar i,
.recording__page i {
  display: block;
  height: 8px;
  border-radius: 4px;
  background: var(--fg-200);
}

.recording__sidebar i.is-on {
  background: var(--accent-400);
}

.recording__page {
  flex: 1;
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  background: var(--surface-elevated);
}

.recording__page i:nth-child(1) { width: 60%; height: 12px; }
.recording__page i:nth-child(2) { width: 90%; }
.recording__page i:nth-child(3) { width: 75%; }

.recording__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--window-bg) 70%, transparent);
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.recording__shot {
  max-width: 520px;
  margin: 0;
  color: color-mix(in srgb, var(--text-primary) 90%, transparent);
  font-size: 13px;
  line-height: 1.5;
  text-shadow: 0 1px 8px rgb(0 0 0 / .2);
}

.recording figcaption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: var(--text-tertiary);
  font-size: 13px;
  text-align: center;
}

.recording__chapters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.recording__chapters button {
  padding: 3px 12px;
  border: 0;
  border-radius: 999px;
  background: var(--surface-hover);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background-color .15s, color .15s;
}

.recording__chapters button[aria-pressed="true"] {
  background: var(--fg);
  color: var(--window-bg);
}

@keyframes float {
  50% { transform: translateY(-4px); }
}

@media (max-width: 640px) {
  .recording__shot {
    display: none;
  }
}
</style>
