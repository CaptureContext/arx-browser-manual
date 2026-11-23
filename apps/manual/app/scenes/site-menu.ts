import { defineArxScene } from '~/utils/arxScene'
import { pick } from './helpers'

export default defineArxScene({
  caption: 'The site menu: extensions, this site\'s permissions, and clearing its cookies.',
  setup(world) {
    world.selected = 'repos'
  },
  async run(context) {
    const { world, click, wait, key, zoom, move } = context
    zoom([200, 330], 1.6)
    await click('site-info')
    world.siteMenu = {
      host: 'github.com',
      confirmClear: false,
      darkPage: true,
      permissions: [
        { label: 'Camera', icon: 'video', value: 'Ask' },
        { label: 'Microphone', icon: 'microphone', value: 'Ask' },
        { label: 'Location', icon: 'geopin', value: 'Ask' },
        { label: 'Notifications', icon: 'bell', value: 'Ask' },
        { label: 'Pop-ups and redirects', icon: 'app-window', value: 'Block' },
        { label: 'Clipboard', icon: 'copy-clipboard', value: 'Ask' },
      ],
    }
    await wait(1300)
    await click('permission:Camera')
    await pick(context, [{ label: 'Default (Ask)', checked: true }, { label: 'Allow' }, { label: 'Block' }, { label: 'Ask' }], 'Block')
    world.siteMenu.permissions[0]!.value = 'Block'
    world.siteMenu.permissions[0]!.set = true
    await wait(1100)
    await click('site-menu:more')
    await pick(context, [
      { label: 'Clear Cache' },
      { label: 'Clear Cookies' },
      { separator: true },
      { label: 'Manage Extensions' },
      { label: 'Add Extension' },
      { separator: true },
      { label: 'All Site Settings' },
    ], 'Clear Cookies')
    world.siteMenu.confirmClear = true
    await wait(1400)
    await click('confirm-clear')
    world.siteMenu.confirmClear = false
    await wait(900)
    await key('esc')
    world.siteMenu = null
    zoom(null)
    await move([780, 430])
    await wait(1200)
  },
})
