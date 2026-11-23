import { demoSettings } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, sheet } from './helpers'
import { extensionsSheet, reviewSheet } from './extension-parts'

export default defineArxScene({
  caption: 'An update that asks for more permissions waits: its row says Update needs review. Click the mark to see the new version and what it asks for. Cancel keeps the version you have, and Arx doesn\'t ask about that version again.',
  setup(world) {
    world.space = 2
    world.settings = demoSettings()
    world.settings.pane = 'custom'
    world.settings.custom = { pane: 'Profiles', title: 'Work', subtitle: 'Profiles', sections: [] }
    const form = extensionsSheet('Work', '3.2.1')
    Object.assign(form.aside![1]!, { warning: 'Update needs review', mark: true })
    form.sections[0]!.rows.push({ label: 'Version 3.3.0 is on the Chrome Web Store and asks for more permissions. Arx didn’t install it.', button: 'Review Update…' })
    world.overlays.push({ kind: 'form', form, width: 760, height: 560, dim: true })
  },
  async run(context) {
    const { world, wait, click, move } = context
    const overlay = world.overlays[0]
    if (overlay?.kind !== 'form') return
    const extensions = overlay.form
    await wait(900)
    await move('item:Focus Reader')
    await wait(1100)
    await click('mark:Focus Reader')
    await wait(500)
    sheet(world, reviewSheet('update', '3.3.0', 'Work'), { width: 640, height: 580, dim: true })
    await move([820, 330])
    await wait(2800)
    await click('form:Cancel')
    closeSheet(world, 'review')
    await wait(400)
    Object.assign(extensions.aside![1]!, { warning: undefined, mark: false })
    extensions.sections[0]!.rows.pop()
    extensions.lead = 'Updates you didn\'t install: 1. They\'re offered again next time.'
    await move('row:Version')
    await wait(2600)
  },
})
