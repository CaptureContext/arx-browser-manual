import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: '⇧⌘H starts Hide Element: whatever is under the pointer gets a red outline, and a click hides it for good. ⌘Z brings the last one back. Return opens the list of everything hidden on the site; the eye shows one again, and Done reloads the page to bring back what was hidden on an earlier visit.',
  setup(world) {
    openTab(world, 'news')
    const page = world.tabs.news!.page
    // The promo banner was hidden on an earlier visit.
    if (page.kind === 'news') page.hidden = ['banner']
  },
  async run(context) {
    const { world, wait, click, key, move, rect } = context
    const page = world.tabs.news!.page
    if (page.kind !== 'news') return
    const banner = { id: 'banner', title: 'Banner', detail: 'Header · .promo-banner' }
    await wait(700)
    await key('⇧ ⌘ H')
    world.picker = { outline: null, list: false, site: 'dailyledger.example', entries: [banner], canUndo: false, note: false }
    await wait(1200)
    const outline = async (target: string, label: string) => {
      await move(target)
      world.picker!.outline = { rect: rect(target), label }
      await wait(900)
    }
    await outline('news:most', 'Most read')
    await click('news:most', { stay: true })
    world.picker.outline = null
    page.hidden.push('most')
    world.picker.entries.push({ id: 'most', title: 'Most read', detail: 'Sidebar · .most-read' })
    world.picker.canUndo = true
    await wait(1000)
    await outline('news:letter', 'Get the morning letter')
    await click('news:letter', { stay: true })
    world.picker.outline = null
    page.hidden.push('letter')
    world.picker.entries.push({ id: 'letter', title: 'Get the morning letter', detail: 'Sidebar · .newsletter' })
    await wait(1100)
    await key('⌘ Z')
    page.hidden = page.hidden.filter(id => id !== 'letter')
    world.picker.entries.pop()
    world.picker.canUndo = false
    await wait(1400)
    await key('↩ Return')
    world.picker.list = true
    await wait(1600)
    await click('hide:show:banner')
    world.picker.entries = world.picker.entries.filter(item => item.id !== 'banner')
    world.picker.note = true
    await wait(2000)
    await click('hide:done')
    world.picker = null
    // The page reloads: the banner hidden earlier is back, and Most read stays hidden.
    context.label('The page reloads')
    await wait(500)
    page.hidden = ['most']
    await move([820, 480])
    await wait(2600)
  },
})
