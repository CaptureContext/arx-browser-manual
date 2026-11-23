import { defineArxScene } from '~/utils/arxScene'
import { openTab } from '~/utils/arxModel'

export default defineArxScene({
  caption: 'Shift-click a link: it grows into a card over the page, and Esc sends it back. Force Click another, then Open as Tab keeps it.',
  setup(world) {
    world.selected = 'browser'
  },
  async run(context) {
    const { world, move, click, key, wait, point, forceClick, zoom } = context
    zoom([700, 300], 1.3)
    await move('link:application')
    await key('⇧ Click')
    await click('link:application', { stay: true })
    zoom(null)
    world.peek = { tab: 'app-software', origin: point('link:application'), open: true }
    await wait(2600)
    await key('esc')
    world.peek.open = false
    await wait(700)
    world.peek = null
    zoom([600, 300], 1.3)
    await move('link:web-page')
    await wait(300)
    await forceClick('link:web-page', { stay: true })
    zoom(null)
    world.peek = { tab: 'web-page', origin: point('link:web-page'), open: true }
    await wait(1800)
    await click('peek:tab')
    world.peek.open = false
    world.peek = null
    openTab(world, 'web-page')
    await wait(2000)
  },
})
