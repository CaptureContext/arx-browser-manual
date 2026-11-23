import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: 'Rest on a link for its address at the page\'s bottom-left. Hold ⌘, ⇧⌘ or ⌥ and the label says what a click will do. With the pointer over that corner, the label moves to the bottom-right.',
  setup(world) {
    world.selected = 'browser'
    const page = world.tabs.browser!.page
    // A link in the page's bottom-left corner, where the label usually sits.
    if (page.kind === 'article') page.corner = true
  },
  async run(context) {
    const { world, wait, move, zoom } = context
    const first = 'en.wikipedia.org/wiki/Application_software'
    await move('link:application')
    await wait(300)
    world.linkStatus = { address: first, side: 'left' }
    zoom([560, 600], 1.5)
    await wait(1700)
    context.label('Hold ⌘')
    world.linkStatus = { verb: 'Open', address: first, action: 'in a new tab behind this one', side: 'left' }
    await wait(1900)
    context.label('Hold ⇧ ⌘')
    world.linkStatus = { verb: 'Open', address: first, action: 'in a new tab and go to it', side: 'left' }
    await wait(1900)
    world.linkStatus = { address: first, side: 'left' }
    await wait(700)
    context.label('Hold ⌥')
    world.linkStatus = { verb: 'Download', address: first, side: 'left' }
    await wait(1900)
    world.linkStatus = null
    await move('link:corner')
    await wait(300)
    world.linkStatus = { address: 'en.wikipedia.org/wiki/Help:Contents', side: 'right' }
    zoom([760, 640], 1.3)
    await wait(2400)
    world.linkStatus = null
    zoom(null)
  },
})
