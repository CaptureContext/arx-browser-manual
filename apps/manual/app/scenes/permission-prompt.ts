import { demoSettings, ICON, openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { dismiss, show } from './helpers'

export default defineArxScene({
  caption: 'A page asks to show notifications, and Arx asks you on the page\'s window. Esc leaves it undecided, so the site can ask again; Block is remembered under Sites in the profile\'s Site Settings.',
  setup(world) {
    openTab(world, 'ask')
  },
  async run(context) {
    const { world, wait, click, key, move, zoom } = context
    const ask = async () => {
      await click('ask:button')
      await wait(300)
      show(world, {
        kind: 'prompt', id: 'notifications', icon: ICON.github, badge: { icon: 'bell' },
        title: 'github.com wants to show notifications',
        buttons: [{ label: 'Cancel', hint: 'esc' }, { label: 'Block' }, { label: 'Allow', primary: true, hint: '↩' }],
      })
      await move([900, 250])
      await wait(1500)
    }
    await ask()
    await key('esc')
    dismiss(world, 'notifications')
    await wait(900)
    await ask()
    await click('prompt:Block')
    dismiss(world, 'notifications')
    await wait(900)
    world.settings = demoSettings()
    world.settings.scroll = 230
    await key('⌘ ,')
    await wait(900)
    zoom([640, 400], 1.15)
    await click('settings:site')
    world.settings.sheet = 'site'
    world.settings.sites.push({ host: 'github.com', permission: 'Notifications', value: 'Block' })
    await move([900, 610])
    await wait(2400)
    zoom(null)
  },
})
