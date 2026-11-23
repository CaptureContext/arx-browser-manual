import { defineArxScene } from '~/utils/arxScene'
import { ask, command, endPreview, openMenu, preview, searchRow, SPACE_MENU, swipe } from './helpers'

// The home page's tour: spaces, previews, Peek, Split View, a chat, profiles and
// the hidden sidebar, in about a minute.
export default defineArxScene({
  caption: 'A minute of Arx: swipe between spaces, preview tabs and folders, Peek a link, split the view, ask for a summary, see each space\'s profile, then hide the sidebar.',
  async run(context) {
    const { world, wait, move, click, drag, key, zoom } = context

    // Spaces
    zoom([200, 420], 1.5)
    await wait(700)
    await swipe(context, 1)
    await swipe(context, 2)
    await swipe(context, 1)
    await swipe(context, 0)

    // Previews of a tab and a folder
    await preview(context, 'tab', 'apple-dev')
    await preview(context, 'folder', 'watch', 1600)
    endPreview(context)
    zoom(null)
    await move([780, 430])
    await wait(400)

    // Peek
    await move('link:github')
    await key('⇧ Click')
    await click('link:github', { stay: true })
    world.peek = { tab: 'repos', origin: context.point('link:github'), open: true }
    await wait(2600)
    await key('esc')
    world.peek.open = false
    await wait(600)
    world.peek = null

    // Split View: drop a tab on a tab
    zoom([300, 520], 1.4)
    await drag('tab:browser', 'tab:arx', {
      hold: 500,
      onMove: (x, y) => { world.drag = { id: 'browser', x, y } },
    })
    world.drag = null
    world.split = { panes: ['arx', 'browser'], focused: 1, ratio: .5, vertical: false }
    zoom(null)
    await wait(1800)

    // Ask for a summary
    await move([150, 740])
    await command(context, 'Summarize this page', [searchRow('Summarize this page')], { agent: true })
    zoom([1060, 420], 1.45)
    await ask(context, 'Summarize this page')
    await wait(1800)
    await click('chat:hide')
    world.chat = null
    zoom(null)
    await wait(700)

    // Each space has a profile
    zoom([200, 640], 1.6)
    await context.rightClick('space:personal')
    openMenu(context, SPACE_MENU)
    await wait(500)
    await move('menu:Set Profile')
    world.menu!.highlighted = 2
    world.menu!.sub = { items: [{ label: 'Personal', checked: true }, { label: 'Shops' }, { label: 'Work' }] }
    await wait(2000)
    await key('esc')
    world.menu = null
    zoom(null)
    await move([780, 430])
    await wait(500)

    // Hide the sidebar
    await key('⌘ S')
    world.sidebarHidden = true
    await wait(2000)
    await key('⌘ S')
    world.sidebarHidden = false
    await wait(1200)
  },
})
