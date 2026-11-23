import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'With Ask for a Destination on, a link clicked in Mail opens the Runway at the pointer, the most recent profile first. ↓ and Return open it in Little Arx in Work.',
  setup(world) {
    world.windowHidden = true
    world.tabs.chooser!.page = { kind: 'chooser', site: 'Linear', account: 'max@capturecontext.dev' }
    world.overlays.push({
      kind: 'app', id: 'mail', x: 250, y: 130, w: 620, h: 400, title: 'Inbox — Mail', heading: 'Finish signing in to Linear',
      lines: [
        { text: 'Hi Max,' },
        { text: 'To finish setting up your workspace, sign in with your Google account.' },
        { text: 'Sign in with Google', link: true },
        { text: 'This link works for the next ten minutes.' },
      ],
    })
  },
  async run(context) {
    const { world, wait, click, key, move, pointer } = context
    await wait(900)
    await click('line:Sign in with Google')
    await wait(250)
    const runway = show(world, {
      kind: 'runway', x: pointer.x, y: pointer.y, link: 'accounts.google.com/signin', selected: 0,
      rows: [
        { profile: 'Personal', space: 'Personal', icon: 'house' },
        { profile: 'Work', space: 'Work', icon: 'monitor' },
        { profile: 'Shops', space: 'Shops', icon: 'cart' },
      ],
    })
    await move([pointer.x + 330, pointer.y + 150])
    await wait(1600)
    await key('↓')
    runway.selected = 1
    await wait(900)
    await key('↩ Return')
    hide(world, 'runway')
    show(world, { kind: 'little', x: 420, y: 70, w: 620, h: 560, tab: 'chooser', space: 'Work', profile: 'Work' })
    await move([1100, 420])
    await wait(2600)
  },
})
