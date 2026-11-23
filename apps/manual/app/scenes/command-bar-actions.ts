import { ICON } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'

const ACTIONS = [
  { title: 'Open', shortcut: '↩', icon: 'arrow-ne' },
  { title: 'Open in Peek', shortcut: '⇧↩', icon: 'eye' },
  { title: 'Open in Little Arx', shortcut: '⌥⌘↩', icon: 'app-window' },
  { title: 'Copy URL', shortcut: '⇧⌘C', icon: 'link' },
  { title: 'Delete from History', shortcut: '⌃X', icon: 'trash', danger: true },
  { title: 'Delete All from capturecontext.dev', shortcut: '⌃⇧X', icon: 'trash', danger: true },
]

export default defineArxScene({
  caption: 'Every result has more than one action. Arrow down to a page from history, press ⌘K, type "peek" and press Return: the page opens in Peek.',
  setup(world) {
    world.selected = 'browser'
  },
  async run(context) {
    const { world, key, wait, type, move, zoom } = context
    await move([150, 740])
    await key('⌘ T')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false, actions: { open: false, query: '', items: ACTIONS, highlighted: 0 } }
    zoom([640, 360], 1.35)
    await wait(500)
    const rows = [
      { title: 'capturecontext · GitHub', subtitle: 'github.com/capturecontext', icon: ICON.github, action: 'Switch to Tab' },
      { title: 'CaptureContext', subtitle: 'capturecontext.dev', icon: ICON.arx, action: 'Open' },
      { title: 'Capture - Wikipedia', subtitle: 'en.wikipedia.org/wiki/Capture', icon: ICON.wiki, action: 'Open' },
      { title: 'cap', subtitle: 'Search Google', icon: ICON.google, action: 'Search' },
    ]
    await type('cap', (value) => {
      world.commandBar!.query = value
      world.commandBar!.rows = value.length >= 2 ? rows : []
    })
    await wait(900)
    await key('↓')
    world.commandBar.highlighted = 1
    await wait(900)
    await key('⌘ K')
    const actions = world.commandBar.actions!
    actions.open = true
    await wait(1700)
    await type('peek', (value) => { actions.query = value })
    await wait(900)
    await key('↩ Return')
    world.commandBar = null
    zoom(null)
    world.peek = { tab: 'fav-cc', origin: [640, 330], open: true }
    await move([1180, 620])
    await wait(2600)
    world.peek = null
  },
})
