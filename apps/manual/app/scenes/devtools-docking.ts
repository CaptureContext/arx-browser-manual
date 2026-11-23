import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { pick } from './helpers'

const DOCK = [
  { label: 'Dock to right' },
  { label: 'Dock to bottom' },
  { label: 'Dock to left' },
  { label: 'Undock into separate window' },
]

export default defineArxScene({
  caption: '⌥⌘I docks DevTools on the right of its page. Drag the divider, dock it at the bottom, undock it into its own window and back. It hides and returns with its tab.',
  setup(world) {
    world.developerMode = true
    openTab(world, 'local')
  },
  async run(context) {
    const { world, wait, key, drag, click } = context
    await wait(600)
    await key('⌥ ⌘ I')
    world.devtools = { tab: 'local', panel: 'Elements', picked: false, highlight: null, dock: 'right', width: 400 }
    await wait(1200)
    const devtools = world.devtools
    const [x] = context.point('devtools-divider')
    await drag('devtools-divider', [x - 130, 420], { hold: 150, onMove: (px) => { devtools.width = Math.max(400, Math.min(560, 400 + (x - px))) } })
    await wait(900)
    const dock = async (label: string, side: 'right' | 'bottom' | 'window') => {
      await click('devtools:more')
      await pick(context, DOCK.map(item => ({ ...item, checked: item.label.toLowerCase().includes(devtools.dock ?? 'right') })), label, { leftward: true })
      devtools.dock = side
      await wait(1300)
    }
    await dock('Dock to bottom', 'bottom')
    await dock('Undock into separate window', 'window')
    await dock('Dock to right', 'right')
    await click('tab:arx')
    world.selected = 'arx'
    await wait(1100)
    await click('tab:local')
    world.selected = 'local'
    await wait(1600)
  },
})
