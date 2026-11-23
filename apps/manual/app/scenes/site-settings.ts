import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { pick } from './helpers'

export default defineArxScene({
  caption: 'In a profile\'s Site Settings, block notifications by default, allow meet.google.com the camera, and zoom every page to 110%.',
  setup(world) {
    world.settings = demoSettings()
  },
  async run(context) {
    const { world, click, wait, type, zoom, move } = context
    const settings = world.settings!
    zoom([640, 400], 1.15)
    await wait(600)
    await click('settings:site')
    settings.sheet = 'site'
    await wait(1100)
    await click('default:Notifications')
    await pick(context, [{ label: 'Allow' }, { label: 'Block' }, { label: 'Ask', checked: true }], 'Block')
    settings.defaults.find(row => row.label === 'Notifications')!.value = 'Block'
    await wait(900)
    await click('add-site')
    settings.addSite = { text: '' }
    await wait(700)
    await type('meet.google.com', (value) => { settings.addSite!.text = value })
    await wait(500)
    await click('add-site:add')
    settings.addSite = null
    settings.sites.push({ host: 'meet.google.com', permission: 'Camera', value: 'Allow' })
    await wait(1100)
    await click('default-zoom')
    await pick(context, [{ label: '90%' }, { label: '100%', checked: true }, { label: '110%' }, { label: '125%' }], '110%')
    settings.defaultZoom = '110%'
    await move([900, 600])
    await wait(1800)
  },
})
