import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'Capture in the developer header frames the page in a device on a colored background. Drag Background to orange, turn on Capture in Portrait Mode and press Return: the framed shot stays on the page with its menu.',
  setup(world) {
    world.developerMode = true
    openTab(world, 'local')
  },
  async run(context) {
    const { world, wait, click, drag, key, move, rect, point } = context
    await wait(600)
    await click('dev:capture')
    const [x, y] = point('dev:capture')
    const popover = show(world, { kind: 'devicecapture', x: x - 132, y: y + 16, portrait: false, hue: .6 })
    await wait(1400)
    const [sx, sy, sw] = rect('devcap:slider')
    await drag('devcap:handle', [sx + sw * .08, sy + 2], { hold: 250, onMove: (px) => { popover.hue = Math.min(1, Math.max(0, (px - sx) / sw)) } })
    popover.hue = .08
    await wait(700)
    await click('devcap:portrait')
    popover.portrait = true
    await wait(1200)
    await key('↩ Return')
    hide(world, 'devicecapture')
    world.capture = { rect: [470, 150, 420, 500], picking: false, menu: true, device: { portrait: true, hue: .08 } }
    await wait(1500)
    await move('capture:Copy')
    world.capture.highlighted = 0
    await wait(400)
    await click('capture:Copy', { stay: true })
    world.capture = null
    world.toast = { text: 'Copied Capture' }
    await wait(1500)
    world.toast = null
  },
})
