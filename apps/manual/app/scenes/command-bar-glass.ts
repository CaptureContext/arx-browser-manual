import { ICON } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'

const ACTIONS = [
  { title: 'Switch to Tab', shortcut: '↩', icon: 'app-window-list' },
  { title: 'Open in New Tab', shortcut: '⌘↩', icon: 'plus-square' },
  { title: 'Open in Peek', shortcut: '⇧↩', icon: 'eye' },
  { title: 'Open in Little Arx', shortcut: '⌥⌘↩', icon: 'app-window' },
  { title: 'Copy URL', shortcut: '⇧⌘C', icon: 'link' },
]

export default defineArxScene({
  caption: 'The command bar is a glass panel in a raised frame, and the highlighted result is raised too. Actions ⌘K floats over the results in the corner; click it and it becomes a search field with the result\'s actions above it. Esc brings Actions ⌘K back.',
  setup(world) {
    world.selected = 'repos'
  },
  async run(context) {
    const { world, key, wait, type, move, click, zoom } = context
    await move([150, 740])
    await key('⌘ T')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false, actions: { open: false, query: '', items: ACTIONS, highlighted: 0 } }
    zoom([640, 360], 1.35)
    await wait(500)
    const rows = [
      { title: 'Swift.org', subtitle: 'swift.org', icon: ICON.swift, action: 'Switch to Tab' },
      { title: 'Swift Forums', subtitle: 'forums.swift.org', icon: ICON.swift, action: 'Switch to Tab' },
      { title: 'Documentation', subtitle: 'swift.org/documentation', icon: ICON.swift, action: 'Open' },
      { title: 'Getting Started', subtitle: 'swift.org/getting-started', icon: ICON.swift, action: 'Open' },
      { title: 'swift', subtitle: 'Search Google', icon: ICON.google, action: 'Search' },
    ]
    await type('sw', (value) => {
      world.commandBar!.query = value
      world.commandBar!.rows = value.length >= 2 ? rows : []
    })
    await wait(2200)
    await click('actions')
    world.commandBar.actions!.open = true
    await move([560, 380])
    await wait(2600)
    await key('esc')
    world.commandBar.actions!.open = false
    await wait(2200)
    zoom(null)
    world.commandBar = null
  },
})
