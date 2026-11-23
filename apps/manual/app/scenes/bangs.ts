import { defineArxScene } from '~/utils/arxScene'
import { ICON, openTab } from '~/utils/arxModel'

export default defineArxScene({
  caption: 'A bang searches one site directly; a search shortcut\'s keyword and Tab does the same.',
  async run({ world, key, wait, type, move, zoom }) {
    await move([150, 740])
    await key('⌘ T')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
    zoom([640, 300], 1.45)
    await wait(500)
    await type('!gh swift-composable-architecture', (value) => {
      world.commandBar!.query = value
      world.commandBar!.rows = value.length > 4 ? [{ title: `Search GitHub for “${value.slice(4)}”`, subtitle: '!gh', icon: ICON.github }] : []
    }, { cps: 22 })
    await wait(800)
    await key('↩ Return')
    world.commandBar = null
    openTab(world, 'gh-search')
    zoom(null)
    await wait(1800)

    await key('⌘ T')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
    zoom([640, 300], 1.45)
    await wait(500)
    await type('w', (value) => { world.commandBar!.query = value })
    await wait(500)
    await key('⇥ Tab')
    world.commandBar!.query = ''
    world.commandBar!.chip = { label: 'Wikipedia', icon: ICON.wiki }
    await wait(700)
    await type('Chromium', (value) => {
      world.commandBar!.query = value
      world.commandBar!.rows = value.length > 2 ? [{ title: `Search Wikipedia for “${value}”`, icon: ICON.wiki }] : []
    })
    await wait(800)
    await key('↩ Return')
    world.commandBar = null
    openTab(world, 'chromium')
    zoom(null)
    await wait(1800)
  },
})
