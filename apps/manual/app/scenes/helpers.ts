/* Steps several scenes share, each doing what Arx does on screen. */
import type { ArxCommandRow, ArxForm, ArxMenuItem, ArxOverlay } from '~/utils/arxModel'
import { ICON } from '~/utils/arxModel'
import type { SceneContext, Target } from '~/utils/arxScene'

export const SUMMARY = `Arx is a free, open-source browser for the Mac from CaptureContext, with a public beta in November.
- **Spaces** for each part of your day, each with its own Favorites and pinned tabs.
- **One bar** for addresses, open tabs, history and commands.
- **A sidebar that remembers** your pinned tabs and folders.
- **Native on the Mac**, with Chromium underneath.
- **Open to the assistants you choose**, on your own plan.`

/** A two-finger swipe across the sidebar to another space. */
export async function swipe({ world, move, wait, swipe: fingers }: SceneContext, to: number) {
  const direction = to > world.space ? -1 : 1
  await move([150, 690])
  await wait(150)
  world.space = to
  await fingers([direction * 90, 0], { ms: 600 })
  await wait(700)
}

/** Rests on a sidebar row until its preview opens. */
export async function preview({ world, move, wait }: SceneContext, kind: 'tab' | 'folder', id: string, hold = 1800) {
  await move(`${kind}:${id}`)
  world.hovered = `${kind}:${id}`
  await wait(450)
  world.card = { kind, id }
  await wait(hold)
}

export function endPreview({ world }: SceneContext) {
  world.card = null
  world.hovered = null
}

/** ⌘T and typing, with the rows Arx lists for what's typed. */
export async function command(context: SceneContext, query: string, rows: ArxCommandRow[] = [], options: { agent?: boolean, combo?: string } = {}) {
  const { world, key, wait, type } = context
  await key(options.combo ?? '⌘ T')
  world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
  await wait(450)
  await type(query, (value) => {
    if (!world.commandBar) return
    world.commandBar.query = value
    world.commandBar.agent = !!options.agent
    world.commandBar.rows = value.length > 2 ? rows : []
  })
  await wait(700)
}

export const searchRow = (text: string): ArxCommandRow => ({ title: text, subtitle: 'Search Google', icon: ICON.google })

/** Tab in the command bar: a new chat streams its answer in the panel. */
export async function ask(context: SceneContext, question: string, answer = SUMMARY) {
  const { world, key, wait } = context
  await key('⇥ Tab')
  world.commandBar = null
  world.chat = { width: 360, title: question, model: 'Claude Opus', messages: [{ role: 'user', text: question }], suggestions: [], thinking: true }
  await wait(1100)
  const chat = world.chat
  chat.thinking = false
  chat.messages.push({ role: 'assistant', text: '' })
  const reply = chat.messages[chat.messages.length - 1]!
  for (const word of answer.match(/\S+\s*/g) ?? []) {
    reply.text += word
    await wait(34)
  }
}

/** A context menu at the pointer, opening upward near the bottom of the window. */
export function openMenu({ world, pointer }: SceneContext, items: ArxMenuItem[]) {
  const height = items.reduce((sum, item) => sum + (item.separator ? 11 : 24), 10)
  const y = pointer.y + height > 790 ? pointer.y - height : pointer.y
  world.menu = { x: pointer.x + 2, y, items }
}

export const SPACE_MENU: ArxMenuItem[] = [
  { label: 'Change Space Icon…' },
  { label: 'Rename Space…' },
  { label: 'Set Profile', submenu: true },
  { label: 'Appearance…' },
  { separator: true },
  { label: 'New Folder' },
  { separator: true },
  { label: 'Manage Spaces…' },
]

