<script setup lang="ts">
import type { Effect } from '~/utils/arxScene'

// What the pointer does, drawn under it so each action reads at a glance:
// - click: one ring
// - double: two rings in quick succession
// - right: a ring in purple, the secondary click
// - force: pressure filling a disc, then a deeper ring as it clicks through
// - grab and drop: a ring closing in as a drag starts, and one settling where it ends
// - swipe: two fingertips sliding with their trails, for two-finger swipes and scrolls
defineProps<{ effects: Effect[] }>()
</script>

<template>
  <div class="effects">
    <template v-for="effect in effects" :key="effect.id">
      <span v-if="effect.kind === 'swipe'" class="swipe" :style="{ left: `${effect.x}px`, top: `${effect.y}px`, '--dx': `${effect.dx ?? 0}px`, '--dy': `${effect.dy ?? 0}px`, '--ms': `${effect.ms ?? 500}ms` }">
        <i :class="{ 'is-vertical': Math.abs(effect.dy ?? 0) > Math.abs(effect.dx ?? 0) }" /><i :class="{ 'is-vertical': Math.abs(effect.dy ?? 0) > Math.abs(effect.dx ?? 0) }" />
      </span>
      <span v-else class="effect" :class="`is-${effect.kind}`" :style="{ left: `${effect.x}px`, top: `${effect.y}px` }">
        <i /><i />
      </span>
    </template>
  </div>
</template>

<style scoped>
.effects {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.effect {
  position: absolute;
  scale: var(--fx, 1);
}

.effect i {
  position: absolute;
  left: -20px;
  top: -20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2.5px solid #0a84ff;
  opacity: 0;
}

/* Click: one ring and a soft dot. */
.is-click i:first-child {
  animation: ring .55s ease-out forwards;
}

.is-click i:last-child {
  border: 0;
  background: rgb(10 132 255 / .28);
  animation: dot .45s ease-out forwards;
}

/* Double-click: two rings, the second a beat later. */
.is-double i {
  animation: ring .5s ease-out forwards;
}

.is-double i:last-child {
  animation-delay: .16s;
}

/* Right-click: the secondary click, in purple. */
.is-right i {
  border-color: #af52de;
}

.is-right i:first-child {
  animation: ring .6s ease-out forwards;
}

.is-right i:last-child {
  border: 0;
  background: rgb(175 82 222 / .28);
  animation: dot .5s ease-out forwards;
}

/* Force Click: pressure fills a disc, then a deep ring as it clicks through. */
.is-force i:first-child {
  border: 0;
  background: radial-gradient(circle, rgb(10 132 255 / .55), rgb(10 132 255 / .15) 70%);
  animation: press .9s ease-in forwards;
}

.is-force i:last-child {
  border-width: 4px;
  animation: deep .7s ease-out .55s forwards;
}

/* Grab: a ring closing in as the drag starts. */
.is-grab i:first-child {
  animation: grab .45s ease-out forwards;
}

.is-grab i:last-child {
  display: none;
}

/* Drop: a ring settling where the item lands. */
.is-drop i:first-child {
  border-color: #30d158;
  animation: ring .6s ease-out forwards;
}

.is-drop i:last-child {
  border: 0;
  background: rgb(48 209 88 / .25);
  animation: dot .6s ease-out forwards;
}

/* Two fingers on the trackpad, sliding together with their trails. */
.swipe {
  position: absolute;
  scale: var(--fx, 1);
}

.swipe i {
  position: absolute;
  left: -9px;
  top: -9px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgb(255 255 255 / .92);
  box-shadow: 0 0 0 1.5px rgb(10 132 255 / .9), 0 2px 8px rgb(0 0 0 / .25), calc(var(--dx) * -.35) calc(var(--dy) * -.35) 0 -3px rgb(10 132 255 / .25), calc(var(--dx) * -.7) calc(var(--dy) * -.7) 0 -5px rgb(10 132 255 / .12);
  animation: slide var(--ms) cubic-bezier(.45, 0, .3, 1) forwards;
}

.swipe i:first-child {
  translate: 0 -14px;
}

.swipe i:last-child {
  translate: 0 14px;
}

.swipe i.is-vertical:first-child {
  translate: -14px 0;
}

.swipe i.is-vertical:last-child {
  translate: 14px 0;
}

@keyframes ring {
  from { opacity: 1; transform: scale(.35); }
  to { opacity: 0; transform: scale(1.35); }
}

@keyframes dot {
  from { opacity: 1; transform: scale(.4); }
  to { opacity: 0; transform: scale(.9); }
}

@keyframes press {
  0% { opacity: 0; transform: scale(.2); }
  60% { opacity: 1; transform: scale(.75); }
  70% { opacity: 1; transform: scale(.6); }
  100% { opacity: 0; transform: scale(.9); }
}

@keyframes deep {
  from { opacity: 1; transform: scale(.5); }
  to { opacity: 0; transform: scale(1.8); }
}

@keyframes grab {
  from { opacity: 0; transform: scale(1.4); }
  50% { opacity: 1; }
  to { opacity: 0; transform: scale(.6); }
}

@keyframes slide {
  0% { opacity: 0; transform: translate(0, 0) scale(.6); }
  15% { opacity: 1; transform: translate(0, 0) scale(1); }
  85% { opacity: 1; transform: translate(var(--dx), var(--dy)) scale(1); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.7); }
}
</style>
