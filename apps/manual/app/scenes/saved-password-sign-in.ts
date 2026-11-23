import { ICON, openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

export default defineArxScene({
  caption: 'An assistant signs in with a saved password only after you approve: the prompt names the site and the account, and can let it sign in to that site without asking next time.',
  setup(world) {
    openTab(world, 'signin')
  },
  async run(context) {
    const { world, wait, click } = context
    const page = world.tabs.signin!.page
    if (page.kind !== 'signin') return
    await wait(700)
    const dialog = show(world, {
      kind: 'dialog', id: 'saved', dim: true, width: 430,
      icon: { kind: 'brand', name: 'brand-anthropic', color: '#d97757' },
      title: 'Sign in with a saved password', subtitle: 'Claude Code wants to sign in',
      list: [{ title: 'github.com', detail: 'max@capturecontext.dev', icon: ICON.github }],
      rows: [{ label: 'Let agents sign in to github.com without asking', toggle: false }],
      buttons: [{ label: 'Deny' }, { label: 'Approve', primary: true }],
    })
    await wait(1500)
    await click('row:Let agents sign in to github.com without asking')
    dialog.rows![0]!.toggle = true
    await wait(900)
    await click('dialog:Approve')
    hide(world, 'saved')
    page.user = 'max@capturecontext.dev'
    await wait(250)
    page.password = 'river-maple-42'
    await wait(500)
    page.signedIn = true
    await wait(1800)
  },
})
