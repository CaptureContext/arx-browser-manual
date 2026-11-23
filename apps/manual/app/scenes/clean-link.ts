import { defineArxScene } from '~/utils/arxScene'
import { openTab } from '~/utils/arxModel'

export default defineArxScene({
  caption: 'Copy Clean Link drops the tracking parameters and says so in a toast. Copy Original copies the address as it was.',
  setup(world) {
    openTab(world, 'browser-utm')
    world.spaces[0]!.open = world.spaces[0]!.open.filter(id => id !== 'browser')
  },
  async run({ world, key, wait, type, move, click, zoom }) {
    await move([150, 740])
    await key('⌘ K')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
    await wait(500)
    await type('clean link', (value) => {
      world.commandBar!.query = value
      world.commandBar!.rows = value.length >= 3 ? [{ title: 'Copy Clean Link', subtitle: 'Command · ⇧⌘C', icon: { kind: 'symbol', name: 'link' } }] : []
    })
    await wait(700)
    await key('↩ Return')
    world.commandBar = null
    world.toast = { text: 'Copied Clean Link', action: 'Copy Original' }
    zoom([1110, 70], 1.9)
    await wait(900)
    await move('toast-action')
    await wait(900)
    await click('toast-action', { stay: true })
    world.toast = { text: 'Copied Current URL' }
    await move([900, 400])
    await wait(2200)
    world.toast = null
    zoom(null)
    await wait(1200)
  },
})
