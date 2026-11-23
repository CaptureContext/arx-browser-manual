<script setup lang="ts">
import type { ArxScene, Camera, ClickKind, Effect, Pointer, SceneContext, Target } from '~/utils/arxScene'
import { glideDuration, SceneStopped, WINDOW } from '~/utils/arxScene'
import { demoWorld } from '~/utils/arxModel'

// Plays a scene on a drawn Arx window. It's a picture, not a control: it ignores
// the pointer and keyboard, plays only while on screen, loops, and holds still for
// people who prefer reduced motion.
const props = defineProps<{ scene: ArxScene }>()

const fresh = () => {
  const world = demoWorld()
  props.scene.setup?.(world)
  return world
}
const world = reactive(fresh())
const pointer = reactive<Pointer>({ x: 760, y: 430, visible: true, pressed: false, pulse: null, tag: null, effects: [] })
const camera = reactive<Camera>({ scale: 1, x: WINDOW.width / 2, y: WINDOW.height / 2 })
const keys = ref<{ id: number, label: string }[]>([])

const stage = ref<HTMLElement>()
const windowElement = ref<{ $el: HTMLElement }>()
const width = ref(0)
const scale = computed(() => width.value * .88 / WINDOW.width)

let visible = false
let stopped = false
let ripple = 0

// Effects stay as long as their animation, then go.
function effect(kind: Effect['kind'], extra: Partial<Effect> = {}, life = 1400) {
  const id = ++ripple
  pointer.effects.push({ id, kind, x: pointer.x, y: pointer.y, ...extra })
  setTimeout(() => { pointer.effects = pointer.effects.filter(item => item.id !== id) }, life)
}

// Keys show as keycaps at the bottom; gestures as a label that pops up beside the pointer.
function showLabel(label: string, gesture = false) {
  const id = ++ripple
  if (gesture) {
    pointer.tag = { text: label, id }
    setTimeout(() => { if (pointer.tag?.id === id) pointer.tag = null }, 1300)
    return
  }
  keys.value = [{ id, label }]
  setTimeout(() => { keys.value = keys.value.filter(item => item.id !== id) }, 1300)
}

function pulse(kind: ClickKind) {
  pointer.pulse = { kind, id: ++ripple }
}

// For reviewing frames: `window.__arxPaused = true` holds every preview still at its
// next wait, and `window.__arxSpeed = 4` plays them four times as fast.
const review = () => (typeof window === 'undefined' ? {} : window) as { __arxPaused?: boolean, __arxSpeed?: number }
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms / (review().__arxSpeed ?? 1)))
async function wait(ms: number) {
  let left = ms
  while (left > 0) {
    if (stopped) throw new SceneStopped()
    while (!visible || review().__arxPaused) {
      await sleep(200)
      if (stopped) throw new SceneStopped()
    }
    const step = Math.min(left, 100)
    await sleep(step)
    left -= step
  }
}

function rect(target: string): [number, number, number, number] {
  const root = windowElement.value?.$el
  const element = root?.querySelector<HTMLElement>(`[data-arx="${CSS.escape(target)}"]`)
  if (!root || !element) return [0, 0, 0, 0]
  const frame = root.getBoundingClientRect()
  const ratio = frame.width / WINDOW.width
  const box = element.getBoundingClientRect()
  return [(box.left - frame.left) / ratio, (box.top - frame.top) / ratio, box.width / ratio, box.height / ratio]
}

function point(target: Target): [number, number] {
  if (Array.isArray(target)) return target
  const root = windowElement.value?.$el
  if (!root) return [pointer.x, pointer.y]
  const frame = root.getBoundingClientRect()
  const ratio = frame.width / WINDOW.width
  const matches = [...root.querySelectorAll<HTMLElement>(`[data-arx="${CSS.escape(target)}"]`)]
  for (const element of matches) {
    const rect = element.getBoundingClientRect()
    const x = (rect.left + rect.width / 2 - frame.left) / ratio
    const y = (rect.top + rect.height / 2 - frame.top) / ratio
    if (rect.width > 0 && x >= 0 && x <= WINDOW.width && y >= 0 && y <= WINDOW.height) return [x, y]
  }
  console.warn(`[arx preview] no target "${target}"`)
  return [pointer.x, pointer.y]
}

