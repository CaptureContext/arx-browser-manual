import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: 'When Arx finds an article, a page button appears in the address bar. Click it and the article fades in over the page: pick Sepia, make the text larger. Esc brings the page back, where you left it.',
  setup(world) {
    world.selected = 'browser'
    world.readerButton = true
  },
  async run(context) {
    const { world, wait, click, key, move, swipe, zoom } = context
    const page = world.tabs.browser!.page
    if (page.kind !== 'article') return
    await swipe([0, -90], { at: [780, 480], ms: 600 })
    page.scroll = 330
    await wait(1300)
    zoom([230, 100], 1.7)
    await click('reader-button')
    world.reader = { theme: 'Light', size: 18 }
    await wait(700)
    zoom(null)
    await move([780, 430])
    await wait(1400)
    zoom([1050, 150], 1.5)
    await click('reader:Sepia')
    world.reader.theme = 'Sepia'
    await wait(1200)
    await click('reader:larger')
    world.reader.size = 20
    await wait(500)
    await click('reader:larger', { stay: true })
    world.reader.size = 22
    await wait(1200)
    zoom(null)
    await move([780, 520])
    await wait(1500)
    await key('esc')
    world.reader = null
    await wait(2200)
  },
})
