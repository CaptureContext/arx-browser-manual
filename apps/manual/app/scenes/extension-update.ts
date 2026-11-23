import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, sheet } from './helpers'
import { extensionsSheet, reviewSheet } from './extension-parts'

export default defineArxScene({
  caption: 'Check for Updates asks the Chrome Web Store about this profile\'s extensions right away. This update wants one more permission, so its review comes first; after Update, the sheet says how many were updated and the extension\'s details show the new version.',
  setup(world) {
    world.space = 2
    world.settings = demoSettings()
    world.settings.pane = 'custom'
    world.settings.custom = { pane: 'Profiles', title: 'Work', subtitle: 'Profiles', sections: [] }
    world.overlays.push({ kind: 'form', form: extensionsSheet('Work', '3.2.1'), width: 760, height: 560, dim: true })
  },
  async run(context) {
    const { world, wait, click, move } = context
    const overlay = world.overlays[0]
    if (overlay?.kind !== 'form') return
    const extensions = overlay.form
    await wait(1000)
    await click('tool:updates')
    extensions.tools![1]!.spinning = true
    await wait(1300)
    extensions.tools![1]!.spinning = false
    sheet(world, reviewSheet('update', '3.3.0', 'Work'), { width: 640, height: 580, dim: true })
    await move([820, 330])
    await wait(2800)
    await click('form:Update')
    closeSheet(world, 'review')
    await wait(400)
    extensions.lead = 'Updated from the Chrome Web Store: 1.'
    extensions.sections[0]!.rows[0]!.value = '3.3.0'
    await move('row:Version')
    await wait(2600)
  },
})
