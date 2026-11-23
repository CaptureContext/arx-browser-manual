import { defineArxScene } from '~/utils/arxScene'

const pad = ([x, y, w, h]: [number, number, number, number]): [number, number, number, number] => [x - 6, y - 6, w + 12, h + 12]

export default defineArxScene({
  caption: 'Capture Area… outlines the block under the pointer: click a paragraph and copy it from the menu beside the frame. Then drag over part of the page and choose Save….',
  setup(world) {
    world.selected = 'browser'
  },
  async run(context) {
    const { world, key, wait, type, move, click, drag, rect, zoom } = context
    const start = async () => {
      await move([150, 740])
      await key('⌘ K')
      world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
      await wait(400)
      await type('capture area', (value) => {
        world.commandBar!.query = value
        world.commandBar!.rows = value.length > 3 ? [{ title: 'Capture Area…', subtitle: 'Command', icon: { kind: 'symbol', name: 'crop' } }] : []
      }, { cps: 20 })
      await wait(500)
      await key('↩ Return')
      world.commandBar = null
    }

    await start()
    world.capture = { rect: pad(rect('figure')), picking: true, menu: false }
    zoom([760, 330], 1.35)
    await move('figure')
    await wait(800)
    await move('paragraph:lead')
    world.capture.rect = pad(rect('paragraph:lead'))
    await wait(900)
    await click('paragraph:lead', { stay: true })
    world.capture.picking = false
    world.capture.menu = true
    await wait(900)
    await move('capture:Copy')
    world.capture.highlighted = 0
    await wait(400)
    await click('capture:Copy', { stay: true })
    world.capture = null
    world.toast = { text: 'Copied Capture' }
    await wait(1200)
    world.toast = null
    zoom(null)

    await start()
    const [x, y, w, h] = rect('figure')
    world.capture = { rect: [x, y, 0, 0], picking: true, menu: false }
    await move([x - 4, y - 4])
    await drag([x - 4, y - 4], [x + w + 4, y + h + 4], {
      hold: 150,
      onMove: (px, py) => { if (world.capture) world.capture.rect = [x - 4, y - 4, px - x + 4, py - y + 4] },
    })
    world.capture.picking = false
    world.capture.menu = true
    await wait(800)
    await move('capture:Save…')
    world.capture.highlighted = 1
    await wait(400)
    await click('capture:Save…', { stay: true })
    world.saveSheet = { name: 'Web browser - Wikipedia.png' }
    await wait(1800)
    await click('save:cancel')
    world.saveSheet = null
    world.capture = null
    await move([780, 430])
    await wait(1200)
  },
})
