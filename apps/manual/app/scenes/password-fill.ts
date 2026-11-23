import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show, touchID } from './helpers'

export default defineArxScene({
  caption: 'Click the username field: the saved account is listed right below it. Pick it, confirm with Touch ID, and Arx fills the username and the password.',
  setup(world) {
    openTab(world, 'signin')
  },
  async run(context) {
    const { world, wait, click, key, move, rect, zoom } = context
    const page = world.tabs.signin!.page
    if (page.kind !== 'signin') return
    zoom([780, 330], 1.35)
    await click('signin:user')
    await wait(350)
    const [x, y, w, h] = rect('signin:user')
    const list = show(world, { kind: 'autofill', x, y: y + h + 4, w, icon: 'key', rows: [{ title: 'max-krouk' }], manage: 'Manage passwords…', selected: null })
    await wait(900)
    await move('autofill:0')
    list.selected = 0
    await wait(500)
    await click('autofill:0', { stay: true })
    hide(world, 'autofill')
    await touchID(context, 'Arx is trying to fill a saved password.')
    page.user = 'max-krouk'
    // The page shows dots for whatever fills its password field; a preview never holds a real one.
    page.password = '············'
    await wait(1200)
    await key('↩ Return')
    await wait(300)
    page.signedIn = true
    zoom(null)
    await wait(1800)
  },
})
