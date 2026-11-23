import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'Choose a profile\'s download folder: files land there. Turn on Ask where to save each file, and a save panel opens for the next download.',
  setup(world) {
    world.selected = 'browser'
    world.settings = demoSettings()
  },
  async run(context) {
    const { world, wait, click, key, zoom, move } = context
    const settings = world.settings!
    zoom([640, 330], 1.25)
    await wait(700)
    await click('setting:change-folder')
    const panel = show(world, { kind: 'panel', title: 'Choose a folder for downloads', items: ['Desktop', 'Documents', 'Downloads', 'Projects'], selected: 2, action: 'Choose' })
    await wait(700)
    await click('panel:Desktop')
    panel.selected = 0
    await wait(500)
    await click('panel:Choose')
    hide(world, 'panel')
    settings.downloadsFolder = 'Desktop'
    await wait(900)
    zoom(null)
    await key('⌘ W')
    world.settings = null
    await wait(600)
    await click('link:download')
    show(world, { kind: 'download', file: 'Web browser.pdf', folder: 'Desktop' })
    await wait(1800)
    hide(world, 'download')
    await key('⌘ ,')
    world.settings = settings
    await wait(700)
    await click('setting:ask')
    settings.askWhereToSave = true
    await wait(700)
    await key('⌘ W')
    world.settings = null
    await wait(500)
    await click('link:download')
    world.saveSheet = { name: 'Web browser.pdf' }
    await wait(1800)
    await click('save:cancel')
    world.saveSheet = null
    await move([760, 520])
    await wait(1000)
  },
})
