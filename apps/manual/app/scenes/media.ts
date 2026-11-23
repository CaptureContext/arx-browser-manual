import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'Start a video and switch tabs: it floats into a Picture in Picture window. Pinch to resize it, drag it to a corner, then go back to its tab from Media in the Library.',
  setup(world) {
    openTab(world, 'talk')
  },
  async run(context) {
    const { world, wait, click, drag, swipe, label, move } = context
    const page = world.tabs.talk!.page
    if (page.kind !== 'video') return
    await click('video:play')
    page.playing = true
    await wait(1400)
    await click('tab:arx')
    world.selected = 'arx'
    const pip = show(world, { kind: 'pip', x: 930, y: 560, w: 300, h: 170, title: 'Swift concurrency, explained' })
    await wait(1000)
    await move('pip')
    label('Pinch to resize')
    await swipe([60, 30], { ms: 600 })
    Object.assign(pip, { x: 870, y: 520, w: 380, h: 214 })
    await wait(900)
    await drag('pip', [480, 160], { hold: 200, onMove: (x, y) => { pip.x = x - pip.w / 2; pip.y = y - pip.h / 2 } })
    Object.assign(pip, { x: 300, y: 20 })
    await wait(900)
    await click('library')
    world.library = { section: null, query: '', archive: [], restoring: null, media: ['talk'] }
    await wait(700)
    await click('library:media')
    world.library.section = 'media'
    await wait(800)
    await click('media:talk')
    world.library = null
    hide(world, 'pip')
    world.selected = 'talk'
    await move([760, 600])
    await wait(1600)
  },
})
