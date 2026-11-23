import { defineArxScene } from '~/utils/arxScene'
import { openMenu } from './helpers'

export default defineArxScene({
  caption: 'Drop a tab on a tab to split the view, resize the panes, double-click the divider to even them out, then stack the split.',
  async run(context) {
    const { world, move, wait, drag, click, zoom } = context
    zoom([300, 520], 1.4)
    await wait(600)
    await drag('tab:browser', 'tab:arx', {
      hold: 600,
      onMove: (x, y) => { world.drag = { id: 'browser', x, y } },
    })
    world.drag = null
    world.split = { panes: ['arx', 'browser'], focused: 1, ratio: .5, vertical: false }
    zoom(null)
    await wait(1500)
    // Drag the divider; the panes follow the pointer.
    await drag('split-divider', [660, 420], {
      hold: 200,
      onMove: (x) => { if (world.split) world.split.ratio = Math.min(.75, Math.max(.25, (x - 290) / 978)) },
    })
    await wait(900)
    await context.doubleClick('split-divider')
    world.split!.ratio = .5
    await wait(1300)
    await context.rightClick('tab:arx')
    openMenu(context, [
      { label: 'Convert to Vertical Split View' },
      { label: 'Swap Panes' },
      { separator: true },
      { label: 'Close Split View' },
    ])
    await wait(500)
    await move('menu:Convert to Vertical Split View')
    world.menu!.highlighted = 0
    await wait(400)
    await click('menu:Convert to Vertical Split View', { stay: true })
    world.menu = null
    world.split!.vertical = true
    await move([780, 430])
    await wait(2200)
  },
})
