import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { contextMenu } from './helpers'

const INSPECT = [{ separator: true }, { label: 'Inspect Element' }]
const SELECTION = [
  { label: 'Look Up “Graphical browsers followed”' }, { separator: true },
  { label: 'Copy' }, { separator: true },
  { label: 'Search for “Graphical browsers followed”' }, { label: 'Share…' }, { separator: true },
  { label: 'Speech', submenu: true },
]
const IMAGE = [{ label: 'Open Image in New Tab' }, { label: 'Save Image As…' }, { separator: true }, { label: 'Copy Image' }, { label: 'Copy Image Address' }]
const video = (loop: boolean) => [
  { label: 'Loop', checked: loop }, { label: 'Show Controls', checked: true }, { label: 'Picture in Picture' }, { label: 'Copy Video Frame' }, { separator: true },
  { label: 'Open Video in New Tab' }, { label: 'Save Video As…' }, { label: 'Copy Video Address' },
]

export default defineArxScene({
  caption: 'What you right-click decides the menu. Selected text offers Look Up and Search, an image Save Image As…, and a video Loop, which is checked the next time the menu opens. In developer mode every menu ends with Inspect Element.',
  setup(world) {
    world.selected = 'browser'
    world.spaces[0]!.open.push('talk')
    const page = world.tabs.talk!.page
    if (page.kind === 'video') page.playing = true
  },
  async run(context) {
    const { world, wait, click, rect, drag } = context
    const page = world.tabs.browser!.page
    if (page.kind !== 'article') return
    const [x, y, w, h] = rect('sentence')
    await drag([x, y + h / 2], [x + w, y + h / 2], { hold: 150 })
    page.selected = true
    await wait(500)
    await contextMenu(context, 'sentence', SELECTION, 'Look Up “Graphical browsers followed”', 1500)
    context.label('Look Up')
    await wait(1200)
    await contextMenu(context, 'sentence', SELECTION, 'Search for “Graphical browsers followed”', 900)
    page.selected = false
    world.tabs.search = { id: 'search', title: 'Graphical browsers followed - Google Search', url: 'google.com/search', icon: { kind: 'brand', name: 'brand-google', color: '#4285f4' }, page: { kind: 'blank' } }
    world.spaces[0]!.open.splice(2, 0, 'search')
    world.selected = 'search'
    await wait(1500)
    await click('tab:browser')
    world.selected = 'browser'
    await wait(700)
    await contextMenu(context, 'figure', IMAGE, 'Save Image As…', 1300)
    world.saveSheet = { name: 'browser.png' }
    await wait(1500)
    await click('save:cancel')
    world.saveSheet = null
    await click('tab:talk')
    openTab(world, 'talk')
    await wait(800)
    await contextMenu(context, 'video:player', video(false), 'Loop', 1300)
    await wait(700)
    world.developerMode = true
    context.label('Developer mode on')
    await context.rightClick('video:player', { stay: true })
    world.menu = { x: context.pointer.x + 2, y: context.pointer.y, items: [...video(true), ...INSPECT] }
    await wait(700)
    await context.move('menu:Inspect Element')
    world.menu.highlighted = world.menu.items.length - 1
    await wait(2000)
    world.menu = null
  },
})
