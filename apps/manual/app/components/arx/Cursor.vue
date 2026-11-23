<script setup lang="ts">
import type { ClickKind } from '~/utils/arxScene'

// The manual's pointer, as the recordings drew it (arx-browser Scripts/recordings/cursor.swift):
// a tailless, rounded arrowhead in the manual's accent with a white outline, the same
// for every action. What an action is shows in how it moves: a quick dip for a click,
// two for a double-click, a wiggle for a right-click, a deep squash and pop for a Force
// Click, and a held dip while dragging. Its rounded tip sits at (x, y).
defineProps<{ x: number, y: number, pressed: boolean, pulse: { kind: ClickKind, id: number } | null }>()

// cursor.swift's corners (tip, lower left, the notch, right point) with their radii,
// at 1.6 points per unit, rounded with arcs.
const ARROWHEAD = 'M7.60 6.86 A2.08 2.08 0 0 0 4.22 8.59 L5.05 25.72 A1.76 1.76 0 0 0 8.21 26.70 L11.02 22.99 A4.80 4.80 0 0 1 14.47 21.11 L20.03 20.67 A1.76 1.76 0 0 0 20.99 17.54 Z'
</script>

<template>
  <svg
    :key="pulse?.id ?? 0"
    class="cursor"
    :class="[{ 'is-pressed': pressed }, pulse ? `is-${pulse.kind}` : '']"
    :style="{ left: `${x}px`, top: `${y}px` }"
    viewBox="0 0 29 35"
    aria-hidden="true"
  >
    <path class="outline" :d="ARROWHEAD" />
    <path class="fill" :d="ARROWHEAD" />
  </svg>
</template>

<style scoped>
.cursor {
  position: absolute;
  z-index: 3;
  width: 29px;
  height: 35px;
  translate: -5px -6px;
  overflow: visible;
  filter: drop-shadow(0 2px 3px rgb(0 0 0 / .35));
  transform-origin: 5px 6px;
  scale: var(--fx, 1);
  transition: transform .12s cubic-bezier(.3, .7, .3, 1.4);
}

.outline {
  fill: #fff;
  stroke: #fff;
  stroke-width: 3.7;
  stroke-linejoin: round;
}

.fill {
  fill: #0066ff;
  stroke: #0066ff;
  stroke-width: 1;
  stroke-linejoin: round;
}

.cursor.is-pressed {
  transform: scale(.84);
}

.cursor.is-click {
  animation: dip .22s ease-out;
}

.cursor.is-double {
  animation: dip .18s ease-out 2;
}

.cursor.is-right {
  animation: wiggle .4s ease-in-out;
}

.cursor.is-force {
  animation: squash .8s cubic-bezier(.3, .6, .3, 1.3);
}

@keyframes dip {
  50% { transform: scale(.8); }
}

@keyframes wiggle {
  20% { transform: rotate(-14deg) scale(.9); }
  45% { transform: rotate(10deg) scale(.9); }
  70% { transform: rotate(-5deg); }
}

@keyframes squash {
  0% { transform: scale(1); }
  70% { transform: scale(.66); }
  80% { transform: scale(1.18); }
  100% { transform: scale(1); }
}
</style>
