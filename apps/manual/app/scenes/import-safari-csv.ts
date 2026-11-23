import { defineArxScene } from '~/utils/arxScene'
import { flip, hide, show } from './helpers'
import { assistant, WINDOW } from './import-parts'

export default defineArxScene({
  caption: 'Safari\'s passwords live in the Passwords app, so they come in from a CSV file you export there. Choose Use CSV files instead, pick the file next to its profile, and import: Arx says how many it imported, already had, and skipped.',
  setup(world) {
    world.overlays.push({ kind: 'form', form: assistant('Safari', ['Favorites', 'Bookmarks', 'Open Tabs', 'History']), ...WINDOW })
  },
  async run(context) {
    const { world, wait, click, move } = context
    const overlay = world.overlays[0]
    if (overlay?.kind !== 'form') return
    const form = overlay.form
    await wait(900)
    await flip(context, form, 'Passwords and sign-ins')
    await click('form:Continue')
    form.trailing = undefined
    form.sections = [
      { header: 'Profiles', rows: [{ label: 'Personal', popup: 'Personal' }] },
      {
        header: 'Passwords and sign-ins',
        rows: [{ label: 'Straight from Safari, after the import. macOS asks first, and you choose what moves for each profile.' }, { label: '', link: 'Use CSV files instead' }],
        footer: 'Arx reads Safari\'s sign-ins with the Full Disk Access you gave it. Safari\'s passwords are in the Passwords app: export them there and import the file afterwards.',
      },
      { header: 'Bookmarks', rows: [{ label: 'New', value: '112' }] },
    ]
    form.buttons = [{ label: 'Back' }, { label: 'Import', primary: true, hint: '↩' }]
    await wait(2000)
    await click('act:Use CSV files instead')
    const passwords = form.sections[1]!
    passwords.rows = [{ label: 'Import passwords from a file instead of the keychain.' }, { label: 'Personal', detail: 'No file', button: 'Choose…' }]
    passwords.footer = 'Export your passwords from Safari as a CSV file, then choose it here. Sign-ins don\'t move this way. Afterwards, move the file to the Bin: it holds your passwords unencrypted.'
    form.buttons[1]!.disabled = true
    await wait(1800)
    await click('act:Choose…')
    const panel = show(world, { kind: 'panel', title: 'Choose a CSV file of passwords', items: ['Desktop', 'Documents', 'Passwords.csv'], selected: 0, action: 'Open' })
    await wait(600)
    await click('panel:Passwords.csv')
    panel.selected = 2
    await wait(400)
    await click('panel:Open')
    hide(world, 'panel')
    Object.assign(passwords.rows[1]!, { detail: 'Passwords.csv', button: 'Remove' })
    form.buttons[1]!.disabled = false
    await wait(1100)
    await click('form:Import')
    form.sections = [{ rows: [{ label: 'Importing…', progress: .1 }] }]
    form.buttons = [{ label: 'Cancel' }]
    await wait(200)
    form.sections[0]!.rows[0]!.progress = 1
    await wait(1000)
    form.title = 'Passwords and Sign-ins'
    form.sections = [{ rows: [{ label: 'Importing passwords and sign-ins…', spinner: true }] }]
    form.buttons = []
    await wait(1100)
    form.sections = [{ header: 'Personal', rows: [{ label: 'Imported', value: '41' }, { label: 'Already saved in Arx', value: '6' }, { label: 'Skipped', value: '2' }] }]
    form.buttons = [{ label: 'Done', primary: true, hint: '↩' }]
    await move('row:Already saved in Arx')
    await wait(3000)
  },
})
