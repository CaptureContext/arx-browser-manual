import { demoSettings, openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show, terminal } from './helpers'

export default defineArxScene({
  caption: 'With developer mode on, localhost:3000 with no server running explains what\'s wrong. Start the server, try again, then ⌥⌘I opens DevTools.',
  setup(world) {
    world.settings = demoSettings()
    world.settings.pane = 'developer'
    world.tabs.local!.page = { kind: 'error', host: 'localhost:3000' }
  },
  async run(context) {
    const { world, wait, click, key, type, zoom } = context
    zoom([640, 280], 1.25)
    await wait(700)
    await click('setting:developer-mode')
    world.settings!.developerMode = true
    world.developerMode = true
    await wait(900)
    zoom(null)
    await key('⌘ W')
    world.settings = null
    await key('⌘ T')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
    await type('localhost:3000', (value) => { world.commandBar!.query = value })
    await key('↩ Return')
    world.commandBar = null
    openTab(world, 'local')
    await wait(2200)
    show(world, { kind: 'terminal', x: 640, y: 430, w: 560, h: 300, lines: ['~/trailhead'], typing: '' })
    await terminal(context, 'npm run dev', ['> trailhead@1.0.0 dev', '  Local:   http://localhost:3000/', '  ready in 412 ms'])
    hide(world, 'terminal')
    await wait(400)
    await click('error:retry')
    world.tabs.local!.page = { kind: 'trailhead' }
    await wait(1400)
    await key('⌥ ⌘ I')
    world.devtools = { tab: 'local', panel: 'Console', picked: false, highlight: null, dock: 'right', width: 400 }
    await wait(2000)
  },
})
