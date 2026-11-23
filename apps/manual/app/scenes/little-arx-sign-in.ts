import { defineArxScene } from '~/utils/arxScene'
import { contextMenu, show } from './helpers'

const FRAME = { x: 330, y: 90, w: 800, h: 620 }
const LINK_MENU = [
  { label: 'figma.com/design/onboarding-flow/spec', disabled: true }, { separator: true },
  { label: 'Open Link in New Window' }, { label: 'Open Link in Private Window' }, { label: 'Open in Peek' }, { label: 'Open in Little Arx' }, { label: 'Open in Main Window' }, { separator: true },
  { label: 'Download Linked File' }, { separator: true },
  { label: 'Copy', submenu: true }, { label: 'Share…' },
]

export default defineArxScene({
  caption: 'Sign in with Google from a page in Little Arx opens the sign-in in a second Little Arx, right over the first. When it closes itself you\'re back in the first one, signed in. Open in Main Window sends a link to a new tab in the Little Arx\'s space.',
  setup(world) {
    world.overlays.push({ kind: 'little', ...FRAME, tab: 'design', space: 'Personal', profile: 'Personal' })
  },
  async run(context) {
    const { world, wait, click, move } = context
    const page = world.tabs.design!.page
    if (page.kind !== 'design') return
    await wait(1000)
    await click('design:google')
    await wait(300)
    show(world, { kind: 'little', ...FRAME, tab: 'chooser', space: 'Personal', profile: 'Personal' })
    context.label('A second Little Arx')
    await wait(1900)
    await click('chooser:account')
    await wait(500)
    world.overlays.pop()
    page.signedIn = true
    await move([760, 300])
    await wait(1800)
    await contextMenu(context, 'design:link', LINK_MENU, 'Open in Main Window', 1500)
    world.tabs.spec = { id: 'spec', title: 'Onboarding spec – Figma', url: 'figma.com/design/onboarding-flow/spec', icon: world.tabs.design!.icon, page: { kind: 'design', signedIn: true } }
    world.spaces[0]!.open.unshift('spec')
    world.selected = 'spec'
    // The Little Arx stays open, floating over the main window and its new tab.
    await move([140, 560])
    await wait(2400)
  },
})
