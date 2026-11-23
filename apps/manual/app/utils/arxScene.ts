/*
  Plays an animated Arx preview: a script that moves a pointer, clicks, types and
  changes an `ArxWorld`, which the Arx* components draw.

  A scene is `defineArxScene({ caption, run })`. `run` gets a `SceneContext` and
  plays once; the player resets the world and loops it while the preview is on
  screen. Targets are elements in the stage marked `data-arx="<name>"`, such as
  `tab:arx`, `folder:watch`, `space:shops` or `menu:Set Profile`; points are
  `[x, y]` in window points (1280 × 800).
*/
import type { ArxWorld } from './arxModel'

export type Target = string | [number, number]

export interface Camera {
  scale: number
  /** The window point that stays centered while zoomed. */
  x: number
  y: number
}

/** How a click is drawn: each kind has its own effect under the pointer. */
export type ClickKind = 'click' | 'double' | 'right' | 'force'

/** A one-off effect drawn over the window: a click's ring, a drag's grab or drop, a two-finger swipe. */
export interface Effect {
  id: number
  kind: ClickKind | 'grab' | 'drop' | 'swipe'
  x: number
  y: number
  /** For swipes: how far the fingers travel, and for how long. */
  dx?: number
  dy?: number
  ms?: number
}

export interface Pointer {
  x: number
  y: number
  visible: boolean
  pressed: boolean
  /** Replays the arrow's own animation for a kind of click. */
  pulse: { kind: ClickKind, id: number } | null
  /** A short label beside the pointer, naming the gesture. */
  tag: { text: string, id: number } | null
  effects: Effect[]
}

export interface SceneContext {
  world: ArxWorld
  wait: (ms: number) => Promise<void>
  /** Glides the pointer to a target. Longer moves take longer. */
  move: (target: Target, options?: { ms?: number, offset?: [number, number] }) => Promise<void>
  /** Moves there (unless `stay`), presses and releases. `kind` picks a double-click, right-click or Force Click. */
  click: (target: Target, options?: { stay?: boolean, offset?: [number, number], kind?: ClickKind }) => Promise<void>
  doubleClick: (target: Target, options?: { stay?: boolean }) => Promise<void>
  rightClick: (target: Target, options?: { stay?: boolean }) => Promise<void>
  forceClick: (target: Target, options?: { stay?: boolean }) => Promise<void>
  /** A two-finger swipe or scroll on the trackpad, drawn as two fingertips sliding by `dx`, `dy`. */
  swipe: (delta: [number, number], options?: { at?: Target, ms?: number }) => Promise<void>
  /** A short label beside the pointer, naming a gesture that a pointer alone can't show. */
  label: (text: string) => void
  /** Presses at a target and drags to another, with `hold` ms resting on the target. */
  drag: (from: Target, to: Target, options: { hold?: number, onMove?: (x: number, y: number) => void }) => Promise<void>
  /** Types `text` into `set`, one character at a time. */
  type: (text: string, set: (value: string) => void, options?: { from?: string, cps?: number }) => Promise<void>
  /** A key press, drawn as a keycap hint. */
  key: (label: string) => Promise<void>
  /** Zooms toward a target, or back out with `null`. */
  zoom: (target: Target | null, scale?: number) => void
  point: (target: Target) => [number, number]
  /** A target's frame in window points: x, y, width, height. */
  rect: (target: string) => [number, number, number, number]
  pointer: Pointer
}

export interface ArxScene {
  caption?: string
  /** Changes the starting world before the first step, such as opening a space. */
  setup?: (world: ArxWorld) => void
  run: (context: SceneContext) => Promise<void>
}

export function defineArxScene(scene: ArxScene): ArxScene {
  return scene
}

export class SceneStopped extends Error {}

export const WINDOW = { width: 1280, height: 800 }

/** Ease-in-out glide time for a move of `distance` points, as the recording driver did. */
export function glideDuration(distance: number) {
  return Math.round(Math.min(900, Math.max(350, distance / 1.4)))
}
