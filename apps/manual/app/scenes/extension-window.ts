import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'Click 1Password in the site menu and pop its window out: the extension\'s own window opens in a Little Arx in front, ready to type in. When 1Password unlocks and closes it, the Little Arx goes too.',
  setup(world) {
    world.selected = 'repos'
  },
  async run(context) {
    const { world, wait, click, type, move, zoom } = context
    zoom([200, 330], 1.5)
    await click('site-info')
    world.siteMenu = {
      host: 'github.com', confirmClear: false,
      extensions: [{ name: '1Password', color: '#1a66d6' }, { name: 'Emoji', color: '#e3743c' }, { name: 'Units', color: '#2e9d6a' }],
      permissions: [
        { label: 'Camera', icon: 'video', value: 'Ask' },
        { label: 'Microphone', icon: 'microphone', value: 'Ask' },
        { label: 'Notifications', icon: 'bell', value: 'Ask' },
      ],
    }
    await wait(1100)
    await click('extension:1Password')
    world.siteMenu.popup = { name: '1Password', color: '#1a66d6' }
    await wait(1200)
    await click('extension-popup:window')
    world.siteMenu = null
    zoom(null)
    show(world, { kind: 'little', x: 340, y: 90, w: 620, h: 520, tab: 'unlock', space: 'Personal', profile: 'Personal' })
    const page = world.tabs.unlock!.page
    if (page.kind !== 'unlock') return
    await wait(400)
    await move('unlock:field')
    await wait(700)
    // Dots only: the preview counts keystrokes and never holds a password.
    await type('············', (value) => { page.typed = value.length }, { cps: 14 })
    await wait(500)
    context.label('Unlocked')
    await wait(700)
    hide(world, 'little')
    page.typed = 0
    await move([780, 430])
    await wait(1800)
  },
})
