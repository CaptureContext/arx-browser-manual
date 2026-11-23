import { defineArxScene } from '~/utils/arxScene'
import { pick } from './helpers'

export default defineArxScene({
  caption: 'On localhost with developer mode on, the developer header\'s buttons: Copy URL, Capture, DevTools, Console, Network, Inspect Element and Split. Console opens DevTools, Inspect Element picks a card, and Add Right Split opens a pane beside the page.',
  setup(world) {
    world.developerMode = true
    world.spaces[0]!.open.splice(1, 0, 'local')
    world.selected = 'local'
  },
  async run(context) {
    const { world, move, click, wait, key, type, zoom, rect } = context
    zoom([1080, 60], 1.9)
    await wait(600)
    for (const tool of ['copy', 'capture', 'devtools', 'console', 'network', 'inspect', 'split']) {
      await move(`dev:${tool}`, { ms: 380 })
      await wait(320)
    }
    await click('dev:capture')
    await pick(context, [{ label: 'Capture' }, { label: 'Capture Area' }], 'Capture Area')
    await wait(300)
    await key('esc')
    await wait(500)
    zoom(null)
    await click('dev:console')
    world.devtools = { tab: 'local', panel: 'Console', picked: false, highlight: null }
    await wait(1800)
    await click('dev:inspect')
    world.devtools.panel = 'Elements'
    await wait(600)
    await move('card:ridge')
    world.devtools.highlight = rect('card:ridge')
    await wait(1000)
    await click('card:ridge', { stay: true })
    world.devtools.highlight = null
    world.devtools.picked = true
    await wait(1600)
    await click('dev:split')
    await pick(context, [{ label: 'Add Right Split' }, { label: 'Add Left Split' }, { label: 'Add Top Split' }, { label: 'Add Bottom Split' }], 'Add Right Split', { leftward: true })
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
    await wait(500)
    await type('en.wikipedia.org/wiki/Hiking', (value) => { world.commandBar!.query = value }, { cps: 26 })
    await wait(400)
    await key('↩ Return')
    world.commandBar = null
    world.split = { panes: ['local', 'hiking'], focused: 1, ratio: .6, vertical: false }
    await move([980, 430])
    await wait(2200)
  },
})
