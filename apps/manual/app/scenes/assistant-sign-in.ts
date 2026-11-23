import { ICON, openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'An assistant asks you to sign in: Arx names the exact site, pauses every assistant while you type, and asks before handing the tab back, with the assistant\'s access kept.',
  setup(world) {
    openTab(world, 'signin')
  },
  async run(context) {
    const { world, wait, click, type, move, zoom } = context
    const page = world.tabs.signin!.page
    if (page.kind !== 'signin') return
    await wait(600)
    show(world, {
      kind: 'dialog', id: 'request', dim: true, width: 440,
      icon: { kind: 'brand', name: 'brand-anthropic', color: '#d97757' },
      title: 'Assistant requests your sign-in', subtitle: 'Claude Code',
      body: 'Claude Code needs you to sign in. While you do, every assistant pauses and can\'t see the page.',
      list: [{ title: 'https://github.com', detail: 'The exact site it asked for', icon: ICON.github }],
      buttons: [{ label: 'Deny' }, { label: 'Pause assistants and continue', primary: true }],
    })
    await wait(1600)
    await click('dialog:Pause assistants and continue')
    hide(world, 'request')
    show(world, { kind: 'banner', text: 'Assistants are paused while you sign in', action: 'Done' })
    zoom([780, 330], 1.35)
    await click('signin:user')
    await type('max-krouk', (value) => { page.user = value })
    await click('signin:password')
    await type('river-maple-42', (value) => { page.password = value }, { cps: 22 })
    await click('signin:submit')
    page.signedIn = true
    await wait(1100)
    zoom(null)
    await click('banner:action')
    show(world, {
      kind: 'dialog', id: 'unlock', dim: true, width: 420,
      title: 'End the privacy lock?', body: 'Assistants can see this tab again.',
      rows: [{ label: 'Keep Claude Code\'s access to github.com', toggle: true }],
      buttons: [{ label: 'Keep Paused' }, { label: 'End Privacy Lock', primary: true }],
    })
    await wait(1300)
    await click('dialog:End Privacy Lock')
    world.overlays = []
    await move([760, 520])
    await wait(1500)
  },
})
