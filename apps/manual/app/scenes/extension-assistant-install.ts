import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, sheet } from './helpers'
import { details, extensionsSheet, reviewSheet } from './extension-parts'

export default defineArxScene({
  caption: 'An assistant granted the Work profile asks to install an extension. Arx opens Work\'s Extensions sheet with the usual review, and a line at the top names the assistant. Nothing installs until you click Install; the sheet then selects the new extension.',
  setup(world) {
    world.space = 2
  },
  async run(context) {
    const { world, wait, click, move } = context
    await wait(900)
    world.settings = demoSettings()
    world.settings.pane = 'custom'
    world.settings.custom = { pane: 'Profiles', title: 'Work', subtitle: 'Profiles', sections: [{ header: 'Your Data and Settings', rows: [{ label: 'Site Settings', icon: 'shield-01' }, { label: 'Passwords', icon: 'lock' }, { label: 'Extensions', icon: 'box' }] }] }
    await wait(500)
    const extensions = sheet(world, extensionsSheet('Work', null), { width: 760, height: 560, dim: true })
    await wait(500)
    sheet(world, reviewSheet('install', '3.2.1', 'Work', 'Claude Code'), { width: 640, height: 540, dim: true })
    await move([820, 300])
    await wait(3200)
    await click('form:Install')
    closeSheet(world, 'review')
    await wait(500)
    extensions.aside![0]!.selected = false
    extensions.aside!.push({ title: 'Focus Reader', detail: 'Enabled', color: '#5a52d6', selected: true })
    extensions.sections = [details('Focus Reader', '3.2.1')]
    await move('item:Focus Reader')
    await wait(2400)
  },
})