// Pointer moves run frame by frame (ease-in-out), so drags can follow them exactly.
async function glide(to: [number, number], ms?: number, onMove?: (x: number, y: number) => void) {
  const from: [number, number] = [pointer.x, pointer.y]
  const duration = (ms ?? glideDuration(Math.hypot(to[0] - from[0], to[1] - from[1]))) / (review().__arxSpeed ?? 1)
  const start = performance.now()
  await new Promise<void>((resolve) => {
    const frame = (now: number) => {
      if (stopped) return resolve()
      const t = Math.min(1, (now - start) / duration)
      const e = t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
      pointer.x = from[0] + (to[0] - from[0]) * e
      pointer.y = from[1] + (to[1] - from[1]) * e
      onMove?.(pointer.x, pointer.y)
      if (t < 1) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
  if (stopped) throw new SceneStopped()
}

const context: SceneContext = {
  world,
  pointer,
  wait,
  point,
  rect,
  async move(target, options) {
    const [x, y] = point(target)
    const [dx, dy] = options?.offset ?? [0, 0]
    await glide([x + dx, y + dy], options?.ms)
  },
  async click(target, options) {
    const kind: ClickKind = options?.kind ?? 'click'
    if (!options?.stay) {
      await context.move(target, { offset: options?.offset })
      await wait(160)
    }
    if (kind === 'double') showLabel('Double-click', true)
    if (kind === 'right') showLabel('Right-click', true)
    if (kind === 'force') {
      // Pressing harder: the pointer sinks while the pressure builds, then clicks through.
      showLabel('Force Click', true)
      effect('force')
      pulse('force')
      pointer.pressed = true
      await wait(650)
      pointer.pressed = false
      await wait(120)
      return
    }
    effect(kind)
    pulse(kind)
    const presses = kind === 'double' ? 2 : 1
    for (let press = 0; press < presses; press++) {
      pointer.pressed = true
      await wait(90)
      pointer.pressed = false
      await wait(press + 1 < presses ? 70 : 90)
    }
  },
  doubleClick: (target, options) => context.click(target, { ...options, kind: 'double' }),
  rightClick: (target, options) => context.click(target, { ...options, kind: 'right' }),
  forceClick: (target, options) => context.click(target, { ...options, kind: 'force' }),
  async drag(from, to, options) {
    await context.move(from)
    await wait(150)
    // Press and hold: the arrow dips and stays down while it carries the item.
    pointer.pressed = true
    effect('grab')
    showLabel('Drag', true)
    await wait(260)
    const [x, y] = point(to)
    await glide([x, y], undefined, options.onMove)
    await wait(options.hold ?? 250)
    pointer.pressed = false
    effect('drop')
    showLabel('Drop', true)
  },
  async swipe([dx, dy], options) {
    if (options?.at) await context.move(options.at)
    const ms = options?.ms ?? 650
    showLabel(Math.abs(dy) > Math.abs(dx) ? 'Two-finger scroll' : 'Two-finger swipe', true)
    effect('swipe', { dx, dy, ms }, ms + 200)
    await wait(ms)
  },
  label: label => showLabel(label, true),
  async type(text, set, options) {
    let value = options?.from ?? ''
    for (const character of text) {
      value += character
      set(value)
      await wait(1000 / (options?.cps ?? 16))
    }
  },
  async key(label) {
    showLabel(label)
    await wait(120)
  },
  zoom(target, scaleTo = 1.6) {
    if (!target) {
      Object.assign(camera, { scale: 1, x: WINDOW.width / 2, y: WINDOW.height / 2 })
      return
    }
    const [x, y] = point(target)
    Object.assign(camera, { scale: scaleTo, x, y })
  },
}

// The camera runs frame by frame rather than as a CSS transition, so the pointer
// layer above it always knows exactly where the window is drawn.
//
// It aims at what the scene asked for (zoom: scale and focus, with the zoomed window
// filling the frame), then makes sure the pointer is in view with room for a label
// under it and to its right; near an edge it follows the pointer, showing a little of
// the background if it has to. It eases toward that aim, so zooms and follows are smooth.
const POINTER_ROOM = { left: 10, top: 10, right: 110, bottom: 52 }
const EDGE = 6
const view = reactive({ s: 1, tx: 0, ty: 0 })

function aim() {
  const s = camera.scale
  let tx = Math.min(0, Math.max(WINDOW.width - WINDOW.width * s, WINDOW.width / 2 - camera.x * s))
  let ty = Math.min(0, Math.max(WINDOW.height - WINDOW.height * s, WINDOW.height / 2 - camera.y * s))
  const k = scale.value || 1
  // The stage around the window, in window points, and the pointer's room.
  const marginX = (width.value / k - WINDOW.width) / 2
  const marginY = (width.value * 10 / 16 / k - WINDOW.height) / 2
  const x = tx + s * pointer.x
  const y = ty + s * pointer.y
  const right = WINDOW.width + marginX - (POINTER_ROOM.right + EDGE) / k
  const left = -marginX + (POINTER_ROOM.left + EDGE) / k
  const bottom = WINDOW.height + marginY - (POINTER_ROOM.bottom + EDGE) / k
  const top = -marginY + (POINTER_ROOM.top + EDGE) / k
  if (x > right) tx -= x - right
  else if (x < left) tx += left - x
  if (y > bottom) ty -= y - bottom
  else if (y < top) ty += top - y
  return { s, tx, ty }
}

function settleCamera() {
  Object.assign(view, aim())
}

let last = 0
let frameRequest = 0
function tick(now: number) {
  const dt = Math.min(.05, (now - (last || now)) / 1000) * (review().__arxSpeed ?? 1)
  last = now
  if (visible) {
    const target = aim()
    const ease = 1 - Math.exp(-dt / .2)
    view.s += (target.s - view.s) * ease
    view.tx += (target.tx - view.tx) * ease
    view.ty += (target.ty - view.ty) * ease
  }
  frameRequest = requestAnimationFrame(tick)
}

// Where a window point is drawn on the stage, in screen pixels.
function onStage(x: number, y: number) {
  const k = scale.value
  return {
    x: (width.value - WINDOW.width * k) / 2 + k * (view.tx + view.s * x),
    y: (width.value * 10 / 16 - WINDOW.height * k) / 2 + k * (view.ty + view.s * y),
  }
}
const pointerOnStage = computed(() => onStage(pointer.x, pointer.y))
const effectsOnStage = computed(() => pointer.effects.map((item) => {
  const at = onStage(item.x, item.y)
  return { ...item, x: at.x, y: at.y, dx: (item.dx ?? 0) * scale.value * view.s, dy: (item.dy ?? 0) * scale.value * view.s }
}))

function reset() {
  Object.assign(world, fresh())
  Object.assign(pointer, { x: 760, y: 430, pressed: false, pulse: null, tag: null, effects: [] })
  Object.assign(camera, { scale: 1, x: WINDOW.width / 2, y: WINDOW.height / 2 })
  settleCamera()
}

async function loop() {
  while (!stopped) {
    try {
      reset()
      await wait(700)
      await props.scene.run(context)
      await wait(1600)
    }
    catch (error) {
      if (error instanceof SceneStopped) return
      console.error(error)
      return
    }
  }
}

let resize: ResizeObserver | undefined
let intersection: IntersectionObserver | undefined
onMounted(() => {
  if (!stage.value) return
  resize = new ResizeObserver(([entry]) => { width.value = entry?.contentRect.width ?? 0 })
  resize.observe(stage.value)
  intersection = new IntersectionObserver(([entry]) => { visible = !!entry?.isIntersecting }, { threshold: .3 })
  intersection.observe(stage.value)
  settleCamera()
  frameRequest = requestAnimationFrame(tick)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) loop()
})
onBeforeUnmount(() => {
  stopped = true
  cancelAnimationFrame(frameRequest)
  resize?.disconnect()
  intersection?.disconnect()
})
</script>

<template>
  <div ref="stage" class="stage" aria-hidden="true" inert>
    <div class="frame" :style="{ width: `${WINDOW.width}px`, height: `${WINDOW.height}px`, transform: `translate(-50%, -50%) scale(${scale})` }">
      <div class="camera" :style="{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})` }">
        <ArxWindow ref="windowElement" :world="world" />
      </div>
    </div>
    <!-- The pointer, its effects and its label are drawn above the camera at one fixed
         size on screen, placed where the window draws the pointer's point. -->
    <div class="pointer-layer">
      <ArxEffects :effects="effectsOnStage" />
      <ArxCursor :x="pointerOnStage.x" :y="pointerOnStage.y" :pressed="pointer.pressed" :pulse="pointer.pulse" />
      <Transition name="tag">
        <span v-if="pointer.tag" :key="pointer.tag.id" class="tag" :style="{ left: `${pointerOnStage.x}px`, top: `${pointerOnStage.y}px` }">{{ pointer.tag.text }}</span>
      </Transition>
    </div>
    <TransitionGroup name="key" tag="div" class="keys">
      <kbd v-for="item in keys" :key="item.id">{{ item.label }}</kbd>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}

.frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 50% 50%;
}

