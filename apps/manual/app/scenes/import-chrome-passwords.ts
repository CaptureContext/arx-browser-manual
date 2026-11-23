import { defineArxScene } from '~/utils/arxScene'
import { flip, hide, pick, show, touchID } from './helpers'
import { assistant, WINDOW } from './import-parts'

const MAP = [{ label: 'New profile', checked: true }, { separator: true }, { label: 'Personal' }, { label: 'Shops' }, { label: 'Work' }]
const KEY = 'macOS asks to use “Chrome Safe Storage” next. Choose Allow Once.'

export default defineArxScene({
  caption: 'Passwords and sign-ins move straight from Chrome, after the rest of the import. Arx explains what macOS will ask, you allow it once, then choose what moves for each profile. The report says where you stayed signed in, and Undo Import takes back exactly what it added.',
  setup(world) {
    world.overlays.push({ kind: 'form', form: assistant('Google Chrome', ['Bookmarks', 'History']), ...WINDOW })
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
      { header: 'Profiles', rows: [{ label: 'Person 1', popup: 'New profile' }, { label: 'Work', popup: 'New profile' }] },
      {
        header: 'Passwords and sign-ins',
        rows: [{ label: 'Straight from Google Chrome, after the import. macOS asks first, and you choose what moves for each profile.' }, { label: '', link: 'Use CSV files instead' }],
        footer: KEY,
      },
      { header: 'Bookmarks', rows: [{ label: 'New', value: '212' }] },
    ]
    form.buttons = [{ label: 'Back' }, { label: 'Import', primary: true, hint: '↩' }]
    await wait(1000)
    const profiles = form.sections[0]!.rows
    await click('popup:Person 1')
    await pick(context, MAP, 'Personal', { leftward: true })
    profiles[0]!.popup = 'Personal'
    await wait(500)
    await click('popup:Work')
    await pick(context, MAP, 'Work', { leftward: true })
    profiles[1]!.popup = 'Work'
    await wait(900)
    await click('form:Import')
    form.sections = [{ rows: [{ label: 'Importing…', progress: .1 }] }]
    form.buttons = [{ label: 'Cancel' }]
    await wait(200)
    form.sections[0]!.rows[0]!.progress = 1
    await wait(1000)
    form.title = 'Passwords and Sign-ins'
    form.lead = 'Bring Google Chrome\'s saved passwords and sign-ins into the Arx profiles below. You choose what moves first.'
    form.sections = [{ header: 'Profiles', rows: [{ label: 'Person 1', value: 'Personal' }, { label: 'Work', value: 'Work' }], footer: KEY }]
    form.buttons = [{ label: 'Skip' }, { label: 'Use CSV Files Instead' }, { label: 'Continue', primary: true, hint: '↩' }]
    await move([640, 330])
    await wait(3000)
    await click('form:Continue')
    form.lead = undefined
    form.sections = [{ rows: [{ label: 'Reading passwords and sign-ins…', spinner: true }] }]
    form.buttons = []
    await touchID(context, 'Arx is trying to read the passwords and sign-ins saved in Google Chrome.')
    show(world, {
      kind: 'dialog', id: 'keychain', dim: true, width: 400, icon: { kind: 'symbol', name: 'key' },
      title: 'Arx wants to use your confidential information stored in “Chrome Safe Storage” in your keychain.',
      buttons: [{ label: 'Deny' }, { label: 'Allow Once', primary: true }],
    })
    await wait(1800)
    await click('dialog:Allow Once')
    hide(world, 'keychain')
    await wait(500)
    form.sections = [
      { header: 'Person 1 → Personal', rows: [{ label: 'Saved Passwords', detail: '38 passwords', toggle: true }] },
      {
        header: 'Sign-ins',
        rows: [{ label: '', link: 'Select All' }, { label: 'github.com', toggle: true }, { label: 'figma.com', toggle: true }, { label: 'news.ycombinator.com', toggle: true }, { label: 'bank.example', detail: 'Session only, can\'t move', toggle: false, dim: true }],
        footer: 'Copies each site’s cookies. A site may sign you out of one browser; Arx lists any that need you to sign in again.',
      },
    ]
    form.buttons = [{ label: 'Skip' }, { label: 'Import', primary: true, hint: '↩' }]
    await wait(1200)
    await flip(context, form, 'news.ycombinator.com')
    await wait(700)
    await click('form:Import')
    form.sections = [{ rows: [{ label: 'Importing passwords and sign-ins…', spinner: true }] }]
    form.buttons = []
    await wait(1300)
    form.sections = [
      { header: 'Person 1 → Personal', rows: [{ label: 'Imported', value: '35' }, { label: 'Already saved in Arx', value: '3' }, { label: 'Skipped', value: '0' }] },
      { header: 'Sign-ins', rows: [{ label: 'github.com', value: 'Signed in' }, { label: 'figma.com', detail: 'Some of its cookies couldn\'t be read', value: 'Sign in again', tone: 'orange' }] },
      { header: 'Work → Work', rows: [{ label: 'Imported', value: '12' }, { label: 'Already saved in Arx', value: '0' }] },
    ]
    form.buttons = [{ label: 'Undo Import' }, { label: 'Done', primary: true, hint: '↩' }]
    await move([640, 300])
    await wait(3200)
    await click('form:Undo Import')
    form.sections = [{ rows: [{ label: 'Undoing…', spinner: true }] }]
    form.buttons = []
    await wait(1000)
    form.sections = []
    form.lead = 'The passwords and sign-ins from this import were removed.'
    form.buttons = [{ label: 'Done', primary: true, hint: '↩' }]
    await wait(2400)
  },
})
