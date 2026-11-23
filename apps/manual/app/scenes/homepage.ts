import { removeTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'

const TIPS = [
  'Press ⌘T to open a new tab. Type part of a site\'s name and pick it from the list, or press Return to search.',
  '⌘L puts you in the address bar from anywhere, even while a page has the keyboard.',
  '⌘K opens the command bar: tabs, folders, spaces and commands, all in one search.',
  'Hide the sidebar with ⌘S. Rest the pointer on the window\'s left edge to peek at it without pinning it back.',
]

export default defineArxScene({
  caption: 'Close the last tab and the homepage appears, with a tip that changes every few seconds. Click the page, then → and ← step through the tips. The pointer stays the regular arrow.',
  setup(world) {
    world.spaces[0]!.open = ['arx']
  },
  async run(context) {
    const { world, wait, move, click, key } = context
    const show = (tip: number) => { world.homepage = { tip, total: 99, text: TIPS[tip - 1]!, turn: (world.homepage?.turn ?? 0) + 1 } }
    await move('tab:arx')
    world.hovered = 'tab:arx'
    await wait(600)
    await click('close:arx')
    world.hovered = null
    removeTab(world.spaces[0]!, 'arx')
    world.selected = null
    show(1)
    await move([780, 560])
    // A tip's turn is seven seconds; the first one fades into the next by itself.
    await wait(7000)
    show(2)
    await wait(2600)
    await click([820, 300])
    await wait(500)
    await key('→')
    show(3)
    await wait(1900)
    await key('→')
    show(4)
    await wait(1900)
    await key('←')
    show(3)
    await wait(1600)
    await move([150, 300])
    await wait(700)
    await move([900, 620])
    await wait(1400)
  },
})
