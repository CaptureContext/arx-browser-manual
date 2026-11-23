import { defineArxScene } from '~/utils/arxScene'
import { closeSheet, flip } from './helpers'
import { assistant, WINDOW } from './import-parts'

export default defineArxScene({
  caption: 'From Settings → Advanced → Import…, turn on Clear Arx Data First. Arx lists everything it will remove and asks once; Remove and Continue clears it, every window moves to one new, empty space, and the review opens against the clean Arx.',
  setup(world) {
    world.overlays.push({ kind: 'form', form: assistant('Arc', ['Favorites', 'Bookmarks', 'Open Tabs', 'History'], true), ...WINDOW })
  },
  async run(context) {
    const { world, wait, click, move } = context
    const overlay = world.overlays[0]
    if (overlay?.kind !== 'form') return
    const form = overlay.form
    await wait(1000)
    await flip(context, form, 'Clear Arx Data First')
    await wait(600)
    await click('form:Continue')
    form.trailing = undefined
    form.sections = [{
      header: 'Remove Everything in Arx?',
      rows: [
        { label: 'Profiles', detail: 'Personal, Shops and Work', value: '3' },
        { label: 'Spaces', value: '3' },
        { label: 'Tabs, favorites and pinned tabs', value: '34' },
        { label: 'Each profile\'s saved passwords, sign-ins, history, extensions and site data' },
      ],
      footer: 'These are removed for good before the import starts, and Arx keeps one new, empty profile. This can\'t be undone. The other browser isn\'t changed.',
    }]
    form.buttons = [{ label: 'Back' }, { label: 'Remove and Continue', danger: true }]
    await move([640, 300])
    await wait(3400)
    await click('form:Remove and Continue')
    form.sections = [{ rows: [{ label: 'Clearing Arx…', spinner: true }] }]
    form.buttons = []
    await wait(900)
    // Every window moves to the one new, empty profile and space, both named Default.
    world.spaces = [{ id: 'default', name: 'Default', icon: 'house', profile: 'Default', favorites: [], pinned: [], open: [] }]
    world.space = 0
    world.selected = null
    world.homepage = { tip: 1, total: 99, text: 'Press ⌘T to open a new tab. Type part of a site\'s name and pick it from the list, or press Return to search.', turn: 0 }
    overlay.dim = false
    await wait(2200)
    form.sections = [{ rows: [{ label: 'Reading the source…', spinner: true }] }]
    form.buttons = [{ label: 'Cancel' }]
    await wait(1200)
    form.sections = [
      {
        header: 'Profiles',
        rows: [{ label: 'Personal', popup: 'New profile' }, { label: 'Work', popup: 'New profile' }],
        footer: 'Each Arc profile becomes a new Arx profile with the name you give it, or joins one you already have. Its spaces come along as new spaces, and its passwords and sign-ins follow it.',
      },
      { header: 'Favorites', rows: [{ label: 'New', value: '14' }] },
      { header: 'Bookmarks', rows: [{ label: 'New', value: '48' }] },
    ]
    form.buttons = [{ label: 'Back' }, { label: 'Import', primary: true, hint: '↩' }]
    await wait(2200)
    await click('form:Import')
    form.sections = [{ rows: [{ label: 'Importing…', progress: .1 }] }]
    form.buttons = [{ label: 'Cancel' }]
    await wait(200)
    form.sections[0]!.rows[0]!.progress = 1
    await wait(1100)
    form.sections = [{ rows: [{ label: 'Import finished.', icon: 'check-circle', tone: 'green' }] }, { header: 'Favorites', rows: [{ label: 'Imported', value: '14' }] }, { header: 'Bookmarks', rows: [{ label: 'Imported', value: '48' }] }]
    form.buttons = [{ label: 'Done', primary: true, hint: '↩' }]
    await wait(2200)
    closeSheet(world, 'assistant')
  },
})
