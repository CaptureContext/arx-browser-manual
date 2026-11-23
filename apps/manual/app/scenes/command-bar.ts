import { defineArxScene } from '~/utils/arxScene'
import { ICON } from '~/utils/arxModel'

export default defineArxScene({
  caption: 'One bar for tabs and commands: type \'arx\', arrow down to the open tab and press Return.',
  setup(world) {
    world.selected = 'browser'
  },
  async run({ world, key, wait, type, move, zoom }) {
    await move([150, 740])
    await key('⌘ T')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
    zoom([640, 330], 1.35)
    await wait(500)
    const rows = [
      { title: 'Arx Settings…', subtitle: 'Command', icon: { kind: 'symbol', name: 'cog' } as const },
      { title: 'About Arx', subtitle: 'Command', icon: ICON.arx },
      { title: 'Check for Arx Updates', subtitle: 'Command', icon: { kind: 'symbol', name: 'arrow-clockwise' } as const },
      { title: 'Arx: a free, open-source browser for Mac', subtitle: 'arxbrowser.net', icon: ICON.arx, action: 'Switch to Tab' },
    ]
    await type('arx', (value) => {
      world.commandBar!.query = value
      world.commandBar!.rows = value.length >= 2 ? rows : []
    })
    await wait(800)
    for (let index = 1; index <= 3; index++) {
      await key('↓')
      world.commandBar!.highlighted = index
      await wait(450)
    }
    await wait(500)
    await key('↩ Return')
    world.commandBar = null
    world.selected = 'arx'
    zoom(null)
    await wait(1800)
  },
})
