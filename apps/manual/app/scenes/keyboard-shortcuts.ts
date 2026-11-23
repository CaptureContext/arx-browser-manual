import { defineArxScene } from '~/utils/arxScene'
import { ICON } from '~/utils/arxModel'

export default defineArxScene({
  caption: '⌘K finds a tab in a few letters; ⌘S hides the sidebar, and the left edge brings it back.',
  async run({ world, key, wait, type, move, zoom }) {
    await move([700, 500])
    await key('⌘ K')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
    zoom([640, 300], 1.5)
    await wait(500)
    await type('swi', (value) => {
      world.commandBar!.query = value
      world.commandBar!.rows = value.length >= 2
        ? [
            { title: 'Swift.org', subtitle: 'swift.org', icon: ICON.swift, action: 'Switch to Tab' },
            { title: 'Swift Forums', subtitle: 'forums.swift.org', icon: ICON.swift, action: 'Switch to Tab' },
          ]
        : []
    }, { cps: 8 })
    await wait(900)
    await key('↩ Return')
    world.commandBar = null
    world.selected = 'swift'
    zoom(null)
    await wait(1500)
    await key('⌘ S')
    world.sidebarHidden = true
    await wait(1600)
    await move([3, 420], { ms: 700 })
    world.sidebarFloating = true
    await wait(1600)
    await move([520, 420], { ms: 600 })
    world.sidebarFloating = false
    await wait(1200)
    await key('⌘ S')
    world.sidebarHidden = false
    await wait(1300)
  },
})
