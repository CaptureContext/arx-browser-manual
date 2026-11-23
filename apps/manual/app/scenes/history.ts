import type { ArxHistoryEntry } from '~/utils/arxModel'
import { ICON, openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, pick, show } from './helpers'

const entry = (id: string, day: string, time: string, title: string, address: string, icon = ICON.wiki): ArxHistoryEntry => ({ id, day, time, title, address, icon })
const HISTORY = [
  entry('a', 'Today', '3:42 PM', 'Arx: a free, open-source browser for Mac', 'arxbrowser.net', ICON.arx),
  entry('b', 'Today', '3:30 PM', 'Swift.org', 'swift.org', ICON.swift),
  entry('c', 'Today', '2:14 PM', 'capturecontext · GitHub', 'github.com/capturecontext', ICON.github),
  entry('d', 'Today', '11:05 AM', 'Web browser - Wikipedia', 'en.wikipedia.org/wiki/Web_browser'),
  entry('e', 'Yesterday', '6:20 PM', 'Documentation', 'swift.org/documentation', ICON.swift),
  entry('f', 'Yesterday', '5:48 PM', 'Swift Forums', 'forums.swift.org', ICON.swift),
  entry('g', 'Yesterday', '9:12 AM', 'Hiking - Wikipedia', 'en.wikipedia.org/wiki/Hiking'),
  entry('h', 'Friday, November 20', '4:31 PM', 'Getting Started', 'swift.org/getting-started', ICON.swift),
  entry('i', 'Friday, November 20', '1:02 PM', 'Chromium (web browser) - Wikipedia', 'en.wikipedia.org/wiki/Chromium_(web_browser)'),
  entry('j', 'Friday, November 20', '10:40 AM', 'Snowboard - Wikipedia', 'en.wikipedia.org/wiki/Snowboard'),
]
const MENU = [{ label: 'Open in New Tab' }, { separator: true }, { label: 'Delete from History' }, { label: 'Delete This Day…' }, { label: 'Delete All from swift.org…' }]

export default defineArxScene({
  caption: '⌘Y opens the Library on History, by day. Search it, click a page to open it in a new tab, or right-click one and delete everything from its site.',
  async run(context) {
    const { world, wait, click, key, type, move, swipe, zoom } = context
    await key('⌘ Y')
    world.library = { section: 'history', query: '', archive: [], restoring: null, history: HISTORY.map(item => ({ ...item })), scroll: 0 }
    await wait(1200)
    zoom([260, 400], 1.45)
    await swipe([0, -90], { at: [270, 420], ms: 600 })
    world.library!.scroll = 250
    await wait(1300)
    world.library!.scroll = 0
    await click('library:search')
    await type('swift', (value) => { world.library!.query = value })
    await wait(900)
    await move('history:e')
    world.hovered = 'history:e'
    await wait(400)
    await click('history:e', { stay: true })
    world.tabs.docs = { id: 'docs', title: 'Documentation', url: 'swift.org/documentation', icon: ICON.swift, page: { kind: 'article', title: 'Documentation', lead: 'Guides, references and tutorials for the Swift language and its tools.' } }
    openTab(world, 'docs')
    await wait(1400)
    await move('history:h')
    world.hovered = 'history:h'
    await context.rightClick('history:h', { stay: true })
    await pick(context, MENU, 'Delete All from swift.org…')
    zoom(null)
    world.hovered = null
    show(world, {
      kind: 'dialog', id: 'delete', dim: true, width: 300, title: 'Delete all history from swift.org?',
      body: 'Removes 3 pages from this profile’s history. Open tabs, cookies and saved pages stay.',
      buttons: [{ label: 'Cancel' }, { label: 'Delete', danger: true }],
    })
    await wait(1900)
    await click('dialog:Delete')
    hide(world, 'delete')
    world.library!.history = world.library!.history!.filter(item => !item.address.startsWith('swift.org'))
    await wait(900)
    world.library!.query = ''
    await move([820, 500])
    await wait(2200)
  },
})
