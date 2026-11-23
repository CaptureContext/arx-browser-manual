import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide } from './helpers'

export default defineArxScene({
  caption: 'A link clicked in Messages opens in Little Arx, over the app. Read it there, then ⌘O moves it into a space in your Arx window.',
  setup(world) {
    world.windowHidden = true
    world.overlays.push({ kind: 'messages', x: 300, y: 150, w: 560, h: 420 })
  },
  async run(context) {
    const { world, wait, click, key, move } = context
    await wait(900)
    await click('message-link')
    world.overlays.push({ kind: 'little', x: 620, y: 70, w: 560, h: 640, tab: 'release' })
    await move([900, 400])
    await wait(2200)
    await key('⌘ O')
    hide(world, 'little')
    hide(world, 'messages')
    world.windowHidden = false
    world.space = 2
    openTab(world, 'release')
    await wait(2200)
  },
})
