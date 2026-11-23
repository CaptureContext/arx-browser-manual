import { demoSettings, openTab } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { hide, show } from './helpers'

const installed = [
  { title: 'uBlock Origin Lite', detail: '2025.11 · On' },
  { title: '1Password', detail: '8.11 · On' },
]

export default defineArxScene({
  caption: 'From the Extensions sheet, open the Chrome Web Store and click Add to Arx. Arx reviews the extension\'s version, package hash and permissions before it installs.',
  setup(world) {
    world.settings = demoSettings()
  },
  async run(context) {
    const { world, wait, click, move } = context
    await wait(600)
    await click('settings:extensions')
    show(world, { kind: 'dialog', id: 'extensions', dim: true, width: 420, title: 'Extensions', subtitle: 'Personal', list: installed, buttons: [{ label: 'Chrome Web Store' }, { label: 'Done', primary: true }] })
    await wait(1200)
    await click('dialog:Chrome Web Store')
    hide(world, 'extensions')
    world.settings = null
    openTab(world, 'store')
    await wait(1200)
    await click('store:add')
    show(world, {
      kind: 'dialog', id: 'review', dim: true, width: 440,
      icon: { kind: 'letter', letter: 'F', bg: '#5a52d6', fg: '#fff' },
      title: 'Add “Focus Reader”?', subtitle: 'From the Chrome Web Store',
      rows: [{ label: 'Version', value: '3.2.1' }, { label: 'Package hash', value: 'sha256:9f2c…41ab' }],
      list: [{ title: 'Read and change data on all sites' }, { title: 'Store data on this Mac' }],
      buttons: [{ label: 'Cancel' }, { label: 'Install', primary: true }],
    })
    await wait(2200)
    await click('dialog:Install')
    hide(world, 'review')
    const page = world.tabs.store!.page
    if (page.kind === 'store') page.installed = true
    await wait(1200)
    show(world, { kind: 'dialog', id: 'extensions', dim: true, width: 420, title: 'Extensions', subtitle: 'Personal', list: [...installed, { title: 'Focus Reader', detail: '3.2.1 · On', badge: 'New' }], buttons: [{ label: 'Done', primary: true }] })
    await move([760, 600])
    await wait(2000)
  },
})
