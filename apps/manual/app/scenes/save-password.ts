import { openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'Sign in on a site, and Arx offers to save the password for that exact address, with the username. Save keeps it in the profile\'s Passwords.',
  setup(world) {
    openTab(world, 'signin')
  },
  async run(context) {
    const { world, wait, click, type, zoom } = context
    const page = world.tabs.signin!.page
    if (page.kind !== 'signin') return
    zoom([780, 330], 1.35)
    await click('signin:user')
    await type('max-krouk', (value) => { page.user = value })
    await click('signin:password')
    await type('river-maple-42', (value) => { page.password = value }, { cps: 22 })
    await click('signin:submit')
    zoom(null)
    show(world, {
      kind: 'dialog', id: 'save', at: [14, 84], width: 330,
      icon: { kind: 'symbol', name: 'key' },
      title: 'Save password for https://github.com?',
      fields: [{ label: 'Username', value: 'max-krouk' }, { label: 'Password', value: 'river-maple-42', secure: true }],
      buttons: [{ label: 'Never' }, { label: 'Not Now' }, { label: 'Save', primary: true }],
    })
    await wait(1700)
    await click('dialog:Save')
    hide(world, 'save')
    page.signedIn = true
    await wait(1800)
  },
})
