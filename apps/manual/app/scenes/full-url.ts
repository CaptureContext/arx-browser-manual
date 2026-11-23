import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: 'Turn on Show the full URL in the toolbar, and the address bar shows the whole address. Turn it off, and it shows the site\'s name again.',
  setup(world) {
    world.selected = 'browser'
    world.settings = demoSettings()
    world.settings.scroll = 0
  },
  async run(context) {
    const { world, wait, click, key, zoom } = context
    const settings = world.settings!
    const toggle = async (on: boolean) => {
      zoom([640, 300], 1.3)
      await click('setting:full-url')
      settings.fullUrl = on
      await wait(900)
      zoom(null)
      await key('⌘ W')
      world.settings = null
      world.fullUrl = on
      zoom([150, 60], 2)
      await wait(2200)
      zoom(null)
    }
    await wait(700)
    await toggle(true)
    await key('⌘ ,')
    world.settings = settings
    await wait(800)
    await toggle(false)
  },
})
