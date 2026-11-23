import { ICON, findFolder, removeTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { swipe } from './helpers'

export default defineArxScene({
  caption: 'Tabs move into place. A tab from ⌘T slides in at the top while the others make room; a closed tab folds away; a tab dropped into Pinned and a folder opening or closing move the same way. Switching spaces moves nothing.',
  async run(context) {
    const { world, key, wait, type, move, click, drag, zoom } = context
    const space = world.spaces[0]!
    zoom([170, 470], 1.5)
    await key('⌘ T')
    world.commandBar = { query: '', completion: '', rows: [], highlighted: 0, agent: false }
    await wait(450)
    await type('swift', (value) => {
      world.commandBar!.query = value
      world.commandBar!.rows = value.length > 2 ? [{ title: 'Swift.org', subtitle: 'swift.org', icon: ICON.swift, action: 'Open' }] : []
    })
    await wait(600)
    await key('↩ Return')
    world.commandBar = null
    world.tabs['swift-new'] = { ...world.tabs.swift!, id: 'swift-new' }
    space.open.unshift('swift-new')
    world.selected = 'swift-new'
    await wait(1500)
    await move('tab:arx')
    world.hovered = 'tab:arx'
    await wait(500)
    await click('close:arx')
    world.hovered = null
    removeTab(space, 'arx')
    await wait(1400)
    await drag('tab:browser', 'tab:apple-dev', { hold: 500, onMove: (x, y) => { world.drag = { id: 'browser', x, y } } })
    world.drag = null
    removeTab(space, 'browser')
    space.pinned.push({ type: 'tab', id: 'browser' })
    await wait(1300)
    const folder = findFolder(space.pinned, 'watch')!
    await click('folder:watch')
    folder.open = false
    await wait(1100)
    await click('folder:watch')
    folder.open = true
    await wait(1100)
    zoom(null)
    await swipe(context, 1)
    await wait(600)
  },
})