/** Opens a menu at the pointer (to its left with `leftward`), moves to `label` and clicks it. */
export async function pick(context: SceneContext, items: ArxMenuItem[], label: string, options: { leftward?: boolean } = {}) {
  const { world, move, click, wait } = context
  openMenu(context, items)
  if (options.leftward && world.menu) world.menu.x -= 210
  await wait(450)
  await move(`menu:${label}`)
  world.menu!.highlighted = items.findIndex(item => item.label === label)
  await wait(350)
  await click(`menu:${label}`, { stay: true })
  world.menu = null
}

export const FOLDER_MENU: ArxMenuItem[] = [
  { label: 'Rename…' },
  { label: 'Open Tabs' },
  { label: 'Open All Tabs in Folder' },
  { label: 'Ungroup Folder', shortcut: '⇧⌘G' },
  { label: 'Delete Folder and Tabs', danger: true },
  { separator: true },
  { label: 'New Subfolder' },
  { label: 'Collapse Folder' },
  { label: 'Move Items…' },
]

/** Puts an overlay (a dialog, another app's window, a panel) in front, and returns the
 *  world's live copy of it: change that one, so the preview redraws. */
export function show<K extends ArxOverlay['kind']>(world: SceneContext['world'], overlay: Extract<ArxOverlay, { kind: K }>): Extract<ArxOverlay, { kind: K }> {
  world.overlays.push(overlay)
  return world.overlays[world.overlays.length - 1] as Extract<ArxOverlay, { kind: K }>
}

/** Removes overlays of a kind, or the dialog with an id. */
export function hide(world: SceneContext['world'], what: string) {
  world.overlays = world.overlays.filter(item => item.kind !== what && !(item.kind === 'dialog' && item.id === what))
}

/** Types into the frontmost Terminal window, then presses Return and prints `output`. */
export async function terminal(context: SceneContext, command: string, output: string[], pause = 600) {
  const { world, type, wait, key } = context
  const window = world.overlays.find(item => item.kind === 'terminal')
  if (!window || window.kind !== 'terminal') return
  await type(command, (value) => { window.typing = value }, { cps: 20 })
  await wait(300)
  await key('↩ Return')
  window.lines.push(`~ % ${command}`)
  window.typing = ''
  for (const line of output) {
    await wait(pause / 3)
    window.lines.push(line)
  }
  await wait(pause)
}

/** Puts a sheet, popover or assistant window built from sections in front, and returns its live form. */
export function sheet(world: SceneContext['world'], form: ArxForm, options: { width: number, height?: number, at?: [number, number], dim?: boolean }) {
  return show(world, { kind: 'form', form, ...options }).form
}

/** Removes the sheet, popover or assistant window with this id. */
export function closeSheet(world: SceneContext['world'], id: string) {
  world.overlays = world.overlays.filter(item => !(item.kind === 'form' && item.form.id === id))
}

/** Removes a prompt card or another app's window by id. */
export function dismiss(world: SceneContext['world'], id: string) {
  world.overlays = world.overlays.filter(item => !((item.kind === 'prompt' || item.kind === 'app') && item.id === id))
}

/** Clicks a switch in a sheet and flips its row. */
export async function flip({ click, wait }: SceneContext, form: ArxForm, label: string) {
  await click(`switch:${label}`)
  const row = form.sections.flatMap(section => section.rows).find(item => item.label === label)
  if (row) row.toggle = !row.toggle
  await wait(500)
}

/** Touch ID: the system asks, and a moment later it's given. */
export async function touchID(context: SceneContext, reason: string) {
  show(context.world, { kind: 'touchid', reason })
  context.label('Touch ID')
  await context.wait(1500)
  hide(context.world, 'touchid')
}

/** A page's own right-click menu at a target, with one item chosen. */
export async function contextMenu(context: SceneContext, target: Target, items: ArxMenuItem[], label: string, hold = 1100) {
  await context.rightClick(target)
  openMenu(context, items)
  await context.wait(hold)
  await context.move(`menu:${label}`)
  context.world.menu!.highlighted = items.findIndex(item => item.label === label)
  await context.wait(350)
  await context.click(`menu:${label}`, { stay: true })
  context.world.menu = null
}
