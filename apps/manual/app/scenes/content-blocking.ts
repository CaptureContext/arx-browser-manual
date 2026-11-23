import { demoSettings, openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'

export default defineArxScene({
  caption: 'Block cookie banners is in Settings → General → Content blocking: with it on, the news site\'s cookie banner doesn\'t appear. To see a site with its ads, turn Block ads and trackers off for it in the site menu and reload; turn it back on the same way.',
  setup(world) {
    world.settings = demoSettings()
    world.settings.pane = 'custom'
    world.settings.custom = {
      pane: 'General', title: 'General',
      sections: [{
        header: 'Content blocking',
        rows: [
          { label: 'Block ads and trackers', toggle: true },
          { label: 'Block cookie banners', detail: 'Hides cookie consent pop-ups with EasyList\'s and uBlock Origin\'s cookie lists. If a site stops working, turn content blocking off for it in the site menu.', toggle: false },
          { label: 'Filter lists and advanced settings', button: 'Open uBlock Origin' },
        ],
        footer: 'Uses uBlock Origin, built into Arx, in every profile and in private windows. Its filter lists update straight from the people who publish them.',
      }],
    }
  },
  async run(context) {
    const { world, wait, click, key, move, zoom } = context
    const page = world.tabs.news!.page
    if (page.kind !== 'news') return
    zoom([700, 260], 1.25)
    await wait(700)
    await click('switch:Block cookie banners')
    world.settings!.custom!.sections[0]!.rows[1]!.toggle = true
    await wait(1300)
    zoom(null)
    world.settings = null
    openTab(world, 'news')
    await move([820, 640])
    await wait(2200)
    zoom([200, 330], 1.5)
    await click('site-info')
    const menu = world.siteMenu = {
      host: 'dailyledger.example', confirmClear: false, blocking: true,
      permissions: [
        { label: 'Camera', icon: 'video', value: 'Ask' },
        { label: 'Microphone', icon: 'microphone', value: 'Ask' },
        { label: 'Notifications', icon: 'bell', value: 'Ask' },
      ],
    }
    await wait(1100)
    await click('blocking:switch')
    world.siteMenu!.blocking = false
    await wait(1200)
    await key('⌘ R')
    world.siteMenu = null
    zoom(null)
    page.ads = true
    await move([1040, 330])
    await wait(2400)
    await click('site-info')
    world.siteMenu = { ...menu, blocking: false }
    await wait(700)
    await click('blocking:switch')
    world.siteMenu.blocking = true
    await wait(900)
    await key('⌘ R')
    world.siteMenu = null
    page.ads = false
    await move([820, 500])
    await wait(1800)
  },
})
