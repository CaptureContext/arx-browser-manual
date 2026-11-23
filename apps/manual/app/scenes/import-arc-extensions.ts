import type { ArxForm } from '~/utils/arxModel'
import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, sheet } from './helpers'
import { welcome, WINDOW } from './import-parts'

const review = (name: string, publisher: string, at: number, left: number, can: string[]): ArxForm => ({
  id: 'review',
  icon: { kind: 'symbol', name: 'box' },
  title: `Add “${name}”?`,
  subtitle: `${publisher} · ${at} of 3 from Arc · into Personal`,
  sections: [
    { header: 'It can', rows: can.map(label => ({ label, icon: 'shield-01' })) },
    { rows: [{ label: 'Details: version, ID, verified package', icon: 'chevron-right' }] },
  ],
  note: 'Install All adds the rest without showing each one, with the permissions each asks for.',
  buttons: [{ label: 'Skip All', left: true, plain: true }, { label: 'Skip', hint: 'esc' }, { label: `Install All (${left})` }, { label: 'Install', primary: true }],
})

export default defineArxScene({
  caption: 'With Arc picked, the Extensions row says how many come from the Chrome Web Store. After Bring from Arc, Arx reviews them one at a time: Install adds the first, and Install All adds the rest without showing each one.',
  setup(world) {
    world.overlays.push({ kind: 'form', form: welcome('Arc', [
      { label: '14 favorites', icon: 'star', toggle: true },
      { label: '48 bookmarks and pinned tabs (folders: 9)', icon: 'pin', toggle: true },
      { label: '23 open tabs', icon: 'app-window-list', toggle: true },
      { label: '6,804 history entries', icon: 'clock', toggle: true },
      { label: '4 extensions', icon: 'box', detail: '3 from the Chrome Web Store, each reviewed before it installs.', toggle: true },
      { label: 'Keep its spaces', icon: 'app-window-grid-2x2', detail: 'Each of its spaces comes in as a space of its own.', toggle: true },
    ]), ...WINDOW })
  },
  async run(context) {
    const { world, wait, click, move } = context
    const overlay = world.overlays[0]
    if (overlay?.kind !== 'form') return
    const form = overlay.form
    await wait(900)
    await move('row:6,804 history entries')
    await wait(700)
    await move('row:4 extensions')
    await wait(1600)
    await click('form:Bring from Arc')
    form.note = undefined
    form.sections = [{ rows: [{ label: 'Bringing everything from Arc…', progress: .1, button: 'Cancel' }] }]
    form.buttons = [{ label: 'Continue', disabled: true }]
    await wait(200)
    form.sections[0]!.rows[0]!.progress = 1
    await wait(1100)
    form.sections = [
      { rows: [{ label: 'Everything you chose came over from Arc.', icon: 'check-circle', tone: 'green', detail: 'Items brought over: 6,889' }] },
      { rows: [{ label: 'Installing extensions from the Chrome Web Store: 1 of 3', spinner: true, button: 'Skip All' }] },
    ]
    form.buttons = [{ label: 'Start Fresh', plain: true }, { label: 'Continue', primary: true }]
    await wait(900)
    sheet(world, review('Dark Reader', 'Dark Reader Ltd', 1, 3, ['Read and change your data on all websites']), { width: 520, dim: true })
    await move([760, 330])
    await wait(2400)
    await click('form:Install')
    closeSheet(world, 'review')
    form.sections[1]!.rows[0]!.label = 'Installing extensions from the Chrome Web Store: 2 of 3'
    await wait(700)
    sheet(world, review('Refined GitHub', 'Refined GitHub', 2, 2, ['Read and change your data on github.com']), { width: 520, dim: true })
    await wait(1800)
    await click('form:Install All (2)')
    closeSheet(world, 'review')
    form.sections[1]!.rows[0]!.label = 'Installing extensions from the Chrome Web Store: 3 of 3'
    await wait(1000)
    form.sections[1]!.rows = [{ label: 'Extensions installed: 3', icon: 'box' }]
    form.note = 'Reinstall these extensions yourself: My Local Tools.'
    await move('row:Extensions installed: 3')
    await wait(2800)
  },
})