.camera {
  position: absolute;
  inset: 0;
  transform-origin: 0 0;
}

/* One size on screen at any preview size or zoom: --fx scales the pointer's design (in points). */
.pointer-layer {
  --fx: .9;
  position: absolute;
  inset: 0;
}

/* Full-width row, centered under the window. Keycaps share one grid cell, so the
   next one cross-fades over the last in place instead of pushing it aside. */
.keys {
  position: absolute;
  right: 0;
  bottom: 5%;
  left: 0;
  display: grid;
  justify-items: center;
}

.keys kbd {
  grid-area: 1 / 1;
  display: inline-block;
  white-space: nowrap;
  padding: 6px 14px;
  border-radius: 10px;
  background: rgb(20 20 24 / .78);
  box-shadow: 0 6px 20px rgb(0 0 0 / .25);
  color: #fff;
  font: 600 15px/1.2 -apple-system, Inter, system-ui, sans-serif;
  letter-spacing: .04em;
  backdrop-filter: blur(10px);
}

/* A quiet label that reads as part of the pointer: it hangs 4 points under the
   arrowhead, its left end 8 points right of the arrow's rounded bottom-left (the white
   outline spans about -2.5 to 18 across and -1 to 22.5 down from the tip). It's
   drawn above the camera at one size, so the spacing never changes. */
.tag {
  position: absolute;
  z-index: 4;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgb(28 28 32 / .62);
  box-shadow: 0 2px 8px rgb(0 0 0 / .14);
  color: rgb(255 255 255 / .92);
  font: 500 12px/1.2 -apple-system, Inter, system-ui, sans-serif;
  white-space: nowrap;
  pointer-events: none;
  transform-origin: 0 0;
  /* 6.4 = -2.5 + 8 screen pixels (8 / the pointer layer's --fx of .9) to the right. */
  translate: calc(6.4px * var(--fx, 1)) calc(26.5px * var(--fx, 1));
  scale: var(--fx, 1);
  backdrop-filter: blur(8px);
}

/* Pops out of the pointer with a small overshoot, and leaves with a quick fade. */
.tag-enter-active {
  animation: tag-in .34s cubic-bezier(.34, 1.56, .64, 1);
}

.tag-leave-active {
  transition: opacity .12s ease-in;
}

.tag-leave-to {
  opacity: 0;
}

@keyframes tag-in {
  from { opacity: 0; transform: scale(.55); }
  40% { opacity: 1; }
  to { opacity: 1; transform: scale(1); }
}

/* Keycaps cross-fade in place: quick in, quicker out, no travel. */
.key-enter-active {
  transition: opacity .12s cubic-bezier(.2, .8, .2, 1);
}

.key-leave-active {
  transition: opacity .1s ease-in;
}

.key-enter-from,
.key-leave-to {
  opacity: 0;
}


</style>

<style>
/* Arx's chrome colors (BrowserTheme in arx-browser's design system), following the manual's theme. */
.stage {
  --arx-text: rgb(39 34 57);
  --arx-secondary: rgb(39 34 57 / .784);
  --arx-accent: rgb(81 71 232);
  --arx-folder: rgb(82 103 234);
  --arx-window-top: rgb(234 234 239);
  --arx-window-bottom: rgb(240 237 239);
  --arx-control: rgb(39 34 57 / .055);
  --arx-hairline: rgb(39 34 57 / .08);
  --arx-hairline-strong: rgb(39 34 57 / .16);
  --arx-selected: rgb(255 255 255 / .92);
  --arx-hover: rgb(255 255 255 / .45);
  --arx-command: rgb(250 249 252);
  --arx-page-border: rgb(0 0 0 / .08);
  --arx-chat: rgb(244 243 247);
  --arx-glass: rgb(252 252 254);
  --arx-menu: rgb(246 246 248 / .94);
}

:root[data-theme="dark"] .stage {
  --arx-text: rgb(227 224 245);
  --arx-secondary: rgb(227 224 245 / .72);
  --arx-accent: rgb(82 71 240);
  --arx-folder: rgb(110 128 255);
  --arx-window-top: rgb(39 39 46);
  --arx-window-bottom: rgb(44 40 46);
  --arx-control: rgb(227 224 245 / .07);
  --arx-hairline: rgb(255 255 255 / .08);
  --arx-hairline-strong: rgb(255 255 255 / .16);
  --arx-selected: rgb(255 255 255 / .14);
  --arx-hover: rgb(255 255 255 / .07);
  --arx-command: rgb(30 29 34);
  --arx-page-border: rgb(255 255 255 / .08);
  --arx-chat: rgb(46 44 52);
  --arx-glass: rgb(58 56 64);
  --arx-menu: rgb(44 43 48 / .94);
}
</style>
